# RLDX Waitlist Form — Option Edge Case Checklist

> 226개 전수 테스트 체크리스트. 이 체크리스트의 모든 항목을 통과하면 옵션 관련 미지의 엣지 케이스는 존재하지 않음.
> 참조: `Option_Edge_Case.md`

## 테스트 환경 준비

- [ ] 로컬 서버 실행 (`npx serve .` 또는 `python3 -m http.server 8080`)
- [ ] 브라우저에서 폼 페이지 열기
- [ ] DevTools > Network 탭 열기 (Supabase 요청 확인용)
- [ ] DevTools > Console 열기 (에러 확인용)
- [ ] 매 세션 시작 전 **페이지 새로고침**하여 초기 상태 확인

### 공통 확인 기준

모든 "에러" 항목에서 아래 3가지를 반드시 확인:
1. **빨간 테두리**: 해당 필드의 `.form-group`에 빨간 border(`#e05252`) 표시
2. **에러 메시지**: 해당 필드 하단에 빨간 텍스트로 에러 메시지 표시
3. **스크롤**: 가장 위에 있는 에러 필드로 자동 스크롤 (헤더 높이 + 20px 오프셋)

---

## 세션 1: 텍스트 입력 필드 (23개)

> 전제: 나머지 모든 필수 필드는 정상 입력 상태. 테스트 대상 필드만 변경.

### 1-1. Full Name

- [ ] **TXT-01** 빈칸 상태로 서브밋 → 빨간 테두리 + "Full Name is required" 메시지 + 해당 필드로 스크롤
- [ ] **TXT-02** 공백 3칸("   ")만 입력 후 서브밋 → 동일 에러 (trim 후 빈 문자열)
- [ ] **TXT-03** "John Doe" 입력 후 서브밋 → 에러 없음, 통과
- [ ] **TXT-04** 특수문자/유니코드 "名前 / Ñame" 입력 → 에러 없음, 통과
- [ ] **TXT-05** 1000자 이상 긴 문자열 입력 → 에러 없음, 통과 (잠재 이슈 기록)

### 1-2. Email

- [ ] **TXT-06** 빈칸 상태로 서브밋 → "Email is required"
- [ ] **TXT-07** 공백만 입력 후 서브밋 → "Email is required"
- [ ] **TXT-08** "user@company.com" 입력 → 통과
- [ ] **TXT-09** "usercompany.com" (@ 없음) 입력 후 서브밋 → "Please enter a valid email address"
- [ ] **TXT-10** "user@company" (. 없음) 입력 후 서브밋 → 이메일 형식 에러
- [ ] **TXT-11** "@company.com" (@ 앞 없음) 입력 후 서브밋 → 이메일 형식 에러
- [ ] **TXT-12** "user@.com" 입력 → 결과 기록 (regex 경계 케이스, 잠재 이슈)
- [ ] **TXT-13** "user @company.com" (공백 포함) 입력 후 서브밋 → 이메일 형식 에러
- [ ] **TXT-14** 이미 등록된 이메일로 서브밋 → 409 응답이지만 **성공 메시지** 표시 (동일 UX)

### 1-3. Organization

- [ ] **TXT-15** 빈칸 상태로 서브밋 → "Organization is required"
- [ ] **TXT-16** 공백만 입력 후 서브밋 → 동일 에러
- [ ] **TXT-17** 정상 텍스트 입력 → 통과

### 1-4. Country (Dropdown)

- [ ] **TXT-18** 기본값 "Select your country" 상태로 서브밋 → "Please select a country" + 빨간 테두리
- [ ] **TXT-19** 유효한 국가 (예: "South Korea") 선택 → 통과
- [ ] **TXT-20** "Other" 선택 → 통과 (후속 텍스트 필드 없음 확인)

### 1-5. Social Profile (Optional)

- [ ] **TXT-21** 빈칸 상태로 서브밋 → 에러 없음 (optional)
- [ ] **TXT-22** "https://x.com/test" 입력 → 통과
- [ ] **TXT-23** "asdf" (URL 아닌 텍스트) 입력 → 통과 (검증 없음, 잠재 이슈 기록)

---

## 세션 2: 단일 선택 (Radio/Dropdown) (34개)

> 전제: 나머지 모든 필수 필드는 정상 입력 상태. 테스트 대상 필드만 변경.
> 매 테스트 후 페이지 새로고침 또는 해당 필드만 초기화.

### 2-1. Affiliation (1차 질문 + 2차 질문 트리거)

- [ ] **RAD-01** 미선택 상태로 서브밋 → "Please select an option for Affiliation" + 빨간 테두리 + 스크롤
- [ ] **RAD-02** "Academic" 선택 → academicRole 질문 즉시 나타남 확인 (fadeIn 애니메이션)
- [ ] **RAD-03** "Industry" 선택 → industryRole + industry 질문 둘 다 나타남 확인
- [ ] **RAD-04** "Startup" 선택 → startupRole 질문 나타남 확인
- [ ] **RAD-05** "Investor / VC" 선택 → 2차 질문 아무것도 나타나지 않음 확인
- [ ] **RAD-06** "Media" 선택 → 2차 질문 아무것도 나타나지 않음 확인
- [ ] **RAD-07** "Independent" 선택 → 2차 질문 아무것도 나타나지 않음 확인
- [ ] **RAD-08** "Other" 선택 → affiliationOther 텍스트 필드 나타남 확인

