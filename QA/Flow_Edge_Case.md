# RLDX Waitlist Form — Flow & Dynamic Edge Cases

> Option/값 레벨 엣지 케이스는 `Option_Edge_Case.md`에서 다루며, 이 문서는 **플로우, 워크플로우, 브라우저 동작, 타이밍, 터치/키보드, 네트워크, 페이지 라이프사이클** 등 동적 엣지 케이스만 다룹니다.

---

## 1. 페이지 로드 & 초기화 (Page Load & Initialization)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| INIT-01 | 페이지 최초 로드 (정상 네트워크) | DOMContentLoaded 2개 리스너 모두 실행 (script.js:230 + index.html:1192), 모든 conditional-field 숨김, 폼 표시, 성공 메시지 숨김 | [ ] DOMContentLoaded 정상 실행 [ ] 모든 conditional-field에 .visible 없음 [ ] successMessage에 .visible 없음 [ ] submitBtn enabled + text="Join Waitlist" |
| INIT-02 | 느린 네트워크에서 로드 (CSS 로드 전 JS 실행 가능성) | CSS가 `<head>`에 있으므로 JS보다 먼저 파싱됨. 단, Google Fonts는 비동기 preload이므로 폰트 없이 렌더링 가능 | [ ] 폼 레이아웃 정상 (FOUT 허용) [ ] Inter 폰트 로드 전 시스템 폰트 fallback 표시 [ ] 폰트 로드 후 re-render 정상 |
| INIT-03 | JavaScript 비활성화 상태 | form에 `novalidate` 속성이므로 브라우저 기본 검증 비활성화됨, 제출 시 서버로 전송되나 JS 없이는 fetch 미실행 | [ ] `<noscript>` 태그로 Google Fonts 로드됨 [ ] 폼은 표시되나 제출 불가 (JS 의존) |
| INIT-04 | 빈 캐시에서 최초 방문 | 모든 리소스 네트워크 로드, 로고 SVG + CSS + JS + Fonts | [ ] 모든 리소스 200 응답 [ ] 폼 정상 렌더링 |
| INIT-05 | 캐시된 상태에서 재방문 | 304 Not Modified 또는 캐시 히트, 빠른 렌더링 | [ ] 폼 초기 상태로 로드 (이전 입력 없음, autocomplete="off") |
| INIT-06 | `autocomplete="off"` 속성에도 불구하고 브라우저가 자동완성 데이터 표시 | 일부 브라우저(Chrome)는 autocomplete="off"를 무시할 수 있음 | [ ] 자동완성 팝업이 표시되더라도 폼 기능에 영향 없음 [ ] 자동완성 선택 시 input/change 이벤트 정상 발생 |

---

## 2. 브라우저 뒤로가기/앞으로가기 (Browser Navigation)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| NAV-01 | 외부 사이트에서 폼 페이지 진입 → 뒤로가기 | 이전 사이트로 이동, 폼 데이터 손실 | [ ] 정상적으로 이전 페이지로 이동 |
| NAV-02 | 폼 일부 입력 후 뒤로가기 → 앞으로가기 (bfcache 복원) | 브라우저의 bfcache에 의해 JS 상태+DOM 상태 복원될 수 있음. autocomplete="off"이므로 텍스트 입력은 복원되지 않을 수 있으나, 라디오/체크박스 상태는 브라우저마다 다름 | [ ] 텍스트 필드: 빈 상태 또는 복원됨 (브라우저 의존) [ ] 라디오/체크박스: 상태 복원 가능 [ ] conditional-field 표시 상태: JS 변수와 DOM 상태 불일치 가능 — **잠재 이슈** [ ] lastSubmitTime 변수 값 복원됨 (bfcache 시) |
| NAV-03 | 성공 메시지 표시 후 뒤로가기 → 앞으로가기 | bfcache 복원 시: form display:none, successMessage.visible 상태 유지. 일반 로드 시: 초기 상태로 복원 | [ ] 성공 상태가 유지되거나 초기 상태로 돌아감 [ ] 폼 재제출 불가 상태 확인 |
| NAV-04 | 폼 입력 중 외부 링크(footer) 클릭 → 뒤로가기 | footer 링크는 target="_blank"이므로 새 탭에서 열림, 원래 탭의 폼 상태 유지 | [ ] 원래 탭 폼 상태 그대로 유지 [ ] 입력 데이터 손실 없음 |
| NAV-05 | 폼 에러 표시 중 뒤로가기 → 앞으로가기 | bfcache 복원 시: 에러 메시지 DOM 유지. 일반 로드 시: 에러 없는 초기 상태 | [ ] 에러 스타일(.has-error) 상태 확인 [ ] 에러 메시지(.error-message) 존재 여부 확인 |
| NAV-06 | history.pushState/replaceState 미사용 확인 | 현재 코드에서 History API 사용하지 않음, 단일 페이지 상태 | [ ] 브라우저 히스토리에 추가 엔트리 없음 |
| NAV-07 | iOS Safari에서 스와이프 뒤로가기 제스처 | 페이지 전체가 뒤로 이동, 폼 데이터 손실 가능 | [ ] 스와이프 제스처 정상 작동 [ ] 앞으로 스와이프로 복귀 시 상태 확인 |
| NAV-08 | Android 하드웨어 뒤로가기 버튼 | 이전 페이지로 이동 또는 앱/브라우저 종료 | [ ] 정상 뒤로 이동 [ ] 폼 데이터 경고 없음 (beforeunload 미구현) |

---

## 3. 페이지 새로고침 (Page Refresh)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| REF-01 | 폼 입력 중 F5/Cmd+R 새로고침 | 모든 입력 데이터 손실 (beforeunload 경고 없음), 폼 초기 상태로 로드 | [ ] 모든 필드 빈 상태 [ ] conditional-field 모두 숨김 [ ] 에러 메시지 없음 |
| REF-02 | 서브밋 에러 표시 중 새로고침 | 에러 제거되고 초기 상태로 복원 | [ ] 에러 메시지/스타일 없음 [ ] 폼 정상 표시 |
| REF-03 | 성공 메시지 표시 중 새로고침 | 폼 초기 상태로 복원 (성공 메시지 사라짐, 폼 다시 표시) | [ ] form display:block (또는 기본값) [ ] successMessage.visible 없음 [ ] hero-subtitle 원래 텍스트 복원 |
| REF-04 | 서브밋 진행 중 (버튼 disabled) 새로고침 | fetch 요청 중단, 페이지 초기 상태로 복원. **주의**: 서버에 데이터가 이미 전송되었을 수 있음 | [ ] 버튼 enabled + text="Join Waitlist" [ ] 이전 제출이 서버에 도달했을 가능성 있음 |
| REF-05 | 브라우저 "Confirm form resubmission" 다이얼로그 | POST 요청이 아닌 fetch API 사용이므로 이 다이얼로그 표시되지 않음 (form default prevented) | [ ] 재전송 확인 다이얼로그 미표시 |

---

## 4. Toast 알림 동작 (Toast Notification Behavior)

### 4-1. Toast 표시 조건

| ID | 트리거 조건 | Toast 타입 | 메시지 | 체크리스트 |
|----|-------------|-----------|--------|------------|
| TST-01 | 3초 이내 재제출 시도 | warning | "Please wait a moment before submitting again." | [ ] toast-warning 클래스 적용 [ ] border-color: #d4a017 |
| TST-02 | 서버 에러 (500, 네트워크 오류 등) | error | "Something went wrong. Please try again." | [ ] toast-error 클래스 적용 [ ] border-color: #e05252 |

