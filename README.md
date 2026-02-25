# RLDX Waitlist

RLDX Launch List 등록 페이지 + Notion 동기화 + 일일 백업 스크립트.

## 구조

```
waitlist/
├── index.html                      # Launch List 폼 (HTML/CSS/JS + Supabase)
├── rlwrld/
│   ├── css/styles.css              # 공통 스타일
│   ├── js/script.js                # 공통 JS (progress bar, scroll 등)
│   └── assets/logos/               # 로고 SVG
├── sync/
│   ├── sync-notion.js              # Supabase → Notion 동기화 (cron 5분)
│   ├── backup-supabase.js          # Supabase 일일 백업 (cron 매일)
│   ├── sync-config.json            # API 키 설정 (gitignored)
│   ├── sync-config.example.json    # 설정 파일 템플릿
│   ├── backups/                    # 일일 백업 저장 디렉토리
│   ├── logs/                       # 싱크/백업 로그
│   └── DATA_PIPELINE.md            # 데이터 파이프라인 상세 문서
├── SUPABASE_SETUP.md               # Supabase 테이블/RLS 설정 가이드
└── RLDX_Waitlist_Form_Spec.md      # 폼 스펙 문서
```

## Launch List 폼

`index.html`을 웹서버로 서빙하면 됨. 제출된 데이터는 Supabase `waitlist` 테이블에 저장.

### 로컬 테스트

```bash
# 아래 중 하나로 로컬 서버 실행
npx serve .
# 또는
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080` (또는 `http://localhost:3000`) 접속.

> `file://`로 직접 열면 Supabase 연결이 안 됨 — 반드시 HTTP 서버 필요.

## Notion 동기화

Supabase에 저장된 waitlist 데이터를 Notion 데이터베이스로 동기화.

- index.html을 자동 파싱하여 라벨/섹션 구조 추출 (하드코딩 매핑 없음)
- 코드값을 사람이 읽을 수 있는 라벨로 변환 (예: `rd` → `R&D / Research`)
- 섹션별로 질문:답변 형태의 병합 텍스트 생성
- email 기준 중복 방지
- Notion DB에 섹션 컬럼이 없으면 자동 생성

### 설정

1. `sync/sync-config.example.json`을 `sync/sync-config.json`으로 복사:

```bash
cp sync/sync-config.example.json sync/sync-config.json
```

2. `sync/sync-config.json`에 실제 키 입력:

```json
{
  "supabase": {
    "url": "https://YOUR_PROJECT.supabase.co",
    "serviceRoleKey": "YOUR_SUPABASE_SERVICE_ROLE_KEY"
  },
  "notion": {
    "token": "YOUR_NOTION_API_TOKEN",
    "databaseId": "YOUR_NOTION_DATABASE_ID"
  }
}
```

- **Supabase service_role key**: Supabase Dashboard → Settings → API
- **Notion token**: [notion.so/my-integrations](https://www.notion.so/my-integrations) 에서 생성
- **Database ID**: Notion 데이터베이스 URL에서 추출 (`notion.so/{DATABASE_ID}?v=...`)

### 실행

```bash
# 동기화 실행
node sync/sync-notion.js

# 미리보기 (Notion에 실제로 추가하지 않음)
node sync/sync-notion.js --dry-run
```

Node.js 18+ 필요 (외부 패키지 불필요).

### Notion 데이터베이스 구조

#### Profile columns (개별)

| Column | Type | Source |
|---|---|---|
| Supabase ID | Title (메인) | `id` (serial) |
| Full Name | Rich text | `full_name` |
| Email | Email | `email` |
| Organization / Company | Rich text | `organization` |
| Country | Select | `country` → 텍스트 변환 |
| X or LinkedIn Profile | URL | `social_profile` |
| Submitted | Date | `created_at` |

#### Section columns (병합 텍스트)

| Column | 포함 필드 |
|---|---|
| Who You Are | affiliation, academicRole, industryRole, industry, startupRole, communities + Other fields |
| Robot & Hardware | robotAccess, robotType, robotBrand, simAccess + Other fields |
| Interest in RLDX | useCase, applications, shareWilling, shareType + Other fields |
| Event & Engagement | eventAttendance, referralSource + Other fields |

### Cron 설정

```crontab
# Notion sync every 5 minutes
*/5 * * * * /usr/bin/node /home/rlwrld/projects/waitlist/sync/sync-notion.js >> /home/rlwrld/projects/waitlist/sync/logs/sync.log 2>&1

# Daily backup at KST 00:00 (UTC 15:00)
0 15 * * * /usr/bin/node /home/rlwrld/projects/waitlist/sync/backup-supabase.js >> /home/rlwrld/projects/waitlist/sync/logs/backup.log 2>&1
```

## 일일 백업

`sync/backup-supabase.js`가 Supabase 전체 데이터를 `sync/backups/YYYY-MM-DD/waitlist.json`에 저장.
백업 후 자동으로 git commit + push.