### 2-2. Academic Role (affiliation=academic 전제)

- [ ] **RAD-09** affiliation=Academic 선택 + academicRole 미선택 상태로 서브밋 → "Please select an option for Role" + 빨간 테두리
- [ ] **RAD-10** academicRole에서 아무 옵션 선택 → 에러 없음
- [ ] **RAD-11** affiliation을 Academic 외 다른 것으로 변경 → academicRole 필드 숨김 상태에서 서브밋 시 검증 스킵 확인

### 2-3. Industry Role (affiliation=industry 전제)

- [ ] **RAD-12** affiliation=Industry 선택 + industryRole 미선택 상태로 서브밋 → "Please select an option for Role"
- [ ] **RAD-13** industryRole에서 아무 옵션 선택 → 에러 없음
- [ ] **RAD-14** affiliation을 Industry 외로 변경 → industryRole 숨김, 서브밋 시 검증 스킵

### 2-4. Startup Role (affiliation=startup 전제)

- [ ] **RAD-15** affiliation=Startup 선택 + startupRole 미선택 상태로 서브밋 → "Please select an option for Role"
- [ ] **RAD-16** startupRole에서 "Founder / C-level" 선택 → 에러 없음
- [ ] **RAD-17** startupRole에서 "Other" 선택 → startupRoleOther 텍스트 필드 나타남 확인
- [ ] **RAD-18** affiliation을 Startup 외로 변경 → startupRole 숨김, 서브밋 시 검증 스킵

### 2-5. Robot Access (1차 질문 + 2차 질문 트리거)

- [ ] **RAD-19** 미선택 상태로 서브밋 → "Please select an option for Robot access" + 빨간 테두리
- [ ] **RAD-20** "Yes, I own/operate robots" 선택 → robotType + robotBrand 질문 둘 다 나타남
- [ ] **RAD-21** "Yes, through my lab/company" 선택 → robotType + robotBrand 나타남
- [ ] **RAD-22** "No, but planning to get one" 선택 → robotType + robotBrand 나타남
- [ ] **RAD-23** "No, just interested" 선택 → robotType + robotBrand 숨김 확인

### 2-6. Sim Access

- [ ] **RAD-24** 미선택 상태로 서브밋 → "Please select an option for Simulation environment" + 빨간 테두리
- [ ] **RAD-25** 아무 옵션 선택 후 서브밋 → 에러 없음

### 2-7. Share Willing (1차 질문 + 2차 질문 트리거)

- [ ] **RAD-26** 미선택 상태로 서브밋 → "Please select an option for Sharing willingness" + 빨간 테두리
- [ ] **RAD-27** "Yes" 선택 → shareType 질문 나타남 확인
- [ ] **RAD-28** "Maybe, depends on results" 선택 → shareType 숨김 확인
- [ ] **RAD-29** "No, prefer private" 선택 → shareType 숨김 확인

### 2-8. Event Attendance

- [ ] **RAD-30** 미선택 상태로 서브밋 → "Please select an option for Launch event attendance" + 빨간 테두리
- [ ] **RAD-31** 아무 옵션 선택 후 서브밋 → 에러 없음

### 2-9. Referral Source (Other 有)

- [ ] **RAD-32** 미선택 상태로 서브밋 → "Please select an option for How you heard about us" + 빨간 테두리
- [ ] **RAD-33** 일반 옵션 (예: "RLWRLD website") 선택 → 에러 없음
- [ ] **RAD-34** "Other" 선택 → referralSourceOther 텍스트 필드 나타남 확인

---

## 세션 3: 복수 선택 (Checkbox) (45개)

### 3-1. Communities (Optional, None+Other 배타)

- [ ] **CHK-01** 아무것도 미선택 상태로 서브밋 → 에러 없음 (optional)
- [ ] **CHK-02** 일반옵션 1개(OpenArm) 체크 → 에러 없음
- [ ] **CHK-03** None만 체크 → 에러 없음 + 원형(circle) 체크 스타일 표시 확인
- [ ] **CHK-04** Other만 체크 → communitiesOther 텍스트 필드 나타남
- [ ] **CHK-05** 일반옵션(OpenArm) + Other 동시 체크 → 둘 다 체크 유지 + 텍스트 필드 나타남
- [ ] **CHK-06** None 먼저 체크 → Other 체크 → None **자동 해제** 확인 + 텍스트 필드 나타남
- [ ] **CHK-07** Other 체크 + 텍스트 입력 → None 체크 → Other **자동 해제** + 텍스트 필드 **숨김** + 입력값 **초기화** 확인
- [ ] **CHK-08** 일반옵션 2개 이상(OpenArm + LeRobot) 체크 → 둘 다 체크 유지
- [ ] **CHK-09** 일반옵션(OpenArm) 체크 → None 체크 → OpenArm **자동 해제**, None만 남음
- [ ] **CHK-10** None 체크 → 일반옵션(OpenArm) 체크 → None **자동 해제**, OpenArm만 남음
- [ ] **CHK-11** OpenArm + Other 체크 + 텍스트 "test" 입력 → None 체크 → 전부 해제 + 텍스트 필드 숨김 + 텍스트 값 빈칸 확인