### 4-2. Toast 라이프사이클

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| TST-03 | Toast 표시 시작 | opacity 0→1, translateY(1rem→0) 트랜지션 0.3s, pointer-events: auto | [ ] toast-visible 클래스 추가 [ ] 시각적 전환 확인 |
| TST-04 | Toast 3초 후 자동 숨김 | toast-visible 클래스 제거, opacity 1→0, pointer-events: none | [ ] setTimeout 3000ms 후 실행 [ ] 자연스러운 페이드아웃 |
| TST-05 | Toast 표시 중 또 다른 Toast 트리거 (빠른 연속 제출 시도) | 이전 Toast의 타이머 clearTimeout, 새 메시지로 교체, 타이머 재시작 | [ ] clearTimeout(toast._timer) 호출 [ ] 텍스트 즉시 교체 [ ] 새 3초 카운트다운 시작 |
| TST-06 | Toast warning 표시 중 서브밋 성공 (3초 후 재시도) | Toast가 남아있는 상태에서 성공 메시지 표시 가능 | [ ] Toast가 자동 사라짐 [ ] 성공 메시지와 Toast 동시 표시 문제 없음 |
| TST-07 | `prefers-reduced-motion: reduce` 환경에서 Toast | transition-duration 0.01ms, 즉시 나타남/사라짐 | [ ] CSS에 해당 미디어 쿼리 적용 확인 [ ] transform 변경은 별도 미디어 쿼리에서 고정 |
| TST-08 | Toast 표시 중 스크롤 | Toast는 `position: fixed`, 스크롤과 무관하게 화면 하단 고정 | [ ] bottom: 2rem 유지 [ ] left: 50% + translateX(-50%) 중앙 유지 |
| TST-09 | 모바일에서 Toast 최대 너비 | max-width: calc(100vw - 2rem) | [ ] 화면 폭 초과하지 않음 [ ] 텍스트 줄바꿈 정상 |
| TST-10 | Toast 표시 중 페이지 새로고침 | Toast DOM 초기화, 초기 상태(opacity:0, pointer-events:none)로 복원 | [ ] Toast 비표시 상태 |

### 4-3. Toast 이후 사용자 동작

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| TST-11 | Rate limit Toast 후 3초 대기 → 재제출 | 정상 제출 진행 (lastSubmitTime 갱신됨) | [ ] 제출 정상 실행 [ ] 유효성 검증 실행 |
| TST-12 | Error Toast 후 즉시 재제출 | Rate limit에 걸리지 않으면 정상 제출 시도 (lastSubmitTime은 이전 실패 시점) | [ ] lastSubmitTime 확인: 에러 발생 시에도 lastSubmitTime이 갱신됨 [ ] 3초 이내면 rate limit Toast 표시 |
| TST-13 | Toast 표시 중 폼 입력 수정 | Toast와 폼 입력은 독립적, 정상 입력 가능 | [ ] 폼 인터랙션 차단 없음 [ ] Toast가 폼 요소를 가리지 않음 (z-index: 9999, bottom 위치) |

---

## 5. 스크롤 동작 (Scroll Behavior)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| SCR-01 | 서브밋 에러 시 첫 번째 에러로 자동 스크롤 | `window.scrollTo({ top, behavior: 'smooth' })`, top = 에러 요소 위치 - 헤더 높이 - 20px | [ ] 스크롤 목적지 정확 [ ] 헤더에 가려지지 않음 [ ] smooth 스크롤 동작 |
| SCR-02 | 서브밋 성공 시 페이지 상단으로 스크롤 | `window.scrollTo({ top: 0, behavior: 'smooth' })` | [ ] 페이지 최상단으로 이동 [ ] smooth 동작 |
| SCR-03 | 에러 스크롤 중 사용자가 수동 스크롤 | smooth scroll과 사용자 스크롤이 충돌할 수 있음, 사용자 스크롤이 우선됨 (브라우저 기본 동작) | [ ] 스크롤 충돌 시 크래시 없음 [ ] 최종 스크롤 위치 사용자 의도 반영 |
| SCR-04 | 헤더 sticky 상태에서 에러 스크롤 | header offsetHeight가 정확히 반영되어야 함 (데스크톱: 70px, 모바일 ≤480px: 60px) | [ ] 다양한 뷰포트에서 오프셋 정확 |
| SCR-05 | `html { scroll-behavior: auto; }` 오버라이드 확인 | index.html의 inline style이 styles.css의 `scroll-behavior: smooth`를 오버라이드 | [ ] 일반 스크롤은 auto [ ] JS scrollTo의 behavior:'smooth'는 별도 적용 |
| SCR-06 | 매우 긴 폼 (모든 conditional-field 표시) 에서 마지막 에러로 스크롤 | 스크롤 범위가 페이지 전체 높이를 넘지 않음 | [ ] 스크롤 정상 동작 [ ] 에러 요소 화면 내 표시 |
| SCR-07 | 모바일 가상 키보드 열린 상태에서 에러 스크롤 | 뷰포트가 줄어든 상태에서 scrollTo 실행 | [ ] 에러 요소가 가상 키보드 뒤에 가려지지 않음 |
| SCR-08 | `prefers-reduced-motion: reduce`에서 스크롤 | JS의 behavior:'smooth'는 CSS가 아닌 JS 옵션이므로 영향 없음 (브라우저마다 다를 수 있음) | [ ] 스크롤 자체는 정상 실행 |

---

## 6. 서브밋 버튼 상태 머신 (Submit Button State Machine)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| BTN-01 | 초기 상태 | enabled, text="Join Waitlist", min-width: 200px | [ ] disabled=false [ ] textContent="Join Waitlist" |
| BTN-02 | 정상 클릭 → 유효성 통과 → fetch 시작 | disabled=true, text="Submitting..." | [ ] 즉시 disabled [ ] 텍스트 변경 |
| BTN-03 | 정상 클릭 → 유효성 실패 | 버튼 상태 변경 없음 (disabled 코드가 validation 이후에 위치) | [ ] disabled=false 유지 [ ] text="Join Waitlist" 유지 |
| BTN-04 | fetch 성공 (200 또는 409) | form display:none (버튼 포함 숨김) | [ ] 버튼 더 이상 접근 불가 |
| BTN-05 | fetch 실패 (500, 네트워크 오류) | disabled=false, text 원래 텍스트 복원 | [ ] submitBtn.disabled = false [ ] submitBtn.textContent = originalText |
| BTN-06 | disabled 상태에서 클릭 시도 | 이벤트 발생하지 않음 (disabled 버튼은 클릭 이벤트 미발생) | [ ] form submit 이벤트 미발생 [ ] 아무 동작 없음 |
| BTN-07 | disabled 상태에서 Enter 키 (폼 내 입력 필드에서) | form submit 이벤트는 발생하나 e.preventDefault() 실행. 그러나 disabled 체크 없이 재실행 가능성 — **잠재 이슈**: Enter 키로 submit 이벤트 발생 시 disabled 체크가 없음, 다만 rate limit(3초)이 방어 | [ ] submit 이벤트 핸들러 실행 여부 확인 [ ] rate limit 또는 validation이 방어하는지 확인 |
| BTN-08 | 빠른 더블클릭 | 첫 클릭: validation 통과 → disabled=true. 두 번째 클릭: disabled이므로 무시됨 | [ ] 두 번째 클릭 무시 [ ] 단일 fetch 요청만 발생 |
| BTN-09 | 모바일에서 `touch-action: manipulation` 미적용 상태 | 버튼에는 touch-action 미설정, 300ms 탭 딜레이 가능 | [ ] 버튼 탭 반응 확인 [ ] 더블탭 줌 방지 여부 |
| BTN-10 | 모바일 640px 이하에서 버튼 스타일 | width: 100%, padding 변경 | [ ] 전체 너비 표시 [ ] 탭 영역 충분 |

---

