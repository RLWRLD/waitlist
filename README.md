# RLDX Waitlist

RLDX Early Access 대기자 등록 페이지 + Notion 동기화 스크립트.

## 구조

```
waitlist/
├── index.html                  # Waitlist 폼 (HTML/CSS/JS + Supabase)
├── rlwrld/
│   ├── css/styles.css          # 공통 스타일
│   ├── js/script.js            # 공통 JS (progress bar, scroll 등)
│   └── assets/logos/           # 로고 SVG
├── sync-notion.js              # Supabase → Notion 동기화 스크립트
├── sync-config.json            # API 키 설정 (gitignored)
├── sync-config.example.json    # 설정 파일 템플릿
└── SUPABASE_SETUP.md           # Supabase 테이블/RLS 설정 가이드
```

## Waitlist 폼

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

- 코드값을 사람이 읽을 수 있는 라벨로 변환 (예: `rd` → `R&D / Research`)
- 조건부 필드는 해당하는 것만 표시 (예: Academic이면 Industry 필드 제외)
- 각 entry마다 Notion 페이지에 5개 섹션으로 구조화된 프로필 생성
- email 기준 중복 방지

### 설정

1. `sync-config.example.json`을 `sync-config.json`으로 복사:

```bash
cp sync-config.example.json sync-config.json
```

2. `sync-config.json`에 실제 키 입력:

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
node sync-notion.js

# 미리보기 (Notion에 실제로 추가하지 않음)
node sync-notion.js --dry-run
```

Node.js 18+ 필요 (외부 패키지 불필요).

### Notion 데이터베이스 구조

| Property | Type | 용도 |
|---|---|---|
| Name | Title | 이름 |
| Email | Email | 이메일 |
| Organization | Text | 소속 |
| Country | Select | 국가 |
| Affiliation | Select | 소속 유형 (Academic, Startup 등) |
| Role | Text | 역할 (affiliation에 따라 다름) |
| Robot Access | Select | 로봇 보유 여부 |
| Sim Access | Select | 시뮬레이션 환경 |
| Use Cases | Multi-select | RLDX 사용 목적 |
| Applications | Multi-select | 관심 태스크 |
| Event | Select | 런칭 이벤트 참석 |
| Referral | Select | 유입 경로 |
| Share Willing | Select | 경험 공유 의향 |
| Social Profile | URL | X/LinkedIn |
| Submitted | Date | 제출일 |

각 row를 클릭하면 상세 프로필 (Contact, Background, Hardware, Interest, Engagement) 확인 가능.
