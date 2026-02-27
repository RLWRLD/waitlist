# Supabase Setup Guide — RLDX Waitlist

이 가이드를 따르면 Supabase 계정이 바뀌더라도 처음부터 다시 세팅할 수 있습니다.

## Overview

- **목적**: RLDX Launch List 폼 데이터 저장 + 확인 이메일 자동 발송
- **구조**: 핵심 필드는 개별 컬럼 + 전체 폼 응답은 JSONB
- **보안**: RPC 함수를 통한 upsert만 허용 (직접 INSERT/UPDATE/SELECT/DELETE 차단)
- **프론트엔드**: 순수 JS, Supabase REST API RPC 호출 (SDK 불필요)

---

## 데이터베이스 구조

### waitlist 테이블

| 컬럼 | 타입 | 설명 | 갱신 여부 (재가입 시) |
|---|---|---|---|
| `id` | bigint (자동) | Primary key | 유지 |
| `created_at` | timestamptz (자동) | 최초 제출 시각 | 유지 |
| `email` | text, NOT NULL, UNIQUE | 이메일 (충돌 기준 키) | 유지 |
| `full_name` | text | 이름 | 갱신됨 |
| `organization` | text | 소속 | 갱신됨 |
| `country` | text | 국가 코드 (US, KR, JP 등) | 갱신됨 |
| `social_profile` | text, nullable | X 또는 LinkedIn URL | 갱신됨 |
| `form_data` | jsonb | 폼 전체 응답 JSON | 갱신됨 |
| `confirmation_sent_at` | timestamptz, nullable | 확인 이메일 발송 시각 (NULL = 미발송) | 유지 |

### email_logs 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | bigint (자동) | Primary key |
| `waitlist_id` | bigint (FK → waitlist.id, CASCADE) | 대상 가입자 |
| `email` | text, NOT NULL | 수신자 이메일 |
| `status` | text, NOT NULL | pending / sent / failed |
| `resend_id` | text | Resend API 응답 ID |
| `error_message` | text | 실패 시 에러 메시지 |
| `created_at` | timestamptz | 기록 시각 |
| `sent_at` | timestamptz | 발송 완료 시각 |

### RPC 함수: waitlist_signup

프론트엔드가 호출하는 upsert 함수. `SECURITY DEFINER`로 서버 권한으로 실행됨.

- 새 이메일 → INSERT (새 행 생성, Webhook 트리거 → 이메일 발송)
- 기존 이메일 → UPDATE (full_name, organization, country, social_profile, form_data만 갱신, Webhook 안 탐 → 이메일 안 감)
- `id`, `created_at`, `confirmation_sent_at`은 절대 변경되지 않음

### 보안 구조

| 테이블 | RLS | anon 역할 권한 | 비고 |
|--------|-----|----------------|------|
| `waitlist` | 활성화 | INSERT (RLS 정책: `Allow anon insert`) | 직접 UPDATE/SELECT/DELETE 불가 |
| `email_logs` | 활성화 | 없음 (정책 없음) | service_role만 접근 가능 |

| 기능 | anon key (프론트엔드) | service_role (백엔드) |
|------|----------------------|----------------------|
| RPC `waitlist_signup` 호출 | **허용** (EXECUTE 권한) | 허용 |
| waitlist 직접 INSERT | 허용 (RLS 정책) | 허용 |
| waitlist 직접 SELECT | **차단** | 허용 |
| waitlist 직접 UPDATE | **차단** | 허용 |
| waitlist 직접 DELETE | **차단** | 허용 |
| email_logs 모든 작업 | **차단** | 허용 |

> `anon` key (`eyJ...` 형식)는 프론트엔드에 노출해도 안전 — RPC 호출만 가능하며, 직접 데이터 조회/수정/삭제 불가.

### Database Webhook

| 항목 | 값 |
|------|-----|
| Name | `send-confirmation-email` |
| Table | `waitlist` |
| Event | `INSERT` only |
| Type | Supabase Edge Functions |
| Function | `send-confirmation-email` |

INSERT 시에만 트리거됨. RPC의 upsert에서 기존 이메일 UPDATE 시에는 트리거되지 않음.

### Edge Function: send-confirmation-email

