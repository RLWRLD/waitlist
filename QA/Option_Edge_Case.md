# RLDX Waitlist Form — Option & Interaction Edge Cases

> Generated from `index.html` source code analysis.
> 모든 "일반옵션"은 하나의 동치류(equivalence class)로 취급하여 가짓수를 축소함.

---

## 1. 상태 정의 (State Definitions)

### 텍스트 입력 (Text Input)

| 코드 | 상태 | 설명 |
|------|------|------|
| T1 | 미입력 | 빈 문자열 또는 공백만 입력 |
| T2 | 정상 입력 | 유효한 값 입력 |
| T3 | 조건 불충분 | 형식 불량 (이메일 형식 위반 등) |

### 단일 선택 (Radio / Dropdown)

| 코드 | 상태 | 설명 |
|------|------|------|
| R1 | 미선택 | 아무것도 선택하지 않음 |
| R2 | 일반 선택 | Other가 아닌 옵션 선택 |
| R3 | Other 선택 | "Other" 옵션 선택 |

### 복수 선택 (Checkbox) — None + Other 존재

| 코드 | 상태 | 설명 |
|------|------|------|
| C1 | 미선택 | 아무것도 체크하지 않음 |
| C2 | 단일-일반 | 일반옵션 1개만 체크 |
| C3 | 단일-None | None만 체크 |
| C4 | 단일-Other | Other만 체크 |
| C5 | 복수-일반+Other | 일반옵션 + Other 체크 |
| C6 | 복수시도-None+Other | None + Other 동시 체크 시도 (배타 로직 테스트) |
| C7 | 복수시도-None+일반 | None + 일반옵션 동시 체크 시도 (배타 로직 테스트) |
| C8 | 복수-일반만 | 일반옵션 2개 이상 체크 |

### 복수 선택 (Checkbox) — Exclusive(Just explore) 존재, Other 없음

| 코드 | 상태 | 설명 |
|------|------|------|
| U1 | 미선택 | 아무것도 체크하지 않음 |
| U2 | 단일-일반 | 일반옵션 1개만 체크 |
| U3 | 단일-Exclusive | Exclusive 옵션만 체크 |
| U4 | 복수-일반만 | 일반옵션 2개 이상 체크 |
| U5 | 복수시도-Exclusive+일반 | Exclusive + 일반옵션 동시 체크 시도 |

### 복수 선택 (Checkbox) — Other만 존재, None/Exclusive 없음

| 코드 | 상태 | 설명 |
|------|------|------|
| K1 | 미선택 | 아무것도 체크하지 않음 |
| K2 | 단일-일반 | 일반옵션 1개만 체크 |
| K3 | 단일-Other | Other만 체크 |
| K4 | 복수-일반+Other | 일반옵션 + Other 체크 |
| K5 | 복수-일반만 | 일반옵션 2개 이상 체크 |

### 복수 선택 (Checkbox) — Other/None/Exclusive 없음 (순수 체크박스)

| 코드 | 상태 | 설명 |
|------|------|------|
| P1 | 미선택 | 아무것도 체크하지 않음 |
| P2 | 단일 | 1개만 체크 |
| P3 | 복수 | 2개 이상 체크 |

---

## 2. 필드 인벤토리 (Field Inventory)

### Section 1: Contact Information

| 필드 | name | 타입 | 필수 | 검증 | 적용 상태 |
|------|------|------|------|------|-----------|
| Full Name | fullName | Text | Required | trim() 비어있으면 에러 | T1, T2, T3 |
| Email | email | Text | Required | trim() 비어있으면 에러 + regex 형식 검증 | T1, T2, T3 |
| Organization | organization | Text | Required | trim() 비어있으면 에러 | T1, T2, T3 |
| Country | country | Dropdown | Required | value 비어있으면 에러 | R1, R2 |
| Social Profile | socialProfile | Text (URL) | Optional | 검증 없음 | T1, T2 |

### Section 2: Who You Are

| 필드 | name | 타입 | 필수 | 조건 | 적용 상태 |
|------|------|------|------|------|-----------|
| Affiliation | affiliation | Radio | Required | 항상 표시 | R1, R2, R3 |
| Affiliation Other 텍스트 | affiliationOther | Text | **조건부 Required** | affiliation=other일 때만 표시 + required 동적 추가 | T1, T2 |
| Academic Role | academicRole | Radio | **조건부 Required** | affiliation=academic일 때만 표시 | R1, R2 |
| Industry Role | industryRole | Radio | **조건부 Required** | affiliation=industry일 때만 표시 | R1, R2 |
| Industry Type | industry | Checkbox (Other有) | Optional | affiliation=industry일 때만 표시 | K1, K2, K3, K4, K5 |
| Industry Other 텍스트 | industryOther | Text | Optional | industry의 Other 체크 시 표시 | T1, T2 |
| Startup Role | startupRole | Radio | **조건부 Required** | affiliation=startup일 때만 표시 | R1, R2, R3 |
| Startup Role Other 텍스트 | startupRoleOther | Text | **조건부 Required** | startupRole=other일 때만 표시 + required 동적 추가 | T1, T2 |
| Communities | communities | Checkbox (None+Other有) | Optional | 항상 표시 | C1, C2, C3, C4, C5, C6, C7, C8 |
| Communities Other 텍스트 | communitiesOther | Text | Optional | communities의 Other 체크 시 표시 | T1, T2 |