### 3-2. Use Case (Required, "Just explore" 배타)

- [ ] **CHK-12** 미선택 상태로 서브밋 → "Please select at least one option for What you want to do with RLDX" + 빨간 테두리
- [ ] **CHK-13** 일반옵션 1개(Benchmark) 체크 후 서브밋 → 에러 없음
- [ ] **CHK-14** "Just explore"만 체크 → 에러 없음 + 원형(circle) 체크 스타일 확인
- [ ] **CHK-15** 일반옵션 2개 이상 체크 → 에러 없음
- [ ] **CHK-16** Benchmark 체크 → "Just explore" 체크 → Benchmark **자동 해제**, Just explore만 남음
- [ ] **CHK-17** "Just explore" 체크 → Benchmark 체크 → Just explore **자동 해제**, Benchmark만 남음

### 3-3. Applications (Required, Other 有)

- [ ] **CHK-18** 미선택 상태로 서브밋 → "Please select at least one option for Tasks you are interested in" + 빨간 테두리
- [ ] **CHK-19** 일반옵션 1개 체크 후 서브밋 → 에러 없음
- [ ] **CHK-20** Other만 체크 → applicationsOther 텍스트 필드 나타남
- [ ] **CHK-21** 일반옵션 + Other 체크 → 둘 다 체크 유지 + 텍스트 필드 나타남
- [ ] **CHK-22** 일반옵션 2개 이상 체크 → 에러 없음
- [ ] **CHK-23** Other 체크 → Other 해제 → 텍스트 필드 **숨김** + 텍스트 값 **초기화** 확인

### 3-4. Industry (Optional, Other 有, affiliation=industry 전제)

> affiliation을 "Industry"로 선택한 상태에서 테스트

- [ ] **CHK-24** 아무것도 미선택 상태로 서브밋 → 에러 없음 (optional, 검증 없음)
- [ ] **CHK-25** 일반옵션 1개 체크 → 에러 없음
- [ ] **CHK-26** Other만 체크 → industryOther 텍스트 필드 나타남
- [ ] **CHK-27** 일반옵션 + Other 체크 → 에러 없음 + 텍스트 필드 나타남
- [ ] **CHK-28** 일반옵션 2개 이상 체크 → 에러 없음
- [ ] **CHK-29** affiliation을 Industry 외로 변경 → industry 필드 숨김 상태 확인

### 3-5. Robot Type (Optional, Other 有, robotAccess=own/lab/planning 전제)

> robotAccess를 "Yes, I own/operate robots"로 선택한 상태에서 테스트

- [ ] **CHK-30** 아무것도 미선택 상태로 서브밋 → 에러 없음 (optional)
- [ ] **CHK-31** 일반옵션 1개 체크 → 에러 없음
- [ ] **CHK-32** Other만 체크 → robotTypeOther 텍스트 필드 나타남
- [ ] **CHK-33** 일반옵션 + Other 체크 → 에러 없음 + 텍스트 필드 나타남
- [ ] **CHK-34** 일반옵션 2개 이상 체크 → 에러 없음
- [ ] **CHK-35** robotAccess를 "interested"로 변경 → robotType 필드 숨김 확인

### 3-6. Robot Brand (Optional, Other 有, robotAccess=own/lab/planning 전제)

> robotAccess를 "Yes, through my lab/company"로 선택한 상태에서 테스트

- [ ] **CHK-36** 아무것도 미선택 상태로 서브밋 → 에러 없음 (optional)
- [ ] **CHK-37** 일반옵션 1개 체크 → 에러 없음
- [ ] **CHK-38** Other만 체크 → robotBrandOther 텍스트 필드 나타남
- [ ] **CHK-39** 일반옵션 + Other 체크 → 에러 없음 + 텍스트 필드 나타남
- [ ] **CHK-40** 일반옵션 2개 이상 체크 → 에러 없음
- [ ] **CHK-41** robotAccess를 "interested"로 변경 → robotBrand 필드 숨김 확인

### 3-7. Share Type (Optional, shareWilling=yes 전제)

> shareWilling을 "Yes"로 선택한 상태에서 테스트

- [ ] **CHK-42** 아무것도 미선택 상태로 서브밋 → 에러 없음 (optional)
- [ ] **CHK-43** 1개 체크 → 에러 없음
- [ ] **CHK-44** 2개 모두 체크 → 에러 없음
- [ ] **CHK-45** shareWilling을 "No"로 변경 → shareType 필드 숨김 확인