| 항목 | 값 |
|------|-----|
| Runtime | Deno (TypeScript) |
| Provider | Resend API |
| Secret | `RESEND_API_KEY` (Edge Functions → Manage Secrets) |
| 자동 주입 | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

동작:
1. Webhook으로부터 새 row 데이터 수신
2. `confirmation_sent_at` 체크 (이미 발송했으면 skip — 중복 방지)
3. Resend API로 HTML + Plain Text 이메일 발송
4. `email_logs`에 발송 결과 기록
5. `waitlist.confirmation_sent_at`에 타임스탬프 기록

---

## 처음부터 세팅하기

### Step 1: Supabase 프로젝트 생성

1. https://supabase.com 가입 (GitHub 로그인 가능)
2. **New Project** 클릭
3. 설정:
   - **Project name**: `rlwrld-waitlist` (자유롭게)
   - **Database password**: 안전하게 저장 (다시 볼 수 없음)
   - **Region**: 글로벌 → `US East`, 아시아 위주 → `Northeast Asia (Seoul)`
4. 프로비저닝 완료 대기 (~2분)

---

### Step 2: 테이블 + 보안 + RPC 함수 생성

Supabase 대시보드 > **SQL Editor**에서 아래를 **한 블록으로 전부 실행**:

```sql
-- ============================================
-- 1. waitlist 테이블 생성
-- ============================================
CREATE TABLE public.waitlist (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  email text NOT NULL,
  full_name text,
  organization text,
  country text,
  social_profile text,
  form_data jsonb,
  confirmation_sent_at timestamptz DEFAULT NULL
);

CREATE UNIQUE INDEX waitlist_email_unique ON public.waitlist (email);
CREATE INDEX waitlist_created_at_idx ON public.waitlist (created_at DESC);

-- ============================================
-- 2. email_logs 테이블 생성
-- ============================================
CREATE TABLE public.email_logs (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    waitlist_id bigint NOT NULL REFERENCES public.waitlist(id) ON DELETE CASCADE,
    email text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    resend_id text,
    error_message text,
    created_at timestamptz DEFAULT now(),
    sent_at timestamptz
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_email_logs_waitlist_id ON public.email_logs(waitlist_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);

-- ============================================
-- 3. RLS + 권한 설정
-- ============================================
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert"
  ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.waitlist TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- 4. RPC 함수 (upsert: 새 이메일 = INSERT, 기존 이메일 = UPDATE)
-- ============================================
CREATE OR REPLACE FUNCTION public.waitlist_signup(
  p_email text,
  p_full_name text,
  p_organization text,
  p_country text,
  p_social_profile text,
  p_form_data jsonb
) RETURNS void AS $$
  INSERT INTO public.waitlist (email, full_name, organization, country, social_profile, form_data)
  VALUES (p_email, p_full_name, p_organization, p_country, p_social_profile, p_form_data)
  ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    organization = EXCLUDED.organization,
    country = EXCLUDED.country,
    social_profile = EXCLUDED.social_profile,
    form_data = EXCLUDED.form_data;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.waitlist_signup TO anon;

-- ============================================
-- 5. PostgREST 캐시 새로고침
-- ============================================
NOTIFY pgrst, 'reload schema';
```

---

### Step 3: API 키 가져오기

1. Supabase 대시보드 > **Project Settings** (톱니바퀴) > **API**
2. 아래 두 값을 복사:

| 항목 | 위치 | 형식 |
|---|---|---|
| **Project URL** | 상단 "Project URL" | `https://xxxxx.supabase.co` |
| **anon key** | "Project API keys" > `anon` `public` | `eyJhbGciOiJIUzI1NiIs...` (JWT 형식) |

> **주의**: `sb_publishable_` 형식의 새 키는 REST API와 호환 안 됨 — 반드시 `eyJ...`로 시작하는 JWT 형식의 `anon` key 사용.

---

### Step 4: 프론트엔드 코드에 적용