## 7. 성공 상태 이후 동작 (Post-Success Behavior)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| SUC-01 | 성공 메시지 표시 직후 상태 | form: display:none, successMessage: display:block (.visible), hero-subtitle 텍스트 변경, 스크롤 to top | [ ] 폼 완전 숨김 [ ] 성공 아이콘 + 텍스트 표시 [ ] hero-subtitle = "General-purpose dexterity, purpose-built. RLDX is coming for the real world." [ ] 스크롤 위치 = 0 |
| SUC-02 | 성공 후 페이지 내 인터랙션 가능 영역 | 헤더(로고), 푸터(외부 링크 3개), 성공 메시지 텍스트만 존재 | [ ] 헤더 로고: cursor:default, pointer-events:none [ ] 푸터 링크: 정상 클릭 가능 (새 탭) |
| SUC-03 | 성공 후 페이지 새로고침 | 폼 초기 상태로 복원, 재제출 가능 | [ ] 폼 다시 표시 [ ] hero-subtitle 원래 텍스트 |
| SUC-04 | 성공 후 뒤로가기 | 이전 페이지로 이동 (form 페이지는 단일 히스토리 엔트리) | [ ] 이전 페이지 또는 빈 히스토리 |
| SUC-05 | 성공 후 외부 링크(footer) 클릭 → 돌아오기 | 새 탭에서 열리므로 원래 탭 성공 상태 유지 | [ ] 성공 메시지 유지 [ ] 폼 숨김 유지 |
| SUC-06 | Honeypot 감지로 인한 가짜 성공 후 상태 | form: display:none, successMessage: visible. **Supabase 전송 안됨** | [ ] 네트워크 탭에서 fetch 요청 없음 [ ] UI는 정상 성공과 동일 |
| SUC-07 | 409 (중복 이메일) 응답으로 인한 성공 후 상태 | 정상 성공과 동일한 UI (email enumeration 방지) | [ ] 200과 동일한 성공 메시지 [ ] 사용자 구별 불가 |

---

## 8. 에러 상태 & 복구 플로우 (Error State & Recovery Flow)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| ERR-01 | 에러 표시 → 해당 텍스트 필드에 타이핑 (input 이벤트) | .has-error 제거 + .error-message 제거 | [ ] input 이벤트에서 group.classList.remove('has-error') [ ] msg.remove() 호출 |
| ERR-02 | 에러 표시 → 해당 라디오/체크박스 변경 (change 이벤트) | .has-error 제거 + .error-message 제거 | [ ] change 이벤트에서 에러 해제 |
| ERR-03 | 에러 표시 → 다른 필드(에러 없는 필드) 수정 | 해당 필드 에러만 유지, 수정한 필드 영향 없음 | [ ] 에러 필드 상태 유지 [ ] 비에러 필드 정상 |
| ERR-04 | 다중 에러 → 일부만 수정 → 재서브밋 | clearAllErrors로 기존 에러 전부 제거 → validateAll 재실행 → 미수정 필드만 에러 재표시 | [ ] 이전 에러 DOM 완전 제거 [ ] 새 에러만 표시 [ ] 첫 번째 에러로 스크롤 |
| ERR-05 | 에러 표시 중 conditional-field가 숨겨짐 (부모 라디오 변경) | 해당 conditional-field 숨김 + clearFieldInputs 실행. 에러 메시지는 field 내부에 있으므로 같이 숨겨짐 | [ ] .has-error가 hidden 상태인 요소에 남아있어도 검증에서 isFieldVisible=false로 스킵 [ ] 재서브밋 시 숨김 필드 에러 미발생 |
| ERR-06 | 에러 표시 중 conditional-field가 다시 나타남 (같은 라디오 재선택) | 필드가 초기화되어 다시 나타나므로 에러 메시지는 이미 제거됨 (clearFieldInputs) | [ ] 에러 없는 빈 상태로 표시 |
| ERR-07 | 에러 메시지가 폼 레이아웃을 밀어내는 경우 | .error-message가 추가되면 form-group 높이 증가 | [ ] 에러 메시지 아래 요소 위치 정상 조정 [ ] 오버랩 없음 |
| ERR-08 | 에러 스크롤 후 사용자가 에러 수정 → 에러 제거됨 → 원래 스크롤 위치 유지 | 스크롤 위치는 자동 조정되지 않음 (사용자가 직접 스크롤) | [ ] 에러 제거 후 스크롤 점프 없음 |
| ERR-09 | `form-group` vs `conditional-field` 에러 group 탐색 | `e.target.closest('.form-group') || e.target.closest('.conditional-field')` 순서 | [ ] conditional-field 내부의 required input 에러는 .conditional-field를 group으로 사용 [ ] .form-group 내부 에러는 .form-group을 group으로 사용 |
| ERR-10 | 동일 form-group 내 이미 error-message가 있을 때 중복 에러 방지 | `if (!err.group.querySelector('.error-message'))` 조건으로 중복 방지 | [ ] 같은 그룹에 에러 2개 이상 표시되지 않음 |

---

## 9. 네트워크 & 서버 응답 (Network & Server Response)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| NET-01 | 완전 오프라인 상태에서 서브밋 | fetch 실패 → catch 블록 → Toast "Something went wrong. Please try again." + 버튼 재활성화 | [ ] Toast error 표시 [ ] 버튼 disabled=false, text 복원 [ ] console.error 출력 |
| NET-02 | 서브밋 중 네트워크 연결 끊김 | fetch Promise reject → catch 블록 동작 | [ ] NET-01과 동일 |
| NET-03 | 매우 느린 네트워크 (10초+ 응답 대기) | 버튼 "Submitting..." 상태 장시간 유지, fetch에 timeout 미설정 — **잠재 이슈**: 무한 대기 가능 | [ ] 사용자가 장시간 대기 [ ] 브라우저 자체 timeout까지 대기 |
| NET-04 | DNS 해석 실패 (Supabase URL 접근 불가) | fetch 실패 → catch 블록 | [ ] Toast error 표시 [ ] 버튼 재활성화 |
| NET-05 | CORS 에러 (Supabase 설정 문제) | fetch 실패 → catch 블록 | [ ] Toast error 표시 [ ] console에 CORS 에러 로그 |
| NET-06 | 서버 200 OK 응답 | 성공 플로우 실행 | [ ] SUC-01 체크리스트 전체 |
| NET-07 | 서버 409 Conflict (중복 이메일) | 성공 플로우 실행 (email enumeration 방지) | [ ] 200과 동일한 UI [ ] SUC-07 참조 |
| NET-08 | 서버 400 Bad Request | throw new Error('Server error: 400') → catch → Toast error | [ ] Toast error 표시 [ ] 버튼 재활성화 |
| NET-09 | 서버 401 Unauthorized (API 키 만료) | throw new Error('Server error: 401') → catch → Toast error | [ ] Toast error 표시 |
| NET-10 | 서버 403 Forbidden (RLS 정책 거부) | throw new Error('Server error: 403') → catch → Toast error | [ ] Toast error 표시 |
| NET-11 | 서버 404 Not Found (테이블 없음) | throw new Error('Server error: 404') → catch → Toast error | [ ] Toast error 표시 |
| NET-12 | 서버 500 Internal Server Error | throw new Error('Server error: 500') → catch → Toast error | [ ] Toast error 표시 |
| NET-13 | 서버 503 Service Unavailable | throw new Error('Server error: 503') → catch → Toast error | [ ] Toast error 표시 |
| NET-14 | 네트워크 에러 후 즉시 재시도 | lastSubmitTime은 에러 발생 제출 시점에 갱신됨 → 3초 이내면 rate limit Toast | [ ] rate limit 작동 확인 |
| NET-15 | 네트워크 에러 후 3초+ 대기 후 재시도 | 정상 제출 진행 | [ ] validation → fetch 정상 실행 |
| NET-16 | fetch 중 페이지 떠남 (링크 클릭, 탭 닫기) | fetch는 중단되며 서버에 데이터가 도달했을 수도 있음 | [ ] 서버 데이터 정합성 확인 불가 |

