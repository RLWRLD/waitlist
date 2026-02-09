# Supabase Setup Guide — RLDX Waitlist

이 가이드를 따르면 Supabase 계정이 바뀌더라도 처음부터 다시 세팅할 수 있습니다.

## Overview

- **목적**: RLDX Early Access 웨이트리스트 폼 데이터 저장
- **구조**: 핵심 필드는 개별 컬럼 + 전체 폼 응답은 JSONB
- **보안**: INSERT만 허용 (RLS)
- **프론트엔드**: 순수 JS, Supabase REST API 직접 호출 (SDK 불필요)

---

## Step 1: Supabase 프로젝트 생성

1. https://supabase.com 가입 (GitHub 로그인 가능)
2. **New Project** 클릭
3. 설정:
   - **Project name**: `rlwrld-waitlist` (자유롭게)
   - **Database password**: 안전하게 저장 (다시 볼 수 없음)
   - **Region**: 글로벌 → `US East`, 아시아 위주 → `Northeast Asia (Seoul)`
4. 프로비저닝 완료 대기 (~2분)

---

## Step 2: 테이블 생성

Supabase 대시보드 > **SQL Editor**에서 실행:

```sql
-- 1. 웨이트리스트 테이블 생성
CREATE TABLE public.waitlist (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  email text NOT NULL,
  full_name text,
  organization text,
  country text,
  social_profile text,
  form_data jsonb
);

-- 2. 이메일 중복 방지
CREATE UNIQUE INDEX waitlist_email_unique ON public.waitlist (email);

-- 3. 정렬용 인덱스
CREATE INDEX waitlist_created_at_idx ON public.waitlist (created_at DESC);
```

### 컬럼 설명

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | bigint (자동) | Primary key |
| `created_at` | timestamptz (자동) | 제출 시각 |
| `email` | text, unique | 이메일 (중복 방지 키) |
| `full_name` | text | 이름 |
| `organization` | text | 소속 |
| `country` | text | 국가 코드 (US, KR, JP 등) |
| `social_profile` | text, nullable | X 또는 LinkedIn URL |
| `form_data` | jsonb | **폼 전체 응답 JSON** (affiliation, robotType, useCase 등 모든 필드) |

---

## Step 3: 보안 설정 (RLS + GRANT)

**반드시 아래를 한 블록으로 전부 실행하세요.** 하나라도 빠지면 API 호출 시 401 에러가 납니다.

```sql
-- 1. RLS 활성화
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 2. anon 역할에 INSERT 허용 정책 생성
--    주의: 반드시 TO anon을 명시해야 함 (TO public이나 생략하면 작동 안 할 수 있음)
CREATE POLICY "Allow anon insert"
  ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 3. anon 역할에 테이블 권한 부여
--    SQL Editor로 만든 테이블은 자동 GRANT가 안 되므로 반드시 직접 해야 함
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.waitlist TO anon;

-- 4. 시퀀스 권한 (id 자동 생성에 필요)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 5. PostgREST 캐시 새로고침 (정책 변경 후 반드시 실행)
NOTIFY pgrst, 'reload schema';
```

### 보안 요약

| 작업 | anon key (프론트엔드) | Dashboard / service_role |
|---|---|---|
| INSERT | **허용** | 허용 |
| SELECT | **차단** | 허용 |
| UPDATE | **차단** | 허용 |
| DELETE | **차단** | 허용 |

### 주의사항

- `anon` key (`eyJ...` 형식)는 프론트엔드에 노출해도 안전 — INSERT만 가능
- `service_role` key는 **절대** 프론트엔드 코드에 넣지 말 것
- `sb_publishable_` 형식의 새 키는 REST API와 호환 안 됨 — 반드시 JWT 형식 `anon` key 사용
- 데이터 조회/내보내기는 Supabase Dashboard (Table Editor)에서만

---

## Step 4: API 키 가져오기

1. Supabase 대시보드 > **Project Settings** (톱니바퀴) > **API**
2. 아래 두 값을 복사:

| 항목 | 위치 | 형식 |
|---|---|---|
| **Project URL** | 상단 "Project URL" | `https://xxxxx.supabase.co` |
| **anon key** | "Project API keys" > `anon` `public` | `eyJhbGciOiJIUzI1NiIs...` (JWT 형식) |

> **주의**: Supabase가 새 키 형식(`sb_publishable_`)으로 마이그레이션 중이지만,
> REST API는 JWT 형식의 `anon` key만 지원합니다. `eyJ...`로 시작하는 키를 사용하세요.

---

## Step 5: 프론트엔드 코드에 적용