`index.html`의 `<script>` 블록 안에서 아래 두 줄을 찾아 값을 교체:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';   // ← Project URL
const SUPABASE_ANON_KEY = 'eyJ...YOUR_ANON_KEY_HERE...';      // ← anon key (JWT)
```

### 프론트엔드 API 호출 형식

```javascript
await fetch(`${SUPABASE_URL}/rest/v1/rpc/waitlist_signup`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
        p_email: '...',
        p_full_name: '...',
        p_organization: '...',
        p_country: '...',
        p_social_profile: '...',
        p_form_data: { /* 전체 폼 데이터 */ }
    })
});
```

### 응답 코드

| HTTP Status | 의미 | UI 처리 |
|---|---|---|
| `200` | 성공 (신규 INSERT 또는 기존 UPDATE) | 성공 메시지 표시 |
| 그 외 | 서버 에러 | "다시 시도해주세요" 알림 |

---

### Step 5: 이메일 시스템 설정

[OPERATIONS.md](OPERATIONS.md)의 Resend 섹션 참고:

1. Resend 가입 → API Key 발급
2. 도메인 등록 → DNS 레코드 추가 (GoDaddy) → Verify
3. Supabase → Edge Functions → Manage Secrets → `RESEND_API_KEY` 추가
4. Edge Function 배포 (`supabase/functions/send-confirmation-email/index.ts`)
5. Database Webhook 생성 (waitlist INSERT → send-confirmation-email)

---

### Step 6: 테스트

```bash
# RPC 함수 테스트 (curl)
curl -s -w "\nHTTP Status: %{http_code}" -X POST \
  'https://YOUR_PROJECT_URL/rest/v1/rpc/waitlist_signup' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "p_email": "test@example.com",
    "p_full_name": "Test User",
    "p_organization": "Test Corp",
    "p_country": "KR",
    "p_social_profile": null,
    "p_form_data": {"affiliation": "startup", "robotAccess": "planning"}
  }'
```

`HTTP Status: 200`이 나오면 성공.

### 테스트 후 정리

```sql
-- 테스트 데이터 삭제
DELETE FROM waitlist WHERE email = 'test@example.com';
```

---

## 데이터 조회 (SQL 예시)

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

-- 이메일 발송 현황
SELECT w.id, w.email, w.full_name, w.confirmation_sent_at, e.status, e.resend_id
FROM waitlist w
LEFT JOIN email_logs e ON w.id = e.waitlist_id
ORDER BY w.id;

-- 이메일 발송 실패 건 조회
SELECT * FROM email_logs WHERE status = 'failed';

-- CSV 내보내기: Table Editor > waitlist > Export 버튼
```

---

## 트러블슈팅

### 폼 제출 에러

1. **RPC 함수 확인** — 함수가 존재하는지 확인
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name = 'waitlist_signup';
   ```

2. **EXECUTE 권한 확인**
   ```sql
   SELECT grantee, privilege_type FROM information_schema.routine_privileges
   WHERE routine_name = 'waitlist_signup' AND grantee = 'anon';
   ```

3. **RLS 정책 확인**
   ```sql
   SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'waitlist';
   ```

4. **PostgREST 캐시 새로고침**
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

### 이메일 안 감

1. Resend 대시보드 → API Key 상태 확인
2. Resend 대시보드 → Domains → 도메인 인증 상태 확인
3. Supabase → Edge Functions → `send-confirmation-email` 로그 확인
4. Supabase → Database → Webhooks → `send-confirmation-email` 활성화 확인
5. Supabase → Table Editor → `email_logs`에서 에러 메시지 확인

### API 키 관련

- `sb_publishable_` 형식 키 → REST API와 호환 안 됨
- 반드시 `eyJ...`로 시작하는 JWT 형식의 `anon` key 사용
- 키 위치: Project Settings > API > "Project API keys" 섹션

---

## Checklist

- [ ] Supabase 프로젝트 생성
- [ ] Step 2 SQL 실행 (테이블 + RLS + RPC 함수) — **한 블록으로 전부 실행**
- [ ] API 키 복사 (Project URL + JWT anon key)
- [ ] `index.html`에 키 적용 (Step 4)
- [ ] 이메일 시스템 설정 (Step 5, [OPERATIONS.md](OPERATIONS.md) 참고)
- [ ] curl 또는 로컬 서버로 테스트 → 200 응답 확인
- [ ] Supabase Table Editor에서 데이터 확인
- [ ] 이메일 수신 확인
- [ ] 테스트 데이터 삭제
- [ ] 배포 (GitHub Pages)