---

## 10. 키보드 네비게이션 & 인터랙션 (Keyboard Navigation)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| KEY-01 | Tab으로 폼 필드 순차 이동 | 보이는 필드만 Tab 순서에 포함 (hidden conditional-field는 display:none → Tab 스킵) | [ ] Tab 순서: fullName → email → organization → country → socialProfile → affiliation 라디오들 → ... [ ] 숨겨진 conditional-field 내 요소 Tab 안됨 |
| KEY-02 | Shift+Tab으로 역방향 이동 | Tab 순서 역순으로 이동 | [ ] 정상 역방향 이동 |
| KEY-03 | Tab으로 honeypot 필드 도달 시도 | `tabindex="-1"` 설정으로 Tab 순서에서 제외 | [ ] Tab으로 honeypot 필드 접근 불가 |
| KEY-04 | 텍스트 필드에서 Enter 키 | form submit 이벤트 발생 → e.preventDefault() → validation 실행 | [ ] 페이지 새로고침 없음 (e.preventDefault) [ ] validation 정상 실행 |
| KEY-05 | 라디오 그룹에서 방향키 (↑↓←→) | 같은 name 그룹 내에서 라디오 전환 (브라우저 기본 동작) | [ ] 라디오 전환 정상 [ ] change 이벤트 발생 [ ] conditional-field 표시/숨김 반영 |
| KEY-06 | 체크박스에서 Space 키 | 체크/해제 토글 | [ ] change 이벤트 발생 [ ] 배타 로직(None, Just explore) 정상 작동 |
| KEY-07 | Dropdown(country)에서 키보드 조작 | 방향키로 옵션 선택, Enter로 확정 | [ ] 정상 선택 [ ] change 이벤트 발생 |
| KEY-08 | 성공 메시지 표시 후 Tab | 폼이 display:none이므로 폼 내 요소 Tab 불가, footer 링크로 이동 | [ ] 포커스가 접근 가능한 요소로만 이동 |
| KEY-09 | 에러 스크롤 후 포커스 위치 | 에러 첫 요소로 스크롤되지만 포커스는 자동 설정되지 않음 — **잠재 이슈**: 접근성에서 포커스도 이동해야 함 | [ ] 스크롤만 이동, 포커스 미이동 확인 |
| KEY-10 | 포커스 아웃라인 스타일 | `a:focus, button:focus { outline: 2px solid var(--primary-color) }` | [ ] 포커스 시 초록색 아웃라인 표시 [ ] input:focus에는 border-color + box-shadow 적용 |
| KEY-11 | conditional-field가 나타날 때 포커스 이동 여부 | 포커스 자동 이동 없음 (현재 코드에 없음) | [ ] conditional-field 나타나도 포커스 유지 [ ] 사용자가 수동으로 Tab 해야 함 |

---

## 11. 터치 & 모바일 전용 (Touch & Mobile Specific)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| TCH-01 | option-item 라벨 영역 터치 | `<label>` 래핑이므로 input 토글됨 + `touch-action: manipulation` 적용 | [ ] 라벨 전체가 터치 영역 [ ] 더블탭 줌 방지 |
| TCH-02 | option-item 내부 input 직접 터치 | input 토글 + `touch-action: manipulation` | [ ] 정상 토글 |
| TCH-03 | option-item 빠른 더블탭 | `touch-action: manipulation`으로 더블탭 줌 방지, 두 번 토글됨 (체크→해제 또는 해제→체크→해제) | [ ] 줌 미발생 [ ] 체크박스: 원래 상태로 복귀 [ ] 라디오: 선택 유지 (라디오는 해제 불가) |
| TCH-04 | option-item 롱프레스 | 텍스트 선택 또는 컨텍스트 메뉴 (OS 의존) | [ ] 폼 동작에 영향 없음 |
| TCH-05 | 폼 영역 스와이프 (상하) | 일반 스크롤 동작 | [ ] 정상 스크롤 |
| TCH-06 | 핀치 줌 | `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">` — minimum-scale/maximum-scale 미설정이므로 줌 가능 | [ ] 핀치 줌 가능 [ ] 줌 후 레이아웃 깨지지 않음 |
| TCH-07 | iOS Safari에서 input focus 시 auto-zoom | `font-size: 1rem` (≥16px)이면 auto-zoom 방지됨. `.form-input`은 `font-size: 1rem`, 하지만 inline style에 `font-size: 0.5rem 0.75rem`으로 오버라이드... 실제로는 `padding: 0.5rem 0.75rem; font-size: 1rem;` | [ ] iOS Safari에서 input focus 시 줌 미발생 확인 |
| TCH-08 | 가상 키보드 올라올 때 레이아웃 변화 | 뷰포트 높이 감소, 폼이 위로 밀림 | [ ] 현재 입력 필드가 보이는 위치에 유지 [ ] 고정 요소(header sticky, toast fixed)가 가상 키보드와 충돌하지 않음 |
| TCH-09 | 가상 키보드 내려갈 때 레이아웃 복원 | 뷰포트 원래 크기로 복원 | [ ] 스크롤 위치 유지 또는 적절히 조정 |
| TCH-10 | iOS Safari 고무줄(rubber-band) 스크롤 | 페이지 상단/하단 초과 스크롤 시 바운스 효과 | [ ] 폼 동작에 영향 없음 [ ] 스크롤 복귀 후 정상 |
| TCH-11 | 모바일에서 hover 스타일 미적용 확인 | `@media (hover: hover)` 안에 있는 `.option-item:hover`, `.btn:hover` | [ ] 터치 디바이스에서 hover 스타일 미적용 [ ] 터치 후 hover 상태 잔류 없음 |
| TCH-12 | 모바일에서 `appearance: none` 라디오/체크박스 커스텀 스타일 | `-webkit-appearance: none` 적용 | [ ] 네이티브 라디오/체크박스 스타일 제거 [ ] 커스텀 원형/사각형 + 체크마크 표시 |
| TCH-13 | 안드로이드에서 폼 자동완성 프롬프트 | autocomplete="off"에도 불구하고 키보드 자동완성 제안 가능 | [ ] 자동완성 선택 시 input/change 이벤트 정상 발생 |

---

## 12. 뷰포트 & 반응형 동작 (Viewport & Responsive)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| VPT-01 | 세로→가로 회전 (모바일) | 뷰포트 크기 변경, 미디어 쿼리 재평가, 레이아웃 재계산 | [ ] option-grid 컬럼 수 변경 [ ] 폼 입력 데이터 유지 [ ] conditional-field 상태 유지 |
| VPT-02 | 가로→세로 회전 (모바일) | 뷰포트 크기 변경, 좁은 레이아웃으로 전환 | [ ] 모바일 레이아웃 정상 [ ] 데이터 손실 없음 |
| VPT-03 | 브라우저 창 리사이즈 (데스크톱) | 미디어 쿼리 재평가 | [ ] 레이아웃 정상 전환 [ ] 폼 상태 유지 |
| VPT-04 | 매우 좁은 뷰포트 (≤380px) | `@media (max-width: 380px)`: option-grid 1열, container margin 축소 | [ ] 1열 그리드 [ ] 탭 가능한 크기 유지 |
| VPT-05 | 매우 넓은 뷰포트 (≥1400px) | container max-width: 1400px, 폼 max-width: 600px 중앙 정렬 | [ ] 폼이 중앙에 위치 [ ] 좌우 여백 적절 |
| VPT-06 | 에러 표시 상태에서 화면 회전 | 에러 메시지/스타일 유지, 레이아웃만 변경 | [ ] 에러 메시지 표시 유지 [ ] 에러 스타일 유지 |
| VPT-07 | 성공 메시지 표시 상태에서 화면 회전 | 성공 메시지 레이아웃 재계산 | [ ] 성공 아이콘 + 텍스트 정상 표시 |