`index.html`의 `<script>` 블록 안에서 아래 두 줄을 찾아 값을 교체:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';   // ← Project URL
const SUPABASE_ANON_KEY = 'eyJ...YOUR_ANON_KEY_HERE...';      // ← anon key (JWT)
```

### 프론트엔드 코드가 사용하는 API 호출 형식

```javascript
await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'    // ← 반드시 return=minimal 사용
    },
    body: JSON.stringify({
        email: '...',
        full_name: '...',
        organization: '...',
        country: '...',
        social_profile: '...',
        form_data: { /* 전체 폼 데이터 */ }
    })
});
```

> **중요**: `Prefer` 헤더는 반드시 `return=minimal`이어야 합니다.
> `return=representation`을 쓰면 INSERT 후 자동으로 SELECT가 실행되는데,
> SELECT 정책이 없으므로 401 에러가 발생합니다.

### 응답 코드

| HTTP Status | 의미 | UI 처리 |
|---|---|---|
| `201` | 성공 | 성공 메시지 표시 |
| `409` | 이메일 중복 | "이미 등록된 이메일" 알림 |
| 그 외 | 서버 에러 | "다시 시도해주세요" 알림 |

---

## Step 6: 테스트

### 방법 1: curl로 API 직접 테스트

```bash
curl -s -w "\nHTTP Status: %{http_code}" -X POST \
  'https://YOUR_PROJECT_URL/rest/v1/waitlist' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Prefer: return=minimal' \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "organization": "Test Corp",
    "country": "KR",
    "form_data": {"affiliation": "startup", "robotAccess": "planning"}
  }'
```

`HTTP Status: 201`이 나오면 성공.

### 방법 2: 로컬에서 페이지 열어서 직접 테스트

```bash
# 프로젝트 폴더에서 로컬 서버 실행
python3 -m http.server 8080

# 브라우저에서 http://localhost:8080 접속
# 폼 작성 후 제출 → Supabase Table Editor에서 데이터 확인
```

### 테스트 후 정리

테스트 데이터는 Supabase 대시보드 > Table Editor > waitlist에서 직접 삭제.

---

## Step 7: 데이터 조회 (SQL 예시)

```sql
-- 전체 조회
SELECT * FROM waitlist ORDER BY created_at DESC;

-- 국가별 필터
SELECT * FROM waitlist WHERE country = 'KR';

-- 소속 유형별 (JSONB 필터)
SELECT * FROM waitlist WHERE form_data->>'affiliation' = 'academic';

-- 특정 로봇 브랜드 사용자 (JSONB 배열 검색)
SELECT * FROM waitlist WHERE form_data->'robotBrand' ? 'franka';

-- 국가별 통계
SELECT country, count(*) FROM waitlist GROUP BY country ORDER BY count DESC;

-- CSV 내보내기: Table Editor > waitlist > Export 버튼
```

---

## 트러블슈팅

### 401 에러: "new row violates row-level security policy"

원인과 해결 순서:

1. **RLS 정책 확인** — `TO anon`이 명시되어 있는지 확인
   ```sql
   SELECT policyname, roles, cmd, with_check FROM pg_policies WHERE tablename = 'waitlist';
   -- roles에 {anon}이 있어야 함
   ```

2. **GRANT 확인** — anon 역할에 INSERT 권한이 있는지 확인
   ```sql
   SELECT grantee, privilege_type FROM information_schema.role_table_grants
   WHERE table_name = 'waitlist' AND grantee = 'anon';
   -- privilege_type에 INSERT가 있어야 함
   ```

3. **시퀀스 권한 확인** — id 자동 생성에 필요
   ```sql
   GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
   ```

4. **PostgREST 캐시 새로고침** — 정책/권한 변경 후 반드시 실행
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

5. **Prefer 헤더 확인** — `return=minimal` 사용 중인지 확인 (`return=representation`은 SELECT 정책 필요)

### API 키 관련

- `sb_publishable_` 형식 키 → REST API와 호환 안 됨
- 반드시 `eyJ...`로 시작하는 JWT 형식의 `anon` key 사용
- 키 위치: Project Settings > API > "Project API keys" 섹션

---

## Checklist

- [ ] Supabase 프로젝트 생성
- [ ] Step 2 SQL 실행 (테이블 생성)
- [ ] Step 3 SQL 실행 (RLS + GRANT + 캐시 새로고침) — **한 블록으로 전부 실행**
- [ ] API 키 복사 (Project URL + JWT anon key)
- [ ] `index.html`에 키 적용 (Step 5)
- [ ] curl 또는 로컬 서버로 테스트 → 201 응답 확인
- [ ] Supabase Table Editor에서 데이터 들어온 거 확인
- [ ] 테스트 데이터 삭제
- [ ] 배포 (GitHub Pages, Vercel, Netlify 등)
- [ ] (선택) 커스텀 도메인 연결
