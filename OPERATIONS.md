# RLDX Waitlist — 운영/인수인계 가이드

이 문서는 프로젝트를 전수받는 사람이 모든 외부 서비스를 처음부터 세팅하거나 운영할 수 있도록 작성되었습니다.

---

## 외부 서비스 목록

| 서비스 | 용도 | URL |
|--------|------|-----|
| Supabase | DB + Edge Functions + Webhooks | https://supabase.com/dashboard |
| Resend | 이메일 발송 API | https://resend.com |
| Notion | 가입자 데이터 관리 대시보드 | https://notion.so |
| Slack | 새 가입 알림 | Slack Workspace |
| GoDaddy | 도메인 DNS 관리 (rlwrld.ai) | https://kr.godaddy.com |
| GitHub | 코드 저장소 + 백업 자동 push | https://github.com |

---

## 1. Supabase

### 로그인 정보

| 항목 | 값 |
|------|-----|
| URL | https://supabase.com/dashboard |
| 로그인 방법 | `________` (GitHub / Email) |
| 프로젝트명 | `________` |
| Project Ref | `fycshjlwrwwdbxwjnoqi` |
| Region | `________` |

### 필요한 키 (Settings → API)

| 키 | 용도 | 사용 위치 |
|----|------|-----------|
| Project URL | API 엔드포인트 | index.html, sync-config.json |
| anon key (JWT `eyJ...`) | 프론트엔드 INSERT | index.html |
| service_role key | 백엔드 전체 접근 | sync-config.json, Edge Function (자동 주입) |

### 주요 구성 요소

**테이블:**
- `waitlist` — 가입자 데이터 (RLS: anon INSERT만 허용)
- `email_logs` — 이메일 발송 기록 (RLS: service_role만 접근)

**Edge Function:**
- `send-confirmation-email` — 확인 이메일 발송
- 배포: Edge Functions → 해당 함수 → 코드 수정 후 Deploy
- Secrets: `RESEND_API_KEY` (Edge Functions → Manage Secrets)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 자동 주입

**Database Webhook:**
- Name: `send-confirmation-email`
- Table: `waitlist`, Event: `INSERT`
- Type: Supabase Edge Functions → `send-confirmation-email`

### 초기 세팅 (프로젝트 새로 만들 때)

[SUPABASE_SETUP.md](SUPABASE_SETUP.md) Step 2의 SQL을 한 블록으로 실행하면 테이블, RLS, RPC 함수가 모두 생성됩니다.

### 폼 제출 방식

프론트엔드는 `/rest/v1/rpc/waitlist_signup` RPC 함수를 호출합니다 (직접 테이블 INSERT가 아님).
- 새 이메일 → INSERT (Webhook 트리거 → 이메일 발송)
- 기존 이메일 → UPDATE (하위 정보만 갱신, 이메일 안 감)
- `id`, `created_at`, `confirmation_sent_at`은 절대 변경되지 않음

---

## 2. Resend (이메일)

### 로그인 정보

| 항목 | 값 |
|------|-----|
| URL | https://resend.com |
| 로그인 방법 | `________` (GitHub / Email) |
| 연동된 도메인 | rlwrld.ai |

### API Key

| 항목 | 값 |
|------|-----|
| Key Name | rldx-waitlist-confirmation |
| Permission | Sending access (rlwrld.ai only) |
| 저장 위치 | Supabase Edge Functions → Manage Secrets → `RESEND_API_KEY` |

### 도메인 인증 (DNS 레코드)

GoDaddy DNS에 아래 3개 레코드가 등록되어 있어야 합니다:

| 타입 | Name | 용도 |
|------|------|------|
| MX | (Resend 제공값) | SPF — 발신 서버 인증 |
| TXT | (Resend 제공값) | DKIM — 이메일 서명 |
| TXT | `_dmarc` | DMARC — 정책 (`v=DMARC1; p=none;`) |

Resend 대시보드 → Domains → rlwrld.ai에서 레코드 값 확인 가능.

### 이메일 설정 (Edge Function 코드 내)

| 항목 | 현재 값 | 코드 위치 |
|------|---------|-----------|
| From | `RLDX by RLWRLD <launch@rlwrld.ai>` | `index.ts` line 13 |
| Reply-To | `do-not-reply@rlwrld.ai` | `index.ts` line 14 |
| Subject | `Welcome to RLDX, {name} — You're #{id}` | `index.ts` line 303 |