---

## 13. 동시성 & 타이밍 (Concurrency & Timing)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| CON-01 | 서브밋 버튼 빠른 연타 (< 100ms 간격) | 첫 클릭: validation → disabled=true → fetch 시작. 이후 클릭: disabled이므로 무시 | [ ] 단일 fetch 요청만 발생 [ ] 중복 제출 없음 |
| CON-02 | fetch 진행 중 폼 필드 수정 시도 | 폼은 display 상태이나 fetch 중에도 입력 가능 (disabled은 버튼만). 하지만 이미 FormData가 수집되었으므로 수정 무의미 | [ ] 입력 가능하나 전송 데이터에 반영 안됨 |
| CON-03 | validation 에러 + 3초 rate limit 겹침 | 첫 서브밋: validation 실패 (에러 표시), lastSubmitTime 갱신됨. 3초 이내 재서브밋: rate limit Toast 표시 (validation 전에 rate limit 체크) | [ ] rate limit가 validation보다 먼저 실행됨 (코드 순서 확인: rate limit → validation) [ ] 에러 수정해도 3초 이내면 rate limit |
| CON-04 | validation 에러 후 빠른 수정 → 3초 이내 재서브밋 | rate limit Toast 표시. 에러는 수정되었으나 제출 불가 | [ ] 사용자가 3초 대기 필요 |
| CON-05 | 여러 탭에서 동일 폼 동시 오픈 | 각 탭은 독립적 JS 인스턴스, lastSubmitTime 공유 안됨 | [ ] 각 탭 독립 제출 가능 [ ] 서버에서 중복 이메일 409 처리 |
| CON-06 | 같은 이메일로 탭 A 제출 → 탭 B 제출 | 탭 A: 200 OK. 탭 B: 409 → 성공 메시지 (동일 UI) | [ ] 두 탭 모두 성공 메시지 표시 |
| CON-07 | fetch 중 Toast 타이머와 fetch 응답 동시 도착 | Toast 타이머와 fetch 콜백은 독립적 비동기 작업, 순서 보장 없으나 문제 없음 | [ ] 상태 충돌 없음 |

---

## 14. 브라우저 자동완성 & 비밀번호 관리자 (Autofill & Password Managers)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| AUT-01 | Chrome 자동완성으로 이름/이메일 자동 입력 | `autocomplete="off"`이나 Chrome이 무시할 수 있음. 자동완성 후 input/change 이벤트 발생 여부는 브라우저 의존 | [ ] 자동완성된 값이 validation에서 인식되는지 확인 [ ] 에러 상태 자동 해제 여부 |
| AUT-02 | 자동완성 시 -webkit-autofill 스타일 적용 | CSS에 autofill 오버라이드 존재: background 투명 + text color 유지 | [ ] 노란 배경 아닌 다크 테마 유지 [ ] 텍스트 색상 정상 |
| AUT-03 | 비밀번호 관리자(1Password, LastPass 등)가 필드 채움 | 관리자가 DOM 직접 수정, input 이벤트 발생 여부 불확실 — **잠재 이슈**: 에러 자동해제 미작동 가능 | [ ] 값은 입력되나 에러 해제 수동 필요 가능 |
| AUT-04 | Safari 자동완성 프롬프트 (연락처 정보) | fullName, email, organization 자동 입력 가능 | [ ] 자동 입력 후 validation 정상 작동 |

---

## 15. 복사/붙여넣기 & 드래그 (Copy/Paste & Drag)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| CPY-01 | 텍스트 필드에 Ctrl+V/Cmd+V 붙여넣기 | 텍스트 삽입, input 이벤트 발생, 에러 자동해제 | [ ] 값 정상 입력 [ ] input 이벤트 트리거 |
| CPY-02 | 이메일 필드에 공백 포함 텍스트 붙여넣기 | 공백 포함 이메일은 regex 실패 | [ ] validation에서 잡힘 |
| CPY-03 | 여러 줄 텍스트 붙여넣기 (이름 필드에) | `<input type="text">`는 줄바꿈 무시, 한 줄로 병합 | [ ] 줄바꿈 제거됨 |
| CPY-04 | 드래그앤드롭으로 텍스트를 필드에 넣기 | 텍스트 삽입, input 이벤트 발생 (브라우저 의존) | [ ] 값 정상 입력 |
| CPY-05 | 긴 텍스트 붙여넣기 (수천자) | 길이 제한 없음 — 입력은 되나 서버 전송 시 페이로드 크기 문제 가능 | [ ] 클라이언트 에러 없음 [ ] 서버 응답 확인 필요 |

---

## 16. CSS 애니메이션 & 시각 상태 (CSS Animation & Visual State)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| CSS-01 | conditional-field 나타남 애니메이션 | `@keyframes fadeIn`: opacity 0→1 + translateY(-5px→0), duration 0.2s | [ ] 부드러운 페이드인 [ ] 0.2초 후 완료 |
| CSS-02 | conditional-field 숨김 | `display: none` 즉시 적용 (애니메이션 없음) | [ ] 즉시 사라짐 (fade-out 없음) |
| CSS-03 | `prefers-reduced-motion: reduce` 환경 | 모든 `animation-duration: 0.01ms`, `transition-duration: 0.01ms` | [ ] conditional-field 나타남 즉시 [ ] Toast 트랜지션 즉시 [ ] 버튼 hover 트랜지션 즉시 |
| CSS-04 | .has-error 스타일 적용 | input: border-color #e05252 + box-shadow rgba(224,82,82,0.15). option-item: border-color rgba(224,82,82,0.4) | [ ] 빨간 테두리 표시 [ ] box-shadow 표시 |
| CSS-05 | .has-error 스타일 제거 | .has-error 클래스 제거 → 원래 스타일로 복원 | [ ] border-color 원래 값 [ ] box-shadow 원래 값 |
| CSS-06 | :has(input:checked) 선택자 지원 | `.option-item:has(input:checked)` — 대부분의 모던 브라우저 지원 | [ ] 체크 시 option-item 배경/테두리 변경 [ ] 미지원 브라우저에서는 스타일 미적용 (기능에는 영향 없음) |
| CSS-07 | checkbox:checked::after 커스텀 체크마크 | 일반 체크박스: content '\2713' (체크마크). "None"/"Just explore": content '' (원형 도트, border-radius: 50%) | [ ] 일반 체크박스: 체크마크 표시 [ ] 배타 체크박스: 라디오 스타일 도트 표시 |
| CSS-08 | 인쇄 모드 | `@media print`: header/footer display:none, body font-size: 12pt | [ ] 헤더/푸터 숨김 [ ] 폼 내용만 인쇄 |

---

## 17. 외부 링크 & 페이지 이탈 (External Links & Page Leave)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| EXT-01 | 푸터 X(Twitter) 링크 클릭 | 새 탭에서 열림 (inline style, 외부 URL) | [ ] target="_blank" [ ] 원래 탭 상태 유지 |
| EXT-02 | 푸터 LinkedIn 링크 클릭 | 새 탭에서 열림 | [ ] target="_blank" [ ] 원래 탭 상태 유지 |
| EXT-03 | 푸터 YouTube 링크 클릭 | 새 탭에서 열림 | [ ] target="_blank" [ ] 원래 탭 상태 유지 |
| EXT-04 | 헤더 로고 클릭 | `pointer-events: none`, `cursor: default` → 클릭 불가 | [ ] 아무 동작 없음 [ ] 페이지 이동 없음 |
| EXT-05 | 폼 입력 중 탭/창 닫기 시도 | `beforeunload` 이벤트 미등록 → 경고 없이 즉시 닫힘 — **잠재 이슈**: 작성 중 데이터 손실 | [ ] 경고 다이얼로그 미표시 [ ] 데이터 즉시 손실 |
| EXT-06 | 폼 입력 중 주소창에 다른 URL 입력 | beforeunload 미등록 → 경고 없이 이동 | [ ] 데이터 손실 |