### Section 3: Robot & Hardware

| 필드 | name | 타입 | 필수 | 조건 | 적용 상태 |
|------|------|------|------|------|-----------|
| Robot Access | robotAccess | Radio | Required | 항상 표시 | R1, R2 |
| Robot Type | robotType | Checkbox (Other有) | Optional | robotAccess=own/lab/planning일 때 표시 | K1, K2, K3, K4, K5 |
| Robot Type Other 텍스트 | robotTypeOther | Text | Optional | robotType의 Other 체크 시 표시 | T1, T2 |
| Robot Brand | robotBrand | Checkbox (Other有) | Optional | robotAccess=own/lab/planning일 때 표시 | K1, K2, K3, K4, K5 |
| Robot Brand Other 텍스트 | robotBrandOther | Text | Optional | robotBrand의 Other 체크 시 표시 | T1, T2 |
| Sim Access | simAccess | Radio | Required | 항상 표시 | R1, R2 |

### Section 4: Interest in RLDX

| 필드 | name | 타입 | 필수 | 조건 | 적용 상태 |
|------|------|------|------|------|-----------|
| Use Case | useCase | Checkbox (Exclusive有: "Just explore") | **Required** | 항상 표시, validateCheckboxGroups에서 검증 | U1, U2, U3, U4, U5 |
| Applications | applications | Checkbox (Other有) | **Required** | 항상 표시, validateCheckboxGroups에서 검증 | K1, K2, K3, K4, K5 |
| Applications Other 텍스트 | applicationsOther | Text | Optional | applications의 Other 체크 시 표시 | T1, T2 |
| Share Willing | shareWilling | Radio | Required | 항상 표시 | R1, R2 |
| Share Type | shareType | Checkbox (순수) | Optional | shareWilling=yes일 때만 표시 | P1, P2, P3 |

### Section 5: Event & Engagement

| 필드 | name | 타입 | 필수 | 조건 | 적용 상태 |
|------|------|------|------|------|-----------|
| Event Attendance | eventAttendance | Radio | Required | 항상 표시 | R1, R2 |
| Referral Source | referralSource | Radio | Required | 항상 표시 | R1, R2, R3 |
| Referral Other 텍스트 | referralSourceOther | Text | **조건부 Required** | referralSource=other일 때만 표시 + required 동적 추가 | T1, T2 |

---

## 3. 카테고리 A: 텍스트 입력 엣지 케이스

### A-1. fullName (Required, trim 검증)

| ID | 입력 | 예상 결과 |
|----|------|-----------|
| TXT-01 | 빈칸 (미입력) | 에러: "Full Name is required" |
| TXT-02 | 공백만 ("   ") | 에러: "Full Name is required" (trim 후 빈칸) |
| TXT-03 | 정상 이름 ("John Doe") | 통과 |
| TXT-04 | 특수문자 포함 ("名前 / Ñame") | 통과 (문자 제한 없음) |
| TXT-05 | 매우 긴 문자열 (1000자+) | 통과 (길이 제한 없음) — **잠재 이슈** |

### A-2. email (Required, trim + regex 검증)