변경 시: 코드 수정 → Supabase Edge Functions에서 재배포.

### API Key 재발급 시

1. Resend → API Keys → Create API Key
2. Permission: Sending access, Domain: rlwrld.ai
3. Supabase → Edge Functions → Manage Secrets → `RESEND_API_KEY` 값 교체

### 모니터링

- Resend 대시보드 → Emails: 발송 내역, 열람률, 바운스 확인
- Supabase → Table Editor → `email_logs`: 발송 상태 (sent/failed)

---

## 3. Notion

### 로그인 정보

| 항목 | 값 |
|------|-----|
| Workspace | `________` |
| 로그인 방법 | `________` |

### Integration (API 연동)

| 항목 | 값 |
|------|-----|
| Integration 이름 | `________` |
| API Token | sync-config.json의 `notion.token` |
| 생성/관리 | https://www.notion.so/my-integrations |

### Database

| 항목 | 값 |
|------|-----|
| Database ID | sync-config.json의 `notion.databaseId` |
| Database URL | `________` |

**중요:** Notion 데이터베이스에 Integration이 연결(Share)되어 있어야 합니다.
Database 페이지 우상단 `...` → Connections → Integration 선택.

### Notion DB 컬럼 구조

**Profile columns (개별):**

| Column | Type | Source |
|--------|------|--------|
| Supabase ID | Title | `id` |
| Full Name | Rich text | `full_name` |
| Email | Email | `email` |
| Organization / Company | Rich text | `organization` |
| Country | Select | `country` |
| X or LinkedIn Profile | URL | `social_profile` |
| Submitted | Date | `created_at` |

**Section columns (병합 텍스트) — 자동 생성됨:**

| Column | 포함 필드 |
|--------|-----------|
| Who You Are | affiliation, role, industry, communities |
| Robot & Hardware | robotAccess, robotType, robotBrand, simAccess |
| Interest in RLDX | useCase, applications, shareWilling, shareType |
| Event & Engagement | eventAttendance, referralSource |

### Integration 재생성 시

1. https://www.notion.so/my-integrations → New Integration
2. Name 입력, Workspace 선택, Submit
3. Internal Integration Secret 복사 → `sync-config.json`의 `notion.token`에 입력
4. Notion Database 페이지에서 Connections에 Integration 추가

---

## 4. Slack

### 설정

| 항목 | 값 |
|------|-----|
| Workspace | `________` |
| Channel | `________` |
| Webhook URL | sync-config.json의 `slack.webhookUrl` |

### Webhook 생성 방법

1. https://api.slack.com/apps → Create New App → From scratch
2. App Name 입력, Workspace 선택
3. 좌측 메뉴 Incoming Webhooks → Activate
4. Add New Webhook to Workspace → 채널 선택 → Allow
5. Webhook URL 복사 → `sync-config.json`의 `slack.webhookUrl`에 입력

### 비활성화

`sync-config.json`에서 `"enabled": false`로 변경.

---

## 5. GoDaddy (도메인 DNS)

### 로그인 정보

| 항목 | 값 |
|------|-----|
| URL | https://kr.godaddy.com |
| 도메인 | rlwrld.ai |
| 로그인 방법 | `________` |

### 관리 중인 DNS 레코드

Resend 이메일 인증용 3개 레코드:

| 타입 | Name | 용도 |
|------|------|------|
| MX | (Resend 제공) | SPF |
| TXT | (Resend 제공) | DKIM |
| TXT | `_dmarc` | DMARC |

DNS 관리: 로그인 → 내 제품 → rlwrld.ai → DNS 관리

---

## 6. GitHub

### 로그인 정보

| 항목 | 값 |
|------|-----|
| Repository | `________` |
| 로그인 방법 | `________` |

### 자동 push

`backup-supabase.js`가 매일 백업 후 자동으로 git commit + push 합니다.
서버에서 GitHub 인증이 설정되어 있어야 합니다 (SSH key 또는 credential helper).

---

## 7. 서버 (Cron 실행 환경)

### 서버 정보

| 항목 | 값 |
|------|-----|
| Host | `________` |
| OS | Ubuntu (Linux) |
| Node.js 버전 | 18+ 필요 |
| 프로젝트 경로 | `/home/rlwrld/projects/waitlist` |
| 접속 방법 | `________` (SSH) |

### Cron 확인/수정