---

## 18. 페이지 라이프사이클 (Page Lifecycle)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| LFC-01 | 탭 백그라운드로 전환 (다른 탭 클릭) | JS 타이머(Toast setTimeout) 정상 실행 (브라우저에 따라 throttle 가능), 폼 상태 유지 | [ ] 포그라운드 복귀 시 폼 상태 그대로 [ ] Toast 타이머 정상 완료 |
| LFC-02 | 탭 포그라운드로 복귀 | 모든 상태 유지, 추가 초기화 없음 | [ ] 입력 데이터 유지 [ ] conditional-field 상태 유지 |
| LFC-03 | 모바일 화면 잠금 → 해제 | 브라우저 탭 유지, 상태 보존 | [ ] 폼 상태 유지 |
| LFC-04 | 모바일 앱 전환 (브라우저 백그라운드 → 포그라운드) | 메모리 충분 시 상태 유지, 부족 시 페이지 재로드 가능 | [ ] 메모리 충분: 상태 유지 [ ] 메모리 부족: 초기 상태로 재로드 |
| LFC-05 | fetch 진행 중 탭 백그라운드 전환 | fetch는 계속 진행 (Service Worker 아닌 일반 fetch), 응답 콜백은 백그라운드에서도 실행 | [ ] 포그라운드 복귀 시 성공/실패 상태 반영됨 |
| LFC-06 | bfcache에서 페이지 복원 (pageshow event) | bfcache 복원 시 JS 상태 + DOM 상태 모두 복원, DOMContentLoaded 재실행 안됨 | [ ] 이벤트 리스너 유지 [ ] lastSubmitTime 값 유지 [ ] conditional-field 상태 유지 |
| LFC-07 | 브라우저 "탭 폐기" (메모리 절약) → 복원 | 페이지 완전 재로드, 초기 상태 | [ ] 폼 빈 상태 [ ] 모든 conditional-field 숨김 |
| LFC-08 | 매우 오랜 시간(수 시간) 후 서브밋 | Supabase API 키 만료 가능성 (JWT exp 확인), 실패 시 Toast error | [ ] API 키 유효 기간 내면 성공 [ ] 만료 시 401 → Toast error |

---

## 19. Honeypot 필드 심화 (Honeypot Deep Behavior)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| HPT-01 | 정상 사용자 — honeypot 필드 비어 있음 | honeypot 체크 통과 → 정상 validation+submit 플로우 | [ ] form.querySelector('input[name="website"]').value === '' |
| HPT-02 | 봇이 honeypot 필드 채움 | 가짜 성공: form display:none + successMessage visible, **fetch 미실행** | [ ] Supabase 요청 0건 [ ] 사용자에게 성공으로 보임 |
| HPT-03 | honeypot 필드의 접근성 | `aria-hidden="true"` + `position:absolute; left:-9999px; top:-9999px` + `tabindex="-1"` | [ ] 스크린 리더가 읽지 않음 [ ] Tab으로 접근 불가 [ ] 시각적으로 보이지 않음 |
| HPT-04 | honeypot 채움 + validation 에러 있는 경우 | honeypot 체크가 validation보다 먼저 실행됨 → 가짜 성공 (validation 스킵) | [ ] 에러 표시 없이 성공 메시지 |
| HPT-05 | honeypot 채움 + rate limit 걸린 경우 | rate limit 체크가 honeypot 체크보다 먼저 실행됨 → rate limit Toast 표시 | [ ] Toast warning 표시 [ ] 가짜 성공 미표시 |

---

## 20. FormData 수집 타이밍 & 순서 (FormData Collection Timing)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| FDT-01 | 숨김 conditional-field의 잔여 input 값이 FormData에 포함되는가 | `display: none` 요소도 FormData에 포함됨. 그러나 clearFieldInputs로 값이 초기화되어야 함 | [ ] 숨김 필드의 radio/checkbox: unchecked → FormData에 미포함 (unchecked는 FormData에 안감) [ ] 숨김 필드의 text: value='' → FormData에 빈 문자열로 포함 — **잠재 이슈** |
| FDT-02 | checkbox 복수 선택 시 FormData 배열 구성 | 같은 name의 checkbox 여러 개 체크 → forEach에서 배열로 변환 | [ ] data[key]가 배열로 올바르게 구성 |
| FDT-03 | checkbox 단일 선택 시 FormData 단일 값 | 같은 name의 checkbox 1개만 체크 → 문자열 유지 | [ ] data[key]가 문자열 |
| FDT-04 | 모든 optional 필드 비어있을 때 FormData | socialProfile: '' → JSON에 빈 문자열로 포함, social_profile: null (|| null 처리) | [ ] social_profile이 null |
| FDT-05 | 빈 문자열 key가 form_data에 포함되는 잔여 데이터 문제 | 예: affiliation=industry → industry Other 텍스트 입력 → affiliation=academic → submit. industryOther 필드 value='' (clearFieldInputs로 초기화), FormData에 industryOther='' 포함 | [ ] form_data JSON에 industryOther: '' 존재 여부 확인 — **잠재 이슈**: 빈 잔여 키 |

---