---

## 세션 4: 조건부 로직 — 2차 질문 전환 (31개)

> 페이지 새로고침 후 각 시나리오 실행

### 4-1. Affiliation 전환

- [ ] **CND-01** "Academic" 선택 → academicRole 필드 즉시 visible 확인 (fadeIn 애니메이션)
- [ ] **CND-02** "Industry" 선택 → industryRole + industry 필드 둘 다 visible 확인
- [ ] **CND-03** "Startup" 선택 → startupRole 필드 visible 확인
- [ ] **CND-04** "Investor" 선택 → academicRole, industryRole, industryField, startupRole 모두 hidden 확인
- [ ] **CND-05** "Other" 선택 → affiliationOther 텍스트 필드 visible + input에 `required` 속성 존재 확인 (DevTools > Elements)
- [ ] **CND-06** "Academic" 선택 → academicRole에서 "Professor" 선택 → "Industry"로 변경 → 확인: (1) academicRole 숨김 (2) "Professor" 선택 해제됨 (3) industryRole + industry 나타남 (빈 상태)
- [ ] **CND-07** "Industry" 선택 → industryRole "R&D" 선택 + industry "Manufacturing" 체크 → "Startup"으로 변경 → 확인: (1) industryRole 숨김 + "R&D" 해제 (2) industry 숨김 + "Manufacturing" 해제 (3) startupRole 나타남
- [ ] **CND-08** "Startup" 선택 → startupRole "Founder" 선택 → "Academic"으로 변경 → 확인: (1) startupRole 숨김 + "Founder" 해제 (2) academicRole 나타남
- [ ] **CND-09** "Other" 선택 → 텍스트 "test org" 입력 → "Academic"으로 변경 → 확인: (1) affiliationOther 숨김 (2) 텍스트 값 빈칸 (3) input에서 `required` 속성 제거됨 (4) academicRole 나타남
- [ ] **CND-10** "Academic" 선택 → academicRole "Postdoc" 선택 → "Investor"로 변경 → 확인: (1) academicRole 숨김 + 해제 (2) 2차 질문 아무것도 없음
- [ ] **CND-11** "Industry" 선택 → industry에서 "Other" 체크 + 텍스트 "custom" 입력 → "Startup"으로 변경 → 확인: (1) industry 숨김 (2) "Other" 해제 (3) industryOther 텍스트 필드 숨김 (4) 텍스트 값 빈칸

### 4-2. Startup Role → Other 텍스트

> affiliation을 "Startup"으로 선택한 상태에서 테스트

- [ ] **CND-12** startupRole "Other" 선택 → 확인: (1) startupRoleOther 텍스트 필드 나타남 (2) input에 `required` 속성 존재
- [ ] **CND-13** startupRole "Other" → 텍스트 "CTO" 입력 → "Founder" 선택 → 확인: (1) 텍스트 필드 숨김 (2) 텍스트 값 빈칸 (3) `required` 속성 제거
- [ ] **CND-14** startupRole "Other" → 텍스트 미입력 → 서브밋 → "Please specify" 에러 + 빨간 테두리
- [ ] **CND-15** startupRole "Other" → 텍스트 "CTO" 입력 → 서브밋 → 에러 없음

### 4-3. Robot Access 전환

- [ ] **CND-16** "own" 선택 → robotType + robotBrand 둘 다 visible 확인
- [ ] **CND-17** "lab" 선택 → robotType + robotBrand 둘 다 visible 확인
- [ ] **CND-18** "planning" 선택 → robotType + robotBrand 둘 다 visible 확인
- [ ] **CND-19** "interested" 선택 → robotType + robotBrand 둘 다 hidden 확인
- [ ] **CND-20** "own" 선택 → robotType "Humanoid" 체크 + robotBrand "Franka" 체크 → "interested"로 변경 → 확인: (1) 두 필드 숨김 (2) "Humanoid" 해제 (3) "Franka" 해제
- [ ] **CND-21** "own" 선택 → robotType "Humanoid" 체크 → "lab"으로 변경 → 확인: (1) 두 필드 **여전히 visible** (2) "Humanoid" **여전히 체크 상태 유지** (own→lab은 둘 다 hasRobot=true)
- [ ] **CND-22** "own" 선택 → robotType "Other" 체크 + 텍스트 "custom bot" 입력 → "interested"로 변경 → 확인: (1) robotType 숨김 (2) "Other" 해제 (3) robotTypeOther 텍스트 필드 숨김 (4) 텍스트 값 빈칸
- [ ] **CND-23** "interested" 선택 → "planning"으로 변경 → 확인: robotType + robotBrand 나타남 (빈 상태, 아무것도 체크 안 됨)

### 4-4. Share Willing → Share Type