```bash
crontab -e
```

현재 등록된 cron:

```crontab
# Notion sync + Slack alert every 5 minutes
*/5 * * * * /usr/bin/node /home/rlwrld/projects/waitlist/sync/sync-notion.js >> /home/rlwrld/projects/waitlist/sync/logs/sync.log 2>&1

# Daily backup at KST 00:00 (UTC 15:00)
0 15 * * * /usr/bin/node /home/rlwrld/projects/waitlist/sync/backup-supabase.js >> /home/rlwrld/projects/waitlist/sync/logs/backup.log 2>&1
```

### 로그 확인

```bash
# 동기화 로그 (최근)
tail -50 sync/logs/sync.log

# 백업 로그 (최근)
tail -20 sync/logs/backup.log
```

---

## 8. 데이터 파이프라인

### 전체 흐름

```
[User submits form]
       │
       ▼
┌─────────────┐     FormData API (auto-collect all inputs)
│  index.html │────────────────────────────────────────────┐
└─────────────┘                                            │
                                                           ▼
                                              ┌────────────────────┐
                                              │      Supabase      │
                                              │  waitlist table     │
                                              │                    │
                                              │  - email           │
                                              │  - full_name       │
                                              │  - organization    │
                                              │  - country         │
                                              │  - social_profile  │
                                              │  - form_data (JSONB)│
                                              │  - created_at      │
                                              └────────┬───────────┘
                                                       │
                              ┌─────────────────────────┤
                              │                         │
                         cron 5min                 cron daily
                              │                         │
                              ▼                         ▼
                    ┌──────────────────┐     ┌──────────────────┐
                    │  sync-notion.js  │     │ backup-supabase.js│
                    │                  │     │                  │
                    │  Reads index.html│     │  JSON backup to  │
                    │  at runtime for  │     │  sync/backups/   │
                    │  auto label/     │     │  + git commit    │
                    │  section extract │     │  + git push      │
                    └────────┬─────────┘     └──────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Notion Database │
                    │                  │
                    │  Profile columns │
                    │  + 4 section     │
                    │    columns       │
                    └──────────────────┘
```

### 폼 데이터 저장 규칙

- **Radio inputs**: 하나만 선택 → `string` (e.g., `"academic"`)
- **Checkbox inputs**: 하나 선택 → `string`, 여러 개 → `array` (e.g., `["franka", "ur"]`)
- **Text inputs**: 항상 포함, 비어있으면 `""` (빈 문자열)
- **Conditional fields**: radio/checkbox가 미선택이면 key 자체가 없음, text input은 빈 문자열로 존재

핵심 5개 필드(`email`, `full_name`, `organization`, `country`, `social_profile`)는 개별 컬럼으로 추출 저장하고, 전체 응답은 `form_data` JSONB에 보관합니다.

### Notion 동기화 메커니즘

sync-notion.js는 실행 시마다 index.html을 파싱하여 **하드코딩 없이** 아래 정보를 자동 추출합니다:

1. **LABELS** — 옵션 코드 → 텍스트 매핑 (`<input value="...">` + `<span class="option-label">`)
2. **SECTIONS** — 섹션 구조 + 질문 텍스트 (`<div class="form-section">` + `<h3 class="section-title">` + `<label class="form-label">`)
3. **SELECT options** — `<select>` 내 `<option value="...">` 텍스트

동기화 로직:
1. Supabase에서 전체 row를 가져옴
2. Notion DB에 섹션 컬럼이 없으면 자동 생성 (PATCH API)
3. Notion DB에서 이미 싱크된 email 목록을 조회
4. 새 row만 필터링하여 Notion 페이지 생성
5. 중복 email은 skip (email 기준 비교)

### 필드 매핑 레퍼런스

#### Who You Are

| Question | form_data Key | Type |
|---|---|---|
| What type of organization are you from? | `affiliation` | radio |
| (Other text) | `affiliationOther` | text |
| What is your role? (Academic) | `academicRole` | radio |
| What is your role? (Industry) | `industryRole` | radio |
| Which industry? | `industry` | checkbox (array) |
| (Other text) | `industryOther` | text |
| What is your role? (Startup) | `startupRole` | radio |
| (Other text) | `startupRoleOther` | text |
| Which communities are you part of? | `communities` | checkbox (array) |
| (Other text) | `communitiesOther` | text |

#### Robot & Hardware