| ID | 입력 | 예상 결과 |
|----|------|-----------|
| TXT-06 | 빈칸 | 에러: "Email is required" |
| TXT-07 | 공백만 | 에러: "Email is required" |
| TXT-08 | 정상 이메일 ("user@company.com") | 통과 |
| TXT-09 | "@" 없음 ("usercompany.com") | 에러: "Please enter a valid email address" |
| TXT-10 | "." 없음 ("user@company") | 에러: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` 실패 |
| TXT-11 | "@" 앞 빈칸 ("@company.com") | 에러: regex 실패 |
| TXT-12 | "user@.com" | 통과 — **잠재 이슈**: regex가 `@` 뒤 `.` 앞에 문자 필수이지만 `.com` 부분은 통과 가능. 실제로 `[^\s@]+` 은 `.com`을 하나로 매칭하지 않고 `@` 뒤가 `.com`이면 `[^\s@]+` = 빈문자열이 아닌지 확인 필요 |
| TXT-13 | 공백 포함 ("user @company.com") | 에러: `[^\s@]+` 때문에 공백 불허 |
| TXT-14 | 중복 이메일 (이미 DB에 존재) | 서버 409 → **성공 메시지 표시** (email enumeration 방지) |

### A-3. organization (Required, trim 검증)

| ID | 입력 | 예상 결과 |
|----|------|-----------|
| TXT-15 | 빈칸 | 에러: "Organization is required" |
| TXT-16 | 공백만 | 에러: "Organization is required" |
| TXT-17 | 정상 입력 | 통과 |

### A-4. country (Required Dropdown)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| TXT-18 | 미선택 (기본값 "Select your country") | 에러: "Please select a country" |
| TXT-19 | 유효한 국가 선택 | 통과 |
| TXT-20 | "Other" 선택 | 통과 (후속 텍스트 필드 없음) |

### A-5. socialProfile (Optional, 검증 없음)

| ID | 입력 | 예상 결과 |
|----|------|-----------|
| TXT-21 | 빈칸 | 통과 (optional) |
| TXT-22 | 유효한 URL | 통과 |
| TXT-23 | URL이 아닌 텍스트 ("asdf") | 통과 — **잠재 이슈**: URL 검증 없음 |

---

## 4. 카테고리 B: 단일 선택 (Radio) 엣지 케이스

### B-1. affiliation (Required, 2차 질문 트리거)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| RAD-01 | 미선택으로 서브밋 | 에러: "Please select an option for Affiliation" |
| RAD-02 | "Academic" 선택 | 통과 + academicRoleField 나타남 |
| RAD-03 | "Industry" 선택 | 통과 + industryRoleField + industryField 나타남 |
| RAD-04 | "Startup" 선택 | 통과 + startupRoleField 나타남 |
| RAD-05 | "Investor / VC" 선택 | 통과 + 2차 질문 없음 |
| RAD-06 | "Media" 선택 | 통과 + 2차 질문 없음 |
| RAD-07 | "Independent" 선택 | 통과 + 2차 질문 없음 |
| RAD-08 | "Other" 선택 | 통과 + affiliationOtherField 나타남 (required) |

### B-2. academicRole (조건부 Required: affiliation=academic일 때)

| ID | 전제 조건 | 액션 | 예상 결과 |
|----|-----------|------|-----------|
| RAD-09 | affiliation=academic | 미선택으로 서브밋 | 에러: "Please select an option for Role" |
| RAD-10 | affiliation=academic | 일반 선택 | 통과 |
| RAD-11 | affiliation≠academic | 필드 숨김 상태 | isFieldVisible=false → 검증 스킵 |

### B-3. industryRole (조건부 Required: affiliation=industry일 때)

| ID | 전제 조건 | 액션 | 예상 결과 |
|----|-----------|------|-----------|
| RAD-12 | affiliation=industry | 미선택으로 서브밋 | 에러: "Please select an option for Role" |
| RAD-13 | affiliation=industry | 일반 선택 | 통과 |
| RAD-14 | affiliation≠industry | 필드 숨김 상태 | isFieldVisible=false → 검증 스킵 |

### B-4. startupRole (조건부 Required: affiliation=startup일 때, Other有)

| ID | 전제 조건 | 액션 | 예상 결과 |
|----|-----------|------|-----------|
| RAD-15 | affiliation=startup | 미선택으로 서브밋 | 에러: "Please select an option for Role" |
| RAD-16 | affiliation=startup | 일반 선택 (Founder) | 통과 |
| RAD-17 | affiliation=startup | "Other" 선택 | 통과 + startupRoleOtherField 나타남 (required) |
| RAD-18 | affiliation≠startup | 필드 숨김 상태 | isFieldVisible=false → 검증 스킵 |

### B-5. robotAccess (Required, 2차 질문 트리거)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| RAD-19 | 미선택으로 서브밋 | 에러: "Please select an option for Robot access" |
| RAD-20 | "own" 선택 | 통과 + robotTypeField + robotBrandField 나타남 |
| RAD-21 | "lab" 선택 | 통과 + robotTypeField + robotBrandField 나타남 |
| RAD-22 | "planning" 선택 | 통과 + robotTypeField + robotBrandField 나타남 |
| RAD-23 | "interested" 선택 | 통과 + robotTypeField + robotBrandField 숨김 |

### B-6. simAccess (Required, 2차 질문 없음)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| RAD-24 | 미선택으로 서브밋 | 에러: "Please select an option for Simulation environment" |
| RAD-25 | 아무 옵션 선택 | 통과 |

### B-7. shareWilling (Required, 2차 질문 트리거)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| RAD-26 | 미선택으로 서브밋 | 에러: "Please select an option for Sharing willingness" |
| RAD-27 | "yes" 선택 | 통과 + shareTypeField 나타남 |
| RAD-28 | "maybe" 선택 | 통과 + shareTypeField 숨김 |
| RAD-29 | "no" 선택 | 통과 + shareTypeField 숨김 |

### B-8. eventAttendance (Required, 2차 질문 없음)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| RAD-30 | 미선택으로 서브밋 | 에러: "Please select an option for Launch event attendance" |
| RAD-31 | 아무 옵션 선택 | 통과 |

### B-9. referralSource (Required, Other有)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| RAD-32 | 미선택으로 서브밋 | 에러: "Please select an option for How you heard about us" |
| RAD-33 | 일반 선택 | 통과 |
| RAD-34 | "Other" 선택 | 통과 + referralSourceOtherField 나타남 (required) |

---

## 5. 카테고리 C: 복수 선택 (Checkbox) 엣지 케이스

### C-1. communities (Optional, None+Other 배타 로직)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| CHK-01 | 미선택 | 통과 (optional) |
| CHK-02 | 일반옵션 1개 체크 (예: OpenArm) | 통과 |
| CHK-03 | None만 체크 | 통과, 원형 스타일 표시 |
| CHK-04 | Other만 체크 | 통과 + communitiesOtherField 나타남 |
| CHK-05 | 일반옵션 + Other 체크 | 통과 + communitiesOtherField 나타남 |
| CHK-06 | None 체크 → Other 체크 시도 | Other 체크 시 None 자동 해제, communitiesOtherField 나타남 |
| CHK-07 | Other 체크 → None 체크 시도 | None 체크 시 Other 자동 해제 + communitiesOtherField 숨김 + 텍스트 초기화 |
| CHK-08 | 일반옵션 2개 이상 체크 | 통과 |
| CHK-09 | 일반옵션 체크 → None 체크 | None 체크 시 일반옵션 모두 자동 해제 |
| CHK-10 | None 체크 → 일반옵션 체크 | 일반옵션 체크 시 None 자동 해제 |
| CHK-11 | 일반 + Other + 텍스트 입력 → None 체크 | 모두 해제 + 텍스트 필드 숨김 + 텍스트 초기화 |

### C-2. useCase (Required, "Just explore" 배타 로직, Other 없음)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| CHK-12 | 미선택으로 서브밋 | 에러: "Please select at least one option for What you want to do with RLDX" |
| CHK-13 | 일반옵션 1개 체크 (예: Benchmark) | 통과 |
| CHK-14 | "Just explore"만 체크 | 통과, 원형 스타일 표시 |
| CHK-15 | 일반옵션 2개 이상 체크 | 통과 |
| CHK-16 | 일반옵션 체크 → "Just explore" 체크 | Just explore 체크 시 일반옵션 모두 자동 해제 |
| CHK-17 | "Just explore" 체크 → 일반옵션 체크 | 일반옵션 체크 시 Just explore 자동 해제 |

### C-3. applications (Required, Other有, None/Exclusive 없음)

| ID | 액션 | 예상 결과 |
|----|------|-----------|
| CHK-18 | 미선택으로 서브밋 | 에러: "Please select at least one option for Tasks you are interested in" |
| CHK-19 | 일반옵션 1개 체크 | 통과 |
| CHK-20 | Other만 체크 | 통과 + applicationsOtherField 나타남 |
| CHK-21 | 일반옵션 + Other 체크 | 통과 + applicationsOtherField 나타남 |
| CHK-22 | 일반옵션 2개 이상 체크 | 통과 |
| CHK-23 | Other 체크 → Other 해제 | applicationsOtherField 숨김 + 텍스트 초기화 |

### C-4. industry (Optional, Other有, affiliation=industry일 때만 표시)

| ID | 전제 조건 | 액션 | 예상 결과 |
|----|-----------|------|-----------|
| CHK-24 | affiliation=industry | 미선택 | 통과 (optional, 검증 없음) |
| CHK-25 | affiliation=industry | 일반옵션 1개 체크 | 통과 |
| CHK-26 | affiliation=industry | Other만 체크 | 통과 + industryOtherField 나타남 |
| CHK-27 | affiliation=industry | 일반옵션 + Other 체크 | 통과 + industryOtherField 나타남 |
| CHK-28 | affiliation=industry | 일반옵션 2개 이상 체크 | 통과 |
| CHK-29 | affiliation≠industry | 필드 숨김 상태 | 검증 스킵 |

### C-5. robotType (Optional, Other有, robotAccess=own/lab/planning일 때만 표시)

| ID | 전제 조건 | 액션 | 예상 결과 |
|----|-----------|------|-----------|
| CHK-30 | robotAccess=own | 미선택 | 통과 (optional) |
| CHK-31 | robotAccess=own | 일반옵션 1개 체크 | 통과 |
| CHK-32 | robotAccess=own | Other만 체크 | 통과 + robotTypeOtherField 나타남 |
| CHK-33 | robotAccess=own | 일반옵션 + Other 체크 | 통과 + robotTypeOtherField 나타남 |
| CHK-34 | robotAccess=own | 일반옵션 2개 이상 체크 | 통과 |
| CHK-35 | robotAccess=interested | 필드 숨김 상태 | 검증 스킵 |

### C-6. robotBrand (Optional, Other有, robotAccess=own/lab/planning일 때만 표시)

| ID | 전제 조건 | 액션 | 예상 결과 |
|----|-----------|------|-----------|
| CHK-36 | robotAccess=lab | 미선택 | 통과 (optional) |
| CHK-37 | robotAccess=lab | 일반옵션 1개 체크 | 통과 |
| CHK-38 | robotAccess=lab | Other만 체크 | 통과 + robotBrandOtherField 나타남 |
| CHK-39 | robotAccess=lab | 일반옵션 + Other 체크 | 통과 + robotBrandOtherField 나타남 |
| CHK-40 | robotAccess=lab | 일반옵션 2개 이상 체크 | 통과 |
| CHK-41 | robotAccess=interested | 필드 숨김 상태 | 검증 스킵 |

### C-7. shareType (Optional, 순수 체크박스, shareWilling=yes일 때만 표시)

| ID | 전제 조건 | 액션 | 예상 결과 |
|----|-----------|------|-----------|
| CHK-42 | shareWilling=yes | 미선택 | 통과 (optional) |
| CHK-43 | shareWilling=yes | 1개 체크 | 통과 |
| CHK-44 | shareWilling=yes | 2개 모두 체크 | 통과 |
| CHK-45 | shareWilling≠yes | 필드 숨김 상태 | 검증 스킵 |

---

## 6. 카테고리 D: 조건부 로직 (2차 질문) 엣지 케이스

### D-1. Affiliation → 2차 질문 전환

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| CND-01 | Academic 선택 → academicRole 나타남 확인 | academicRoleField.visible=true |
| CND-02 | Industry 선택 → industryRole + industry 나타남 확인 | 두 필드 모두 visible |
| CND-03 | Startup 선택 → startupRole 나타남 확인 | startupRoleField.visible=true |
| CND-04 | Investor 선택 → 2차 질문 없음 확인 | 모든 조건부 필드 hidden |
| CND-05 | Other 선택 → affiliationOtherField 나타남 확인 | affiliationOtherField.visible=true, input에 required 속성 추가 |
| CND-06 | Academic 선택 → academicRole 입력 → Industry로 변경 | academicRole 숨김+초기화, industryRole+industry 나타남 |
| CND-07 | Industry 선택 → industryRole+industry 입력 → Startup으로 변경 | industryRole+industry 숨김+초기화, startupRole 나타남 |
| CND-08 | Startup 선택 → startupRole 입력 → Academic으로 변경 | startupRole 숨김+초기화, academicRole 나타남 |
| CND-09 | Other 선택 → 텍스트 입력 → Academic으로 변경 | affiliationOtherField 숨김+초기화+required 제거, academicRole 나타남 |
| CND-10 | Academic 선택 → academicRole 입력 → Investor로 변경 | academicRole 숨김+초기화, 2차 질문 없음 |
| CND-11 | Industry 선택 → industry에서 Other 체크+텍스트 입력 → Startup으로 변경 | industry 숨김+초기화 (Other 텍스트 포함), industryOtherField 숨김 |

### D-2. Startup Role → Other 텍스트 전환

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| CND-12 | affiliation=startup → startupRole=Other 선택 | startupRoleOtherField 나타남, input에 required 추가 |
| CND-13 | startupRole=Other → 텍스트 입력 → startupRole=Founder로 변경 | startupRoleOtherField 숨김+초기화+required 제거 |
| CND-14 | startupRole=Other → 텍스트 미입력 → 서브밋 | 에러: "Please specify" |
| CND-15 | startupRole=Other → 텍스트 입력 → 서브밋 | 통과 |

### D-3. Robot Access → 2차 질문 전환

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| CND-16 | "own" 선택 → robotType+robotBrand 나타남 확인 | 두 필드 모두 visible |
| CND-17 | "lab" 선택 → robotType+robotBrand 나타남 확인 | 두 필드 모두 visible |
| CND-18 | "planning" 선택 → robotType+robotBrand 나타남 확인 | 두 필드 모두 visible |
| CND-19 | "interested" 선택 → robotType+robotBrand 숨김 확인 | 두 필드 모두 hidden |
| CND-20 | "own" 선택 → robotType+robotBrand 입력 → "interested"로 변경 | 두 필드 숨김+모든 체크+텍스트 초기화 |
| CND-21 | "own" 선택 → robotType 입력 → "lab"으로 변경 | **두 필드 유지** (own→lab은 둘 다 hasRobot=true이므로 초기화 없음) |
| CND-22 | "own" 선택 → robotType Other 체크+텍스트 입력 → "interested"로 변경 | 모든 체크 해제 + Other 텍스트 필드 숨김 + 텍스트 초기화 |
| CND-23 | "interested" 선택 → "planning"으로 변경 | robotType+robotBrand 나타남 (빈 상태) |

### D-4. Share Willing → Share Type 전환

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| CND-24 | "yes" 선택 → shareType 나타남 확인 | shareTypeField.visible=true |
| CND-25 | "yes" 선택 → shareType 체크 → "no"로 변경 | shareType 숨김+초기화 |
| CND-26 | "yes" 선택 → shareType 체크 → "maybe"로 변경 | shareType 숨김+초기화 |
| CND-27 | "no" 선택 → "yes"로 변경 | shareType 나타남 (빈 상태) |

### D-5. Referral Source → Other 텍스트 전환

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| CND-28 | referralSource=Other 선택 | referralSourceOtherField 나타남, input에 required 추가 |
| CND-29 | referralSource=Other → 텍스트 입력 → 일반 선택으로 변경 | 필드 숨김+초기화+required 제거 |
| CND-30 | referralSource=Other → 텍스트 미입력 → 서브밋 | 에러: "Please specify" |
| CND-31 | referralSource=Other → 텍스트 입력 → 서브밋 | 통과 |

---

## 7. 카테고리 E: 상호배타 (Mutual Exclusion) 엣지 케이스

### E-1. Communities "None" 배타 로직

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| EXC-01 | None 체크 → OpenArm 체크 | None 자동 해제, OpenArm만 체크 상태 |
| EXC-02 | OpenArm 체크 → None 체크 | OpenArm 자동 해제, None만 체크 상태 |
| EXC-03 | OpenArm + LeRobot 체크 → None 체크 | 둘 다 자동 해제, None만 체크 상태 |
| EXC-04 | None 체크 → Other 체크 | None 자동 해제, Other 체크 + 텍스트 필드 나타남 |
| EXC-05 | Other 체크 + 텍스트 입력 → None 체크 | Other 자동 해제 + 텍스트 필드 숨김 + 텍스트 초기화, None만 체크 |
| EXC-06 | OpenArm + Other + 텍스트 → None 체크 | 모두 해제 + 텍스트 필드 숨김 + 텍스트 초기화 |
| EXC-07 | None 체크 → None 해제 | 아무것도 체크되지 않은 상태 (정상) |

### E-2. UseCase "Just explore" 배타 로직

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| EXC-08 | Just explore 체크 → Benchmark 체크 | Just explore 자동 해제, Benchmark만 체크 |
| EXC-09 | Benchmark 체크 → Just explore 체크 | Benchmark 자동 해제, Just explore만 체크 |
| EXC-10 | Benchmark + Finetune 체크 → Just explore 체크 | 둘 다 자동 해제, Just explore만 체크 |
| EXC-11 | Just explore 체크 → Just explore 해제 | 아무것도 체크되지 않은 상태 |
| EXC-12 | Just explore 체크 → 서브밋 | 통과 (최소 1개 선택 충족) |

---

## 8. 카테고리 F: Other + 텍스트 필드 상호작용 엣지 케이스

### F-1. Other 텍스트가 **조건부 Required**인 경우 (specifyRequired: true)

적용 대상: affiliationOther, startupRoleOther, referralSourceOther

| ID | 대상 | 시나리오 | 예상 결과 |
|----|------|----------|-----------|
| OTH-01 | affiliation | Other 선택 → 텍스트 미입력 → 서브밋 | 에러: "Please specify" |
| OTH-02 | affiliation | Other 선택 → 텍스트 입력 → 서브밋 | 통과 |
| OTH-03 | affiliation | Other 선택 → 공백만 입력 → 서브밋 | 에러: "Please specify" (trim 검증) |
| OTH-04 | affiliation | Other 선택 → 텍스트 입력 → 다른 옵션으로 변경 → 서브밋 | 통과 (필드 숨김+required 제거됨) |
| OTH-05 | affiliation | Other 선택 → 텍스트 미입력 → 다른 옵션으로 변경 → 서브밋 | 통과 (필드 숨김됨, 검증 대상 아님) |
| OTH-06 | startupRole | Other 선택 → 텍스트 미입력 → 서브밋 | 에러: "Please specify" |
| OTH-07 | startupRole | Other 선택 → 텍스트 입력 → 서브밋 | 통과 |
| OTH-08 | startupRole | Other 선택 → 텍스트 입력 → Founder 선택 → 서브밋 | 통과 (텍스트 필드 숨김+초기화) |
| OTH-09 | referralSource | Other 선택 → 텍스트 미입력 → 서브밋 | 에러: "Please specify" |
| OTH-10 | referralSource | Other 선택 → 텍스트 입력 → 서브밋 | 통과 |
| OTH-11 | referralSource | Other 선택 → 텍스트 입력 → 일반 선택 → 서브밋 | 통과 |

### F-2. Other 텍스트가 **Optional**인 경우

적용 대상: communitiesOther, industryOther, robotTypeOther, robotBrandOther, applicationsOther

| ID | 대상 | 시나리오 | 예상 결과 |
|----|------|----------|-----------|
| OTH-12 | communities | Other 체크 → 텍스트 미입력 → 서브밋 | 통과 (optional) |
| OTH-13 | communities | Other 체크 → 텍스트 입력 → 서브밋 | 통과 |
| OTH-14 | communities | Other 체크 → 텍스트 입력 → Other 해제 → 서브밋 | 통과 (텍스트 필드 숨김+초기화, 데이터 미전송) |
| OTH-15 | industry | Other 체크 → 텍스트 미입력 → 서브밋 | 통과 (optional) |
| OTH-16 | industry | Other 체크 → 텍스트 입력 → 서브밋 | 통과 |
| OTH-17 | robotType | Other 체크 → 텍스트 미입력 → 서브밋 | 통과 (optional) |
| OTH-18 | robotType | Other 체크 → 텍스트 입력 → 서브밋 | 통과 |
| OTH-19 | robotBrand | Other 체크 → 텍스트 미입력 → 서브밋 | 통과 (optional) |
| OTH-20 | robotBrand | Other 체크 → 텍스트 입력 → 서브밋 | 통과 |
| OTH-21 | applications | Other 체크 → 텍스트 미입력 → 서브밋 | 통과 (optional) |
| OTH-22 | applications | Other 체크 → 텍스트 입력 → 서브밋 | 통과 |

### F-3. Other 텍스트 필드 표시/숨김 UI 동작

| ID | 대상 | 시나리오 | 예상 결과 |
|----|------|----------|-----------|
| OTH-23 | 모든 checkbox Other | Other 체크 | 텍스트 필드 나타남 (fadeIn 애니메이션) |
| OTH-24 | 모든 checkbox Other | Other 해제 | 텍스트 필드 숨김 + 텍스트 값 초기화 |
| OTH-25 | 모든 radio Other | Other 선택 | 텍스트 필드 나타남 |
| OTH-26 | 모든 radio Other | Other → 일반 선택 | 텍스트 필드 숨김 + 텍스트 값 초기화 + required 제거 |

---

## 9. 카테고리 G: 폼 제출 & 유효성 검증 엣지 케이스

### G-1. 유효성 검증 조합 (서브밋 시)

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| SUB-01 | 모든 필수 필드 정상 입력 → 서브밋 | 성공 메시지 표시 |
| SUB-02 | fullName만 비우고 나머지 정상 → 서브밋 | 에러 1개: fullName, 스크롤 to fullName |
| SUB-03 | email만 비우고 나머지 정상 → 서브밋 | 에러 1개: email |
| SUB-04 | organization만 비우고 나머지 정상 → 서브밋 | 에러 1개: organization |
| SUB-05 | country만 미선택 나머지 정상 → 서브밋 | 에러 1개: country |
| SUB-06 | affiliation만 미선택 나머지 정상 → 서브밋 | 에러 1개: affiliation |
| SUB-07 | robotAccess만 미선택 나머지 정상 → 서브밋 | 에러 1개: robotAccess |
| SUB-08 | simAccess만 미선택 나머지 정상 → 서브밋 | 에러 1개: simAccess |
| SUB-09 | useCase 미선택 나머지 정상 → 서브밋 | 에러 1개: useCase |
| SUB-10 | applications 미선택 나머지 정상 → 서브밋 | 에러 1개: applications |
| SUB-11 | shareWilling 미선택 나머지 정상 → 서브밋 | 에러 1개: shareWilling |
| SUB-12 | eventAttendance 미선택 나머지 정상 → 서브밋 | 에러 1개: eventAttendance |
| SUB-13 | referralSource 미선택 나머지 정상 → 서브밋 | 에러 1개: referralSource |
| SUB-14 | 모든 필수 필드 비우고 서브밋 | 다중 에러, 스크롤 to 첫 번째 에러 (fullName) |
| SUB-15 | affiliation=academic + academicRole 미선택 → 서브밋 | 에러: academicRole (조건부 필수 검증) |
| SUB-16 | affiliation=industry + industryRole 미선택 → 서브밋 | 에러: industryRole |
| SUB-17 | affiliation=startup + startupRole 미선택 → 서브밋 | 에러: startupRole |
| SUB-18 | affiliation=other + affiliationOther 미입력 → 서브밋 | 에러: "Please specify" |
| SUB-19 | affiliation=startup + startupRole=other + startupRoleOther 미입력 → 서브밋 | 에러: "Please specify" |
| SUB-20 | referralSource=other + referralSourceOther 미입력 → 서브밋 | 에러: "Please specify" |

### G-2. 숨겨진 조건부 필드가 서브밋에 영향 없음 확인

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| SUB-21 | affiliation=academic → academicRole 입력 → affiliation=investor로 변경 → 서브밋 | 통과 (academicRole 숨김 → isFieldVisible=false → 검증 스킵) |
| SUB-22 | affiliation=other → 텍스트 입력 → affiliation=academic → academicRole 입력 → 서브밋 | 통과 (affiliationOther 숨김 → required 제거됨) |
| SUB-23 | robotAccess=own → robotType+robotBrand 입력 → robotAccess=interested → 서브밋 | 통과 (robotType+robotBrand 숨김+초기화) |
| SUB-24 | shareWilling=yes → shareType 체크 → shareWilling=no → 서브밋 | 통과 (shareType 숨김+초기화) |

### G-3. 에러 표시/해제 UI 동작

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| SUB-25 | 서브밋 → 에러 표시 → 에러 필드에 값 입력 | 해당 필드 에러 스타일(.has-error)+메시지 자동 제거 |
| SUB-26 | 서브밋 → 에러 표시 → 에러 라디오 그룹에서 선택 | 해당 그룹 에러 스타일+메시지 자동 제거 |
| SUB-27 | 서브밋 → 다중 에러 → 하나씩 수정 | 수정한 필드만 에러 제거, 나머지 에러 유지 |
| SUB-28 | 서브밋 → 에러 표시 → 재서브밋 (에러 미수정) | 이전 에러 clearAllErrors로 제거 후 동일 에러 재표시 |
| SUB-29 | 서브밋 → 첫 에러로 스크롤 확인 | window.scrollTo 호출, 헤더 높이 + 20px 오프셋 반영 |

---

## 10. 카테고리 H: 데이터 무결성 (Supabase) 엣지 케이스

### H-1. FormData 수집 정확성

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| DAT-01 | 모든 필드 정상 입력 → 서브밋 | form_data JSON에 모든 key/value 포함 |
| DAT-02 | checkbox 복수 선택 (예: robotType=humanoid,bimanual) | form_data에 robotType: ["humanoid", "bimanual"] (배열) |
| DAT-03 | checkbox 단일 선택 | form_data에 robotType: "humanoid" (문자열) |
| DAT-04 | optional 텍스트 미입력 (socialProfile) | social_profile: null |
| DAT-05 | Other 체크 + 텍스트 입력 | form_data에 해당 Other value + Other 텍스트 모두 포함 |
| DAT-06 | affiliation=industry → industry 체크 + Other 체크 + 텍스트 → affiliation 변경 → 서브밋 | form_data에 industry/industryOther **미포함** 확인 (clearFieldInputs로 초기화됨) |
| DAT-07 | 숨겨진 조건부 필드의 잔여 데이터 | clearFieldInputs 후 value="" → FormData에 빈 문자열로 포함될 수 있음 — **잠재 이슈**: 빈 key가 form_data에 포함 |
| DAT-08 | honeypot 필드 (website) | formData.delete('website') → form_data에 미포함 |

### H-2. Supabase 전송 정확성

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| DAT-09 | 정상 서브밋 | POST body: email, full_name, organization, country, social_profile, form_data |
| DAT-10 | 중복 이메일 서브밋 | 409 응답 → 성공 메시지 표시 (email enumeration 방지) |
| DAT-11 | 서버 500 에러 | alert("Something went wrong...") + 버튼 재활성화 |
| DAT-12 | 네트워크 오류 (fetch 실패) | catch 블록 → alert + 버튼 재활성화 |

---

## 11. 카테고리 I: 안티스팸 & Rate Limit 엣지 케이스

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| SPM-01 | honeypot 필드에 값 입력 → 서브밋 | 가짜 성공 (폼 숨김 + 성공 메시지), Supabase 전송 안함 |
| SPM-02 | 정상 서브밋 후 3초 이내 재서브밋 | alert("Please wait a moment before submitting again.") |
| SPM-03 | 정상 서브밋 후 3초 이후 재서브밋 | 성공 (이미 성공 메시지 표시 상태이므로 폼 숨김 상태) |
| SPM-04 | 서브밋 중 버튼 상태 | disabled=true, 텍스트="Submitting..." |
| SPM-05 | 서브밋 실패 후 버튼 상태 | disabled=false, 텍스트=원래 텍스트 복원 |

---

## 12. 카테고리 J: 복합 시나리오 (Cross-Field Combinations)

### J-1. 최소 입력 시나리오 (Minimum Valid Submission)

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| CRS-01 | 필수 필드만 최소로 입력: fullName+email+org+country+affiliation(investor)+robotAccess(interested)+simAccess+useCase(1개)+applications(1개)+shareWilling(no)+eventAttendance+referralSource | 성공: 조건부 필드 없이 최소 서브밋 |
| CRS-02 | CRS-01 + socialProfile 추가 | 성공: optional 필드 포함 |

### J-2. 최대 입력 시나리오 (Maximum Valid Submission)

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| CRS-03 | 모든 필드 입력: affiliation=industry → industryRole+모든 industry 체크+Other+텍스트 + 모든 communities+Other+텍스트 + robotAccess=own → 모든 robotType+Other+텍스트 + 모든 robotBrand+Other+텍스트 + 모든 useCase (Just explore 제외) + 모든 applications+Other+텍스트 + shareWilling=yes → 모든 shareType + referralSource=other+텍스트 | 성공: 모든 데이터 정상 전송 |

### J-3. 조건부 필드 연쇄 전환 시나리오

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| CRS-04 | Academic → role 입력 → Industry로 변경 → role+industry 입력 → Startup으로 변경 → role 입력 → Other로 변경 → 텍스트 입력 → Investor로 변경 → 서브밋 | 성공: 최종 상태(Investor)만 전송, 이전 2차 데이터 모두 초기화 |
| CRS-05 | robotAccess=own → type+brand 입력 → interested → own → 서브밋 | robotType+robotBrand **빈 상태**: interested 전환 시 초기화됨, 다시 own 전환 시 빈 필드 표시 |
| CRS-06 | shareWilling=yes → shareType 체크 → no → yes → 서브밋 | shareType **빈 상태**: no 전환 시 초기화됨, 다시 yes 전환 시 빈 필드 표시 |

### J-4. 에러 후 조건부 필드 변경 시나리오

| ID | 시나리오 | 예상 결과 |
|----|----------|-----------|
| CRS-07 | affiliation=academic + academicRole 미선택 → 서브밋(에러) → affiliation=investor로 변경 → 서브밋 | academicRole 에러 사라짐 (필드 숨김), 검증 통과 |
| CRS-08 | affiliation=other + 텍스트 미입력 → 서브밋(에러) → affiliation=academic → academicRole 선택 → 서브밋 | affiliationOther 에러 사라짐, academicRole 검증 통과 |
| CRS-09 | referralSource=other + 텍스트 미입력 → 서브밋(에러) → referralSource=social → 서브밋 | referralSourceOther 에러 사라짐, 검증 통과 |

---

## 테스트 케이스 총 집계

| 카테고리 | 케이스 수 |
|----------|-----------|
| A. 텍스트 입력 | 23 |
| B. 단일 선택 (Radio/Dropdown) | 34 |
| C. 복수 선택 (Checkbox) | 45 |
| D. 조건부 로직 (2차 질문) | 31 |
| E. 상호배타 (Mutual Exclusion) | 12 |
| F. Other + 텍스트 필드 | 26 |
| G. 폼 제출 & 유효성 검증 | 29 |
| H. 데이터 무결성 | 12 |
| I. 안티스팸 & Rate Limit | 5 |
| J. 복합 시나리오 | 9 |
| **총계** | **226** |