- [ ] **CND-24** "Yes" 선택 → shareType 필드 visible 확인
- [ ] **CND-25** "Yes" 선택 → shareType "Create content" 체크 → "No"로 변경 → 확인: (1) shareType 숨김 (2) "Create content" 해제
- [ ] **CND-26** "Yes" 선택 → shareType 둘 다 체크 → "Maybe"로 변경 → 확인: (1) shareType 숨김 (2) 둘 다 해제
- [ ] **CND-27** "No" 선택 → "Yes"로 변경 → 확인: shareType 나타남 (빈 상태, 아무것도 체크 안 됨)

### 4-5. Referral Source → Other 텍스트

- [ ] **CND-28** "Other" 선택 → 확인: (1) referralSourceOther 텍스트 필드 나타남 (2) input에 `required` 속성 존재
- [ ] **CND-29** "Other" 선택 → 텍스트 "friend" 입력 → "RLWRLD website" 선택 → 확인: (1) 텍스트 필드 숨김 (2) 텍스트 값 빈칸 (3) `required` 속성 제거
- [ ] **CND-30** "Other" 선택 → 텍스트 미입력 → 서브밋 → "Please specify" 에러 + 빨간 테두리
- [ ] **CND-31** "Other" 선택 → 텍스트 "friend" 입력 → 서브밋 → 에러 없음

---

## 세션 5: 상호배타 (Mutual Exclusion) (12개)

### 5-1. Communities "None" 배타

- [ ] **EXC-01** None 체크 → OpenArm 체크 → 확인: None **자동 해제**, OpenArm만 체크 상태
- [ ] **EXC-02** OpenArm 체크 → None 체크 → 확인: OpenArm **자동 해제**, None만 체크 상태
- [ ] **EXC-03** OpenArm + LeRobot 체크 → None 체크 → 확인: OpenArm + LeRobot **둘 다 자동 해제**, None만 체크 상태
- [ ] **EXC-04** None 체크 → Other 체크 → 확인: None **자동 해제** + Other 체크 상태 + 텍스트 필드 나타남
- [ ] **EXC-05** Other 체크 + 텍스트 "test" 입력 → None 체크 → 확인: (1) Other 자동 해제 (2) 텍스트 필드 숨김 (3) 텍스트 값 빈칸 (4) None만 체크
- [ ] **EXC-06** OpenArm + Other 체크 + 텍스트 "test" → None 체크 → 확인: (1) OpenArm 해제 (2) Other 해제 (3) 텍스트 필드 숨김 (4) 텍스트 값 빈칸 (5) None만 체크
- [ ] **EXC-07** None 체크 → None 다시 해제 → 확인: 아무것도 체크되지 않은 정상 상태

### 5-2. Use Case "Just explore" 배타

- [ ] **EXC-08** "Just explore" 체크 → "Benchmark" 체크 → 확인: Just explore **자동 해제**, Benchmark만 체크
- [ ] **EXC-09** "Benchmark" 체크 → "Just explore" 체크 → 확인: Benchmark **자동 해제**, Just explore만 체크
- [ ] **EXC-10** "Benchmark" + "Fine-tune" 체크 → "Just explore" 체크 → 확인: Benchmark + Fine-tune **둘 다 자동 해제**, Just explore만 체크
- [ ] **EXC-11** "Just explore" 체크 → "Just explore" 다시 해제 → 확인: 아무것도 체크되지 않은 상태
- [ ] **EXC-12** "Just explore"만 체크한 상태로 서브밋 → 에러 없음 (최소 1개 충족)

---

## 세션 6: Other + 텍스트 필드 상호작용 (26개)

### 6-1. 조건부 Required Other (specifyRequired: true)

> 대상: affiliationOther, startupRoleOther, referralSourceOther

**affiliationOther:**
- [ ] **OTH-01** affiliation "Other" 선택 → 텍스트 미입력 → 서브밋 → "Please specify" 에러 + 빨간 테두리
- [ ] **OTH-02** affiliation "Other" 선택 → "test org" 입력 → 서브밋 → 에러 없음
- [ ] **OTH-03** affiliation "Other" 선택 → 공백만("   ") 입력 → 서브밋 → "Please specify" 에러 (trim 검증)
- [ ] **OTH-04** affiliation "Other" → "test org" 입력 → "Academic"으로 변경 → 서브밋 → 에러 없음 (필드 숨김 + required 제거)
- [ ] **OTH-05** affiliation "Other" → 텍스트 미입력 → "Academic"으로 변경 → 서브밋 → 에러 없음 (필드 숨김, 검증 대상 아님)

**startupRoleOther:**
- [ ] **OTH-06** affiliation "Startup" + startupRole "Other" → 텍스트 미입력 → 서브밋 → "Please specify" 에러
- [ ] **OTH-07** startupRole "Other" → "CTO" 입력 → 서브밋 → 에러 없음
- [ ] **OTH-08** startupRole "Other" → "CTO" 입력 → "Founder" 선택 → 서브밋 → 에러 없음 (텍스트 필드 숨김 + 초기화)

**referralSourceOther:**
- [ ] **OTH-09** referralSource "Other" → 텍스트 미입력 → 서브밋 → "Please specify" 에러
- [ ] **OTH-10** referralSource "Other" → "podcast" 입력 → 서브밋 → 에러 없음
- [ ] **OTH-11** referralSource "Other" → "podcast" 입력 → "RLWRLD website" 선택 → 서브밋 → 에러 없음