| Question | form_data Key | Type |
|---|---|---|
| Do you have access to a robot? | `robotAccess` | radio |
| Robot Type(s) | `robotType` | checkbox (array) |
| (Other text) | `robotTypeOther` | text |
| Robot Brand(s) | `robotBrand` | checkbox (array) |
| (Other text) | `robotBrandOther` | text |
| Do you have access to a simulation environment? | `simAccess` | radio |

#### Interest in RLDX

| Question | form_data Key | Type |
|---|---|---|
| What do you want to do with RLDX? | `useCase` | checkbox (array) |
| What tasks are you interested in? | `applications` | checkbox (array) |
| (Other text) | `applicationsOther` | text |
| Would you share your experience publicly? | `shareWilling` | radio |
| How would you like to share? | `shareType` | checkbox (array) |

#### Event & Engagement

| Question | form_data Key | Type |
|---|---|---|
| Would you attend an RLDX launch event? | `eventAttendance` | radio |
| How did you hear about RLDX? | `referralSource` | radio |
| (Other text) | `referralSourceOther` | text |

---

## 9. index.html 수정 시 영향 범위

| 변경 사항 | Supabase | Notion Sync | Backup | 추가 작업 |
|---|---|---|---|---|
| 옵션 텍스트 변경 | O (key로 저장) | O (자동 반영) | O | 없음 |
| 옵션 value(key) 변경 | O (새 key 수집) | △ (기존 데이터 key fallback) | O | **SQL 마이그레이션** |
| 새 옵션 추가 | O (FormData 수집) | O (LABELS 추출) | O | 없음 |
| 옵션 삭제 | O | △ (기존 데이터 key fallback) | O | 없음 |
| 새 질문 추가 (기존 섹션) | O (FormData 수집) | O (SECTIONS 추출) | O | 없음 |
| 질문 삭제 | O | O (매핑할 section 없어 무시) | O | 없음 |
| 질문 텍스트 변경 | O (name 동일) | O (자동 추출) | O | 없음 |
| 새 섹션 추가 | O | O (컬럼도 자동 생성) | O | 없음 |
| 섹션 삭제 | O | O (빌드 안 함, 컬럼은 남음) | O | Notion 컬럼 수동 삭제 |
| 섹션명 변경 | O | △ (새 컬럼 자동 생성) | O | 기존 Notion 컬럼 수동 삭제 |
| 프로필 필드명 변경 | **X** (fetch body 깨짐) | **X** (PROFILE_KEYS 하드코딩) | O | index.html fetch body + sync-notion.js 수동 수정 |
| HTML 구조 변경 (class명 등) | O | **X** (파싱 깨짐) | O | sync-notion.js 정규식 확인 |

> **O** = index.html만 수정하면 자동 적용 / **△** = 새 데이터는 OK, 기존 데이터는 fallback / **X** = 코드 수동 수정 필요

### 기존 데이터 마이그레이션 (옵션 value key 변경 시)

옵션 텍스트를 바꿔도 기존 데이터는 영향 없습니다. 옵션의 **value(key)** 자체를 바꾸는 경우에만 마이그레이션이 필요합니다.

> **주의:** old key → new key 매핑을 자동 추론할 수는 없으므로, 변경 사항을 명시해야 합니다.
> 실행 전 반드시 `SELECT count(*)` 로 영향 범위를 먼저 확인하세요.

#### Case A: 단일값 필드의 key 변경

```sql
-- 예: simAccess "rtx4090_plus" → "rtx5090_plus" 로 변경한 경우
-- 1) 영향 범위 확인
SELECT count(*) FROM waitlist WHERE form_data->>'simAccess' = 'rtx4090_plus';

-- 2) 마이그레이션 실행
UPDATE waitlist
SET form_data = jsonb_set(form_data, '{simAccess}', '"rtx5090_plus"')
WHERE form_data->>'simAccess' = 'rtx4090_plus';
```

#### Case B: 배열 필드에서 특정 value 변경

```sql
-- 예: robotBrand 배열에서 "ur" → "universal_robots" 로 변경한 경우
-- 1) 영향 범위 확인
SELECT count(*) FROM waitlist WHERE form_data->'robotBrand' @> '"ur"';

-- 2) 마이그레이션 실행
UPDATE waitlist
SET form_data = (
  SELECT jsonb_set(form_data, '{robotBrand}', (
    SELECT jsonb_agg(
      CASE WHEN elem::text = '"ur"' THEN '"universal_robots"'::jsonb ELSE elem END
    ) FROM jsonb_array_elements(form_data->'robotBrand') AS elem
  ))
)
WHERE form_data->'robotBrand' @> '"ur"';
```