## 21. 접근성 심화 (Accessibility Deep)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| A11Y-01 | 스크린 리더에서 에러 메시지 인식 | .error-message에 `role="alert"` 설정 → 스크린 리더가 즉시 읽음 | [ ] role="alert" 속성 확인 [ ] 에러 추가 시 스크린 리더 알림 |
| A11Y-02 | 스크린 리더에서 Toast 인식 | toast에 `role="alert"` + `aria-live="polite"` | [ ] Toast 표시 시 스크린 리더가 읽음 [ ] "polite"이므로 현재 읽기 완료 후 알림 |
| A11Y-03 | 스크린 리더에서 성공 메시지 인식 | successMessage에는 role/aria-live 미설정 — **잠재 이슈** | [ ] 성공 메시지가 스크린 리더에 자동 알림 안됨 가능 |
| A11Y-04 | 스크린 리더에서 conditional-field 상태 변화 인식 | display:none↔block 전환 시 aria 속성 없음 — **잠재 이슈**: 스크린 리더가 새 필드 나타남을 인식 못할 수 있음 | [ ] aria-expanded 또는 aria-hidden 미사용 |
| A11Y-05 | 색각 이상 사용자 — 에러 표시 인식 | 빨간색(#e05252)만으로 에러 표시. 텍스트 메시지도 있으므로 색상만 의존하지 않음 | [ ] 에러 메시지 텍스트로 인식 가능 |
| A11Y-06 | 고대비 모드 (Windows High Contrast) | CSS 변수 기반 색상이 시스템 색상으로 대체될 수 있음 | [ ] 폼 요소 구분 가능 [ ] 텍스트 가독성 유지 |
| A11Y-07 | 줌 200% (WCAG 기준) | 레이아웃이 유동적이므로 대체로 정상 | [ ] 텍스트 오버랩 없음 [ ] 입력 필드 접근 가능 |

---

## 22. 인쇄 (Print)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| PRT-01 | 폼 입력 중 인쇄 (Ctrl+P) | header/footer 숨김, 폼 내용 인쇄 | [ ] 현재 입력 상태 반영 [ ] conditional-field 표시 상태 유지 |
| PRT-02 | 성공 메시지 상태에서 인쇄 | header/footer 숨김, 성공 메시지만 인쇄 | [ ] 폼 hidden → 인쇄에 미포함 [ ] 성공 메시지만 표시 |
| PRT-03 | 에러 상태에서 인쇄 | 에러 메시지 포함 인쇄 | [ ] 빨간 에러 스타일 인쇄 여부 확인 |
| PRT-04 | script.js의 beforeprint/afterprint 이벤트 | body에 'printing' 클래스 추가/제거 | [ ] 인쇄 중 클래스 적용 [ ] 인쇄 후 클래스 제거 |

---

## 23. Rate Limit 심화 (Rate Limit Deep Behavior)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| RLT-01 | 최초 서브밋 | lastSubmitTime=0이므로 `now - 0 >= 3000` → 항상 통과 | [ ] rate limit 미적용 |
| RLT-02 | 서브밋 후 정확히 3000ms 시점에 재서브밋 | `now - lastSubmitTime >= 3000` (< RATE_LIMIT_MS로 비교하므로, 정확히 3000ms일 때 `3000 < 3000`은 false) → 통과 | [ ] 경계값: 3000ms에서 통과 |
| RLT-03 | 서브밋 후 2999ms 시점에 재서브밋 | `2999 < 3000` → rate limit Toast | [ ] warning Toast 표시 |
| RLT-04 | validation 에러 발생 시 lastSubmitTime 갱신 | rate limit 체크가 validation 전에 실행되므로 lastSubmitTime이 먼저 갱신됨. validation 실패해도 lastSubmitTime은 이미 갱신 — **확인 필요** | [ ] 코드 순서: honeypot → rate limit(lastSubmitTime=now) → validation [ ] validation 실패 후에도 3초 대기 필요 |
| RLT-05 | honeypot 감지 시 lastSubmitTime 갱신 안됨 | honeypot 감지 → return (lastSubmitTime 갱신 전에 return) | [ ] lastSubmitTime 미변경 [ ] 즉시 재시도 가능 |
| RLT-06 | 페이지 로드 후 매우 빠른 서브밋 (< 1초) | lastSubmitTime=0이므로 항상 통과 | [ ] rate limit 미적용 |

---

## 24. Supabase 요청 상세 (Supabase Request Details)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| SBR-01 | 요청 헤더 정확성 | Content-Type: application/json, apikey: SUPABASE_ANON_KEY, Authorization: Bearer {KEY}, Prefer: return=minimal | [ ] 4개 헤더 모두 포함 |
| SBR-02 | 요청 바디 구조 | `{ email, full_name, organization, country, social_profile, form_data }` | [ ] 6개 필드 포함 [ ] form_data는 전체 폼 데이터 JSON |
| SBR-03 | social_profile null 처리 | `data.socialProfile || null` — 빈 문자열이면 null | [ ] socialProfile 미입력 시 null |
| SBR-04 | form_data에 honeypot 미포함 | `formData.delete('website')` 실행 후 data 구성 | [ ] website 키 없음 |
| SBR-05 | Prefer: return=minimal 의미 | 응답 바디 없음 (빈 바디), 상태 코드만 반환 | [ ] response.ok 또는 response.status로만 판단 |

---

## 25. 다중 DOMContentLoaded 리스너 (Dual Listener)

| ID | 시나리오 | 예상 결과 | 체크리스트 |
|----|----------|-----------|------------|
| DLC-01 | script.js DOMContentLoaded (line 230) 실행 | initSmoothScroll, initLazyLoading, initScrollAnimations, initHeaderShadow, initExternalLinks, initCodeCopy 실행 | [ ] 각 함수 에러 없이 실행 (대부분 해당 DOM 요소 없으므로 no-op) |
| DLC-02 | index.html DOMContentLoaded (line 1192) 실행 | 폼 로직 전체 초기화: 이벤트 리스너 등록, 조건부 필드 설정 | [ ] 모든 이벤트 리스너 정상 등록 |
| DLC-03 | 두 리스너 실행 순서 | script.js가 `<head>`에서 로드되므로 먼저 등록, 먼저 실행. index.html의 `<script>`는 `<body>` 끝에 위치 | [ ] script.js 리스너 → index.html 리스너 순서 |
| DLC-04 | script.js 리스너에서 에러 발생 시 | script.js 리스너 에러 → index.html 리스너는 독립적이므로 정상 실행 (별도 addEventListener) | [ ] 폼 기능 정상 작동 |

---

# 검증 체크리스트 요약 (Verification Checklist Summary)

## Phase 1: 페이지 로드 & 초기화

- [ ] INIT-01: 페이지 로드 시 모든 conditional-field 숨김 상태
- [ ] INIT-02: 폰트 로드 전 fallback 폰트 표시
- [ ] INIT-05: 캐시된 재방문 시 폼 빈 상태
- [ ] INIT-06: 브라우저 자동완성 표시 시 폼 기능 정상
- [ ] DLC-01~04: 두 DOMContentLoaded 리스너 독립 실행

## Phase 2: 브라우저 네비게이션

- [ ] NAV-02: 뒤로→앞으로 시 bfcache 복원 상태 확인 (입력 데이터, conditional-field)
- [ ] NAV-03: 성공 후 뒤로→앞으로 상태
- [ ] NAV-07: iOS 스와이프 뒤로가기 동작
- [ ] NAV-08: Android 하드웨어 뒤로가기

## Phase 3: 새로고침

- [ ] REF-01: 입력 중 새로고침 → 데이터 손실 + 초기 상태
- [ ] REF-03: 성공 후 새로고침 → 폼 복원
- [ ] REF-04: 서브밋 중 새로고침 → 버튼 초기화

## Phase 4: Toast 알림

- [ ] TST-01: rate limit Toast 표시 조건 (3초 이내)
- [ ] TST-02: 서버 에러 Toast 표시
- [ ] TST-03~04: Toast 표시/숨김 트랜지션
- [ ] TST-05: Toast 연속 트리거 시 이전 타이머 취소+교체
- [ ] TST-07: reduced-motion 환경 Toast 동작
- [ ] TST-08: Toast 고정 위치 (스크롤 무관)
- [ ] TST-11~13: Toast 이후 사용자 동작 (재시도, 폼 입력)

## Phase 5: 스크롤

- [ ] SCR-01: 에러 시 첫 에러로 스크롤 (헤더 오프셋 반영)
- [ ] SCR-02: 성공 시 페이지 상단 스크롤
- [ ] SCR-04: 다양한 뷰포트에서 헤더 오프셋 정확
- [ ] SCR-07: 모바일 가상 키보드 상태에서 에러 스크롤

## Phase 6: 서브밋 버튼

- [ ] BTN-01~05: 버튼 상태 전환 (초기→진행→성공/실패)
- [ ] BTN-06: disabled 상태에서 클릭 무시
- [ ] BTN-07: disabled 상태에서 Enter 키 동작
- [ ] BTN-08: 더블클릭 방지

## Phase 7: 성공 상태

- [ ] SUC-01: 성공 시 폼 숨김 + 성공 메시지 + hero-subtitle 변경 + scroll to top
- [ ] SUC-03: 성공 후 새로고침 → 초기 상태 복원
- [ ] SUC-06: honeypot 감지 가짜 성공 → fetch 미실행
- [ ] SUC-07: 409 응답 → 200과 동일한 UI

## Phase 8: 에러 상태 & 복구

- [ ] ERR-01~02: input/change 이벤트로 에러 자동 해제
- [ ] ERR-04: 다중 에러 → 부분 수정 → 재서브밋
- [ ] ERR-05: conditional-field 숨김 시 에러 상태 처리
- [ ] ERR-09: form-group vs conditional-field 에러 group 탐색 정확
- [ ] ERR-10: 동일 그룹 중복 에러 방지

## Phase 9: 네트워크 & 서버

- [ ] NET-01~02: 오프라인/연결끊김 → Toast error + 버튼 재활성화
- [ ] NET-03: 느린 네트워크 → 장시간 "Submitting..." (timeout 미설정)
- [ ] NET-06~13: 다양한 HTTP 상태 코드 처리 (200, 409, 400~503)
- [ ] NET-14~15: 에러 후 재시도 (rate limit 영향)

## Phase 10: 키보드

- [ ] KEY-01: Tab 순서 (숨김 필드 스킵)
- [ ] KEY-03: honeypot Tab 접근 불가
- [ ] KEY-04: Enter 키 서브밋 동작
- [ ] KEY-05~06: 방향키/Space 키 라디오/체크박스 조작
- [ ] KEY-09: 에러 스크롤 후 포커스 위치

## Phase 11: 터치 & 모바일

- [ ] TCH-01~02: option-item 터치 영역
- [ ] TCH-03: 더블탭 줌 방지 (touch-action: manipulation)
- [ ] TCH-06: 핀치 줌 가능
- [ ] TCH-07: iOS input focus auto-zoom
- [ ] TCH-08~09: 가상 키보드 레이아웃 변화
- [ ] TCH-11: hover 스타일 터치 디바이스 미적용

## Phase 12: 뷰포트 & 반응형

- [ ] VPT-01~02: 화면 회전 시 레이아웃 + 데이터 유지
- [ ] VPT-04: ≤380px 레이아웃
- [ ] VPT-06~07: 에러/성공 상태에서 회전

## Phase 13: 동시성 & 타이밍

- [ ] CON-01: 버튼 연타 → 단일 fetch
- [ ] CON-03~04: rate limit + validation 에러 겹침
- [ ] CON-05~06: 다중 탭 독립성 + 중복 이메일 처리

## Phase 14: 자동완성

- [ ] AUT-01: Chrome 자동완성 후 validation 인식
- [ ] AUT-02: autofill 스타일 오버라이드 (다크 테마)
- [ ] AUT-03: 비밀번호 관리자 호환성

## Phase 15: 복사/붙여넣기

- [ ] CPY-01: 붙여넣기 후 input 이벤트 발생
- [ ] CPY-02: 공백 포함 이메일 붙여넣기 → validation 실패
- [ ] CPY-05: 긴 텍스트 붙여넣기

## Phase 16: CSS & 시각 상태

- [ ] CSS-01~02: conditional-field 나타남/숨김 애니메이션
- [ ] CSS-03: reduced-motion 환경 동작
- [ ] CSS-04~05: 에러 스타일 적용/제거
- [ ] CSS-06: :has() 선택자 지원
- [ ] CSS-07: 커스텀 체크박스/라디오 스타일

## Phase 17: 외부 링크 & 이탈

- [ ] EXT-01~03: 푸터 링크 새 탭 + 원래 탭 유지
- [ ] EXT-04: 로고 클릭 불가
- [ ] EXT-05~06: beforeunload 미등록 → 데이터 손실 경고 없음

## Phase 18: 페이지 라이프사이클

- [ ] LFC-01~02: 탭 전환 시 상태 유지
- [ ] LFC-05: fetch 중 백그라운드 → 포그라운드 복귀 시 결과 반영
- [ ] LFC-06: bfcache 복원 시 JS 상태 유지
- [ ] LFC-08: 장시간 후 서브밋 (API 키 만료)

## Phase 19: Honeypot

- [ ] HPT-01: 정상 사용자 통과
- [ ] HPT-02: 봇 감지 → 가짜 성공, fetch 미실행
- [ ] HPT-03: 접근성 (aria-hidden, tabindex=-1)
- [ ] HPT-04~05: honeypot과 validation/rate limit 실행 순서

## Phase 20: FormData

- [ ] FDT-01: 숨김 필드 잔여 값 FormData 포함 여부
- [ ] FDT-02~03: checkbox 배열/단일 값 구성
- [ ] FDT-05: 빈 잔여 키 form_data 포함 문제

## Phase 21: 접근성

- [ ] A11Y-01: 에러 메시지 role="alert"
- [ ] A11Y-02: Toast role="alert" + aria-live="polite"
- [ ] A11Y-03: 성공 메시지 aria 미설정
- [ ] A11Y-04: conditional-field aria 미설정
- [ ] A11Y-07: 200% 줌 레이아웃

## Phase 22: 인쇄

- [ ] PRT-01~03: 폼/성공/에러 상태 인쇄
- [ ] PRT-04: beforeprint/afterprint 이벤트

## Phase 23: Rate Limit

- [ ] RLT-01: 최초 서브밋 통과
- [ ] RLT-02~03: 경계값 테스트 (3000ms, 2999ms)
- [ ] RLT-04: validation 실패 시에도 lastSubmitTime 갱신
- [ ] RLT-05: honeypot 감지 시 lastSubmitTime 미갱신

## Phase 24: Supabase 요청

- [ ] SBR-01: 요청 헤더 4개 정확
- [ ] SBR-02: 요청 바디 6개 필드
- [ ] SBR-03: social_profile null 처리
- [ ] SBR-04: honeypot 키 미포함

## Phase 25: Dual Listener

- [ ] DLC-03: 실행 순서 (script.js → index.html)
- [ ] DLC-04: script.js 에러 시 index.html 리스너 독립 실행

---

# 잠재 이슈 (Potential Issues) 요약

| ID | 이슈 | 위치 | 심각도 |
|----|------|------|--------|
| PI-01 | bfcache 복원 시 JS 변수와 DOM 상태 불일치 가능 (conditional-field) | NAV-02 | Medium |
| PI-02 | fetch timeout 미설정 → 느린 네트워크에서 무한 대기 | NET-03 | High |
| PI-03 | beforeunload 미등록 → 작성 중 데이터 손실 경고 없음 | EXT-05 | Medium |
| PI-04 | Enter 키로 submit 시 disabled 체크 없음 (rate limit이 방어) | BTN-07 | Low |
| PI-05 | 에러 스크롤 후 포커스 미이동 (접근성) | KEY-09 | Medium |
| PI-06 | 성공 메시지에 aria-live/role 미설정 (스크린 리더) | A11Y-03 | Medium |
| PI-07 | conditional-field 상태 변화에 aria 미사용 | A11Y-04 | Medium |
| PI-08 | 숨김 필드의 빈 text input이 FormData에 포함 (잔여 데이터) | FDT-01, FDT-05 | Low |
| PI-09 | validation 실패해도 lastSubmitTime 갱신 → 에러 수정 후 3초 대기 필요 | RLT-04 | Low |
| PI-10 | 비밀번호 관리자 DOM 직접 수정 시 input 이벤트 미발생 → 에러 자동해제 안됨 | AUT-03 | Low |

---

# 테스트 케이스 총 집계

| 카테고리 | 케이스 수 |
|----------|-----------|
| 1. 페이지 로드 & 초기화 | 6 |
| 2. 브라우저 뒤로가기/앞으로가기 | 8 |
| 3. 페이지 새로고침 | 5 |
| 4. Toast 알림 동작 | 13 |
| 5. 스크롤 동작 | 8 |
| 6. 서브밋 버튼 상태 머신 | 10 |
| 7. 성공 상태 이후 동작 | 7 |
| 8. 에러 상태 & 복구 플로우 | 10 |
| 9. 네트워크 & 서버 응답 | 16 |
| 10. 키보드 네비게이션 | 11 |
| 11. 터치 & 모바일 전용 | 13 |
| 12. 뷰포트 & 반응형 | 7 |
| 13. 동시성 & 타이밍 | 7 |
| 14. 브라우저 자동완성 | 4 |
| 15. 복사/붙여넣기 | 5 |
| 16. CSS 애니메이션 & 시각 상태 | 8 |
| 17. 외부 링크 & 페이지 이탈 | 6 |
| 18. 페이지 라이프사이클 | 8 |
| 19. Honeypot 심화 | 5 |
| 20. FormData 수집 | 5 |
| 21. 접근성 심화 | 7 |
| 22. 인쇄 | 4 |
| 23. Rate Limit 심화 | 6 |
| 24. Supabase 요청 상세 | 5 |
| 25. Dual DOMContentLoaded | 4 |
| **총계** | **193** |