### 6-2. Optional Other (specifyRequired 없음)

> 대상: communitiesOther, industryOther, robotTypeOther, robotBrandOther, applicationsOther

- [ ] **OTH-12** communities Other 체크 → 텍스트 미입력 → 서브밋 → 에러 없음 (optional)
- [ ] **OTH-13** communities Other 체크 → "Discord" 입력 → 서브밋 → 에러 없음
- [ ] **OTH-14** communities Other 체크 → "Discord" 입력 → Other 해제 → 서브밋 → 에러 없음 + 텍스트 필드 숨김 + 텍스트 빈칸 확인
- [ ] **OTH-15** industry Other 체크(affiliation=industry 전제) → 텍스트 미입력 → 서브밋 → 에러 없음
- [ ] **OTH-16** industry Other 체크 → "Mining" 입력 → 서브밋 → 에러 없음
- [ ] **OTH-17** robotType Other 체크(robotAccess=own 전제) → 텍스트 미입력 → 서브밋 → 에러 없음
- [ ] **OTH-18** robotType Other 체크 → "Spot" 입력 → 서브밋 → 에러 없음
- [ ] **OTH-19** robotBrand Other 체크(robotAccess=own 전제) → 텍스트 미입력 → 서브밋 → 에러 없음
- [ ] **OTH-20** robotBrand Other 체크 → "Boston Dynamics" 입력 → 서브밋 → 에러 없음
- [ ] **OTH-21** applications Other 체크 → 텍스트 미입력 → 서브밋 → 에러 없음
- [ ] **OTH-22** applications Other 체크 → "Surgery" 입력 → 서브밋 → 에러 없음

### 6-3. Other 텍스트 필드 UI 동작 (공통)

- [ ] **OTH-23** 모든 checkbox의 Other 체크 시 → 텍스트 필드가 fadeIn 애니메이션으로 나타나는지 확인 (대상: communities, industry, robotType, robotBrand, applications)
- [ ] **OTH-24** 모든 checkbox의 Other 해제 시 → 텍스트 필드 숨김 + 텍스트 값 빈칸 확인
- [ ] **OTH-25** 모든 radio의 Other 선택 시 → 텍스트 필드 나타남 확인 (대상: affiliation, startupRole, referralSource)
- [ ] **OTH-26** 모든 radio의 Other → 일반 선택 시 → 텍스트 필드 숨김 + 텍스트 값 빈칸 + required 속성 제거 확인

---

## 세션 7: 폼 제출 & 유효성 검증 (29개)

### 7-1. 필드별 개별 에러 (필수 필드 하나만 비운 채 서브밋)

> 전제: 나머지 모든 필수 필드는 정상 입력. affiliation=investor(2차 질문 없음) 상태.

- [ ] **SUB-01** 모든 필수 필드 정상 → 서브밋 → 성공 메시지 표시 + 폼 숨김 + 스크롤 to top
- [ ] **SUB-02** fullName만 비움 → 서브밋 → fullName에 빨간 테두리 + 에러 메시지 + **fullName으로 스크롤** (가장 상단 에러)
- [ ] **SUB-03** email만 비움 → 서브밋 → email에 빨간 테두리 + 에러 메시지 + email로 스크롤
- [ ] **SUB-04** organization만 비움 → 서브밋 → organization에 빨간 테두리 + 에러 메시지
- [ ] **SUB-05** country만 미선택 → 서브밋 → country에 빨간 테두리 + 에러 메시지
- [ ] **SUB-06** affiliation만 미선택 → 서브밋 → affiliation 옵션 그룹에 빨간 테두리 + 에러 메시지
- [ ] **SUB-07** robotAccess만 미선택 → 서브밋 → robotAccess에 빨간 테두리 + 에러 메시지
- [ ] **SUB-08** simAccess만 미선택 → 서브밋 → simAccess에 빨간 테두리 + 에러 메시지
- [ ] **SUB-09** useCase만 미선택 → 서브밋 → useCase에 빨간 테두리 + 에러 메시지
- [ ] **SUB-10** applications만 미선택 → 서브밋 → applications에 빨간 테두리 + 에러 메시지
- [ ] **SUB-11** shareWilling만 미선택 → 서브밋 → shareWilling에 빨간 테두리 + 에러 메시지
- [ ] **SUB-12** eventAttendance만 미선택 → 서브밋 → eventAttendance에 빨간 테두리 + 에러 메시지
- [ ] **SUB-13** referralSource만 미선택 → 서브밋 → referralSource에 빨간 테두리 + 에러 메시지
- [ ] **SUB-14** **모든** 필수 필드 비움 → 서브밋 → 다중 에러 동시 표시 + **fullName으로 스크롤** (가장 상단)

### 7-2. 조건부 필수 필드 에러