#### Case C: 필드명(key) 자체를 변경

```sql
-- 예: form_data 안의 "robotAccess" → "robotOwnership" 으로 변경한 경우
-- 1) 영향 범위 확인
SELECT count(*) FROM waitlist WHERE form_data ? 'robotAccess';

-- 2) 마이그레이션 실행
UPDATE waitlist
SET form_data = (form_data - 'robotAccess') ||
  jsonb_build_object('robotOwnership', form_data->'robotAccess')
WHERE form_data ? 'robotAccess';
```

### HTML 구조 의존성 (sync-notion.js 파싱 기준)

파싱이 정상 동작하려면 아래 HTML 구조를 유지해야 합니다:

```html
<div class="form-section">
  <div class="section-header">
    <h3 class="section-title">섹션명</h3>
  </div>
  <div class="form-group">
    <label class="form-label">질문 텍스트</label>
    <input name="fieldKey" value="optionValue">
    <span class="option-label">옵션 텍스트</span>
  </div>
</div>
```

필수 class:
- `form-section` — 섹션 경계
- `section-title` — 섹션명 (→ Notion 컬럼명)
- `form-label` — 질문 텍스트 (→ 셀 안의 라벨)
- `option-label` — 옵션 텍스트 (→ 답변 표시)

---

## 일상 운영 체크리스트

### 매일

- [ ] Resend 대시보드에서 이메일 발송 상태 확인 (바운스/실패 여부)
- [ ] `sync/backups/` 에 오늘 날짜 백업 폴더 생성 확인

### 주간

- [ ] Supabase → `email_logs` 테이블에서 `status = 'failed'` 건 확인
- [ ] Notion DB에 최신 가입자 반영 확인
- [ ] `sync/logs/sync.log` 에러 여부 확인

### 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| 이메일 안 감 | Resend API Key 만료/삭제 | Resend에서 재발급 → Supabase Secrets 교체 |
| 이메일 안 감 | 도메인 인증 해제 | Resend → Domains에서 rlwrld.ai 상태 확인 |
| 이메일 안 감 | Webhook 비활성화 | Supabase → Database → Webhooks 확인 |
| Notion 동기화 안 됨 | Notion token 만료 | Notion Integration 재생성 → sync-config.json 업데이트 |
| Notion 동기화 안 됨 | cron 중단 | `crontab -l`로 확인, 서버 재부팅 후 cron 재시작 |
| 백업 안 됨 | git push 실패 | 서버에서 `git push` 수동 실행, 인증 확인 |
| 폼 제출 401 에러 | Supabase anon key 변경 | index.html의 키 교체 |

---

## 이메일 내용 수정 시

1. `supabase/functions/send-confirmation-email/index.ts` 수정 (로컬)
2. Supabase 대시보드 → Edge Functions → `send-confirmation-email`
3. 코드 전체 교체 후 **Deploy**
4. Edge Function Test에서 테스트 발송 확인

참고: `sync/email-template.md`에 이메일 디자인 레퍼런스 보관.

---

## 전체 시스템 처음부터 세팅 순서

1. Supabase 프로젝트 생성 → [SUPABASE_SETUP.md](SUPABASE_SETUP.md) 따라 테이블/RLS 설정
2. 위 SQL로 `confirmation_sent_at` 컬럼 + `email_logs` 테이블 추가
3. Resend 가입 → API Key 발급 → 도메인 등록 → DNS 레코드 추가 (GoDaddy) → Verify
4. Supabase Edge Functions → Manage Secrets → `RESEND_API_KEY` 추가
5. Edge Function 배포 (Via Editor, `index.ts` 코드 복붙)
6. Database Webhook 생성 (waitlist INSERT → send-confirmation-email)
7. `sync-config.json` 설정 (Supabase + Notion + Slack 키)
8. Notion Integration 생성 → Database에 연결
9. Slack Incoming Webhook 생성
10. Cron 등록 (sync + backup)
11. `index.html`에 Supabase URL + anon key 입력
12. 테스트: 폼 제출 → 이메일 수신 → Notion 동기화 → Slack 알림 → 백업 확인