- [ ] **SUB-15** affiliation=Academic + academicRole 미선택 → 서브밋 → academicRole에 빨간 테두리 + 에러
- [ ] **SUB-16** affiliation=Industry + industryRole 미선택 → 서브밋 → industryRole에 빨간 테두리 + 에러
- [ ] **SUB-17** affiliation=Startup + startupRole 미선택 → 서브밋 → startupRole에 빨간 테두리 + 에러
- [ ] **SUB-18** affiliation=Other + 텍스트 미입력 → 서브밋 → affiliationOther에 빨간 테두리 + "Please specify"
- [ ] **SUB-19** affiliation=Startup + startupRole=Other + 텍스트 미입력 → 서브밋 → startupRoleOther에 빨간 테두리 + "Please specify"
- [ ] **SUB-20** referralSource=Other + 텍스트 미입력 → 서브밋 → referralSourceOther에 빨간 테두리 + "Please specify"

### 7-3. 숨겨진 필드가 검증에 영향 없음

- [ ] **SUB-21** affiliation=Academic → academicRole "Professor" 선택 → affiliation을 "Investor"로 변경 → 서브밋 → 에러 없음 (academicRole 숨김 → 검증 스킵)
- [ ] **SUB-22** affiliation=Other → "test" 입력 → affiliation을 "Academic" → academicRole 선택 → 서브밋 → 에러 없음
- [ ] **SUB-23** robotAccess=own → robotType+robotBrand 체크 → robotAccess를 "interested" → 서브밋 → 에러 없음
- [ ] **SUB-24** shareWilling=Yes → shareType 체크 → shareWilling을 "No" → 서브밋 → 에러 없음

### 7-4. 에러 표시/해제 UI

- [ ] **SUB-25** 서브밋(에러) → 에러 필드(텍스트)에 값 입력 → 해당 필드 빨간 테두리 **즉시 제거** + 에러 메시지 **즉시 제거** 확인
- [ ] **SUB-26** 서브밋(에러) → 에러 라디오 그룹에서 아무 옵션 선택 → 해당 그룹 빨간 테두리 **즉시 제거** + 에러 메시지 **즉시 제거** 확인
- [ ] **SUB-27** 서브밋(다중 에러) → 하나씩 수정 → 수정한 필드만 에러 제거, **나머지 에러는 유지** 확인
- [ ] **SUB-28** 서브밋(에러) → 수정 없이 다시 서브밋 → 이전 에러 전부 clear 후 **동일 에러 재표시** (중복 에러 메시지 없음 확인)
- [ ] **SUB-29** 서브밋(에러) → 화면이 **가장 상단 에러 필드**로 스크롤되는지 확인 + 헤더에 가려지지 않는지 확인 (20px 오프셋)

---

## 세션 8: 데이터 무결성 — Supabase (12개)

> DevTools > Network 탭에서 `waitlist` POST 요청의 Request Payload 확인

- [ ] **DAT-01** 모든 필드 정상 입력 → 서브밋 → Network에서 POST body 확인: `email`, `full_name`, `organization`, `country`, `social_profile`, `form_data` 키 모두 존재
- [ ] **DAT-02** checkbox 복수 선택 (예: robotType에서 Humanoid + Bimanual 체크) → 서브밋 → `form_data.robotType`이 **배열** `["humanoid", "bimanual"]`인지 확인
- [ ] **DAT-03** checkbox 단일 선택 (예: robotType에서 Humanoid만 체크) → 서브밋 → `form_data.robotType`이 **문자열** `"humanoid"`인지 확인
- [ ] **DAT-04** socialProfile 미입력 → 서브밋 → POST body에서 `social_profile: null` 확인
- [ ] **DAT-05** applications에서 "Other" 체크 + "Surgery" 입력 → 서브밋 → `form_data`에 `applications`에 "other" 포함 + `applicationsOther: "Surgery"` 포함 확인
- [ ] **DAT-06** affiliation=Industry → industry "Manufacturing" + "Other" + "Mining" 입력 → affiliation을 "Investor"로 변경 → 서브밋 → `form_data`에 `industry`/`industryOther` 키의 값이 **빈 문자열이거나 미포함** 확인 (clearFieldInputs로 초기화됨)
- [ ] **DAT-07** 숨겨진 조건부 필드의 잔여 데이터 확인: affiliation=Academic → academicRole "Professor" → affiliation=Investor → 서브밋 → `form_data`에서 `academicRole` 값이 **빈 문자열**인지 확인 (잠재 이슈: 빈 key 포함 가능)
- [ ] **DAT-08** DevTools에서 honeypot 필드에 값 수동 입력 → 서브밋 → Network 탭에서 **POST 요청이 발생하지 않음** 확인 (가짜 성공)

### Supabase 응답 처리

- [ ] **DAT-09** 정상 서브밋 → 201 응답 → 성공 메시지 표시 + 폼 숨김
- [ ] **DAT-10** 동일 이메일로 재서브밋 (새로고침 후) → 409 응답 → **동일한 성공 메시지** 표시 (email enumeration 방지)
- [ ] **DAT-11** 서버 오류 시뮬레이션 (DevTools > Network > Block `supabase.co`) → 서브밋 → `alert("Something went wrong...")` + 버튼 텍스트 "Join Waitlist"로 복원 + 버튼 활성화
- [ ] **DAT-12** 네트워크 오프라인 (DevTools > Network > Offline) → 서브밋 → `alert("Something went wrong...")` + 버튼 복원

---

## 세션 9: 안티스팸 & Rate Limit (5개)

- [ ] **SPM-01** DevTools > Elements에서 honeypot 필드(`input[name="website"]`) 찾아서 값 입력 → 서브밋 → 폼 숨김 + 성공 메시지 표시 + Network에 **POST 요청 없음** 확인
- [ ] **SPM-02** 정상 서브밋 직후 (3초 이내) 다시 서브밋 시도 → `alert("Please wait a moment before submitting again.")` 표시
- [ ] **SPM-03** 정상 서브밋 후 3초 이상 대기 후 재서브밋 → 이미 성공 상태이므로 폼이 숨겨져 있어 서브밋 불가 (정상)
- [ ] **SPM-04** 서브밋 클릭 직후 버튼 상태 확인 → 버튼 disabled + 텍스트 "Submitting..." 표시
- [ ] **SPM-05** 서버 오류로 서브밋 실패 후 → 버튼 disabled 해제 + 텍스트 "Join Waitlist" 복원

---

## 세션 10: 복합 시나리오 (9개)

### 10-1. 최소/최대 입력

- [ ] **CRS-01** 최소 유효 서브밋: fullName + email + organization + country + affiliation(Investor) + robotAccess(interested) + simAccess(아무거나) + useCase(1개) + applications(1개) + shareWilling(No) + eventAttendance(아무거나) + referralSource(아무거나) → 서브밋 → **성공** (조건부 필드 없이 최소 입력)
- [ ] **CRS-02** CRS-01 + socialProfile 추가 → 서브밋 → **성공**
- [ ] **CRS-03** 최대 유효 서브밋: affiliation=Industry → industryRole + 모든 industry 체크 + Other + 텍스트 + 모든 communities(None 제외) + Other + 텍스트 + robotAccess=own → 모든 robotType + Other + 텍스트 + 모든 robotBrand + Other + 텍스트 + 모든 useCase(Just explore 제외) + 모든 applications + Other + 텍스트 + shareWilling=Yes → shareType 둘 다 + referralSource=Other + 텍스트 → 서브밋 → **성공** + Network에서 모든 데이터 확인

### 10-2. 조건부 필드 연쇄 전환

- [ ] **CRS-04** Academic → "Professor" → Industry로 변경 → "R&D" + "Manufacturing" → Startup으로 변경 → "Founder" → Other로 변경 → "test" 입력 → Investor로 변경 → 서브밋 → **성공**: 확인사항 - (1) 최종 상태 Investor만 form_data에 반영 (2) 이전 2차 데이터(Professor, R&D, Manufacturing, Founder, test) 모두 초기화됨
- [ ] **CRS-05** robotAccess=own → robotType "Humanoid" + robotBrand "Franka" 체크 → "interested"로 변경 → 다시 "own"으로 변경 → 확인: robotType + robotBrand **빈 상태** (interested 전환 시 초기화됨) → 서브밋 시 빈 상태로 전송
- [ ] **CRS-06** shareWilling=Yes → shareType "Create content" 체크 → "No"로 변경 → 다시 "Yes"로 변경 → 확인: shareType **빈 상태** → 서브밋 시 빈 상태로 전송

### 10-3. 에러 후 조건부 변경

- [ ] **CRS-07** affiliation=Academic + academicRole **미선택** → 서브밋(에러) → affiliation을 "Investor"로 변경 → 재서브밋 → **성공** (academicRole 에러 사라짐, 숨김 필드 검증 스킵)
- [ ] **CRS-08** affiliation=Other + 텍스트 **미입력** → 서브밋(에러) → affiliation을 "Academic" → academicRole 선택 → 재서브밋 → **성공** (affiliationOther 에러 사라짐)
- [ ] **CRS-09** referralSource=Other + 텍스트 **미입력** → 서브밋(에러) → referralSource를 "RLWRLD website" → 재서브밋 → **성공** (referralSourceOther 에러 사라짐)

---

## 진행률 트래커

| 세션 | 항목 수 | 완료 |
|------|---------|------|
| 1. 텍스트 입력 | 23 | /23 |
| 2. 단일 선택 | 34 | /34 |
| 3. 복수 선택 | 45 | /45 |
| 4. 조건부 로직 | 31 | /31 |
| 5. 상호배타 | 12 | /12 |
| 6. Other + 텍스트 | 26 | /26 |
| 7. 폼 제출 | 29 | /29 |
| 8. 데이터 무결성 | 12 | /12 |
| 9. 안티스팸 | 5 | /5 |
| 10. 복합 시나리오 | 9 | /9 |
| **총계** | **226** | **/226** |
