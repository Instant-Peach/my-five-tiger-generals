---
name: 'bmgd-dev-process'
description: 'BMGD 개발 프로세스 - 오케스트레이터 방식'
---

# BMGD 개발 프로세스

## 오케스트레이터 모드

<ORCHESTRATOR priority="CRITICAL">
- **메인 세션**: 전체 흐름 제어, 조건 체크, 대기/진행 결정
- **Subagent**: 워크플로우 실행 후 **구조화된 YAML 블록** 반환
- 하위 워크플로우의 "자동 진행", "YOLO 모드" 등은 이 컨텍스트에서 **무시**
- **커맨드 시작 시 TaskCreate로 Step 0~6 초기화**, 각 Step 전환 시 TaskUpdate로 상태 업데이트
- **orchestrator-state.yaml**에 세션 간 영속 상태 저장/복원
</ORCHESTRATOR>

---

## orchestrator-state.yaml 스키마

**경로**: `_bmad-output/implementation-artifacts/orchestrator-state.yaml`

```yaml
# === BMGD Orchestrator State ===
session_id: ""                    # 현재 세션 식별자 (timestamp)
last_updated: ""                  # ISO 8601

# Step 0에서 로드
retro_agreements: []              # 최근 회고 합의 사항 목록

# Step 1 결과
story_path: ""
story_id: ""
story_title: ""
epic_num: 0
story_num: 0
total_stories_in_epic: 0
visual_check_required: false
is_last_story_in_epic: false
tech_debt_slot_used: false

# Step 2 결과
complexity: 0
modified_files: []
unit_test_result: ""
unit_test_count: 0
architecture_boundary_changed: false
boundary_files_changed: []

# Step 3 결과
e2e_test_result: ""
test_fix_attempts: 0

# Step 4 결과
code_review_done: false
code_review_issues: 0
retrospective_done: false

# 진행 상태
current_step: 0                   # 0-6
halted: false
halt_reason: ""
halt_recovery_point: ""           # 복구 시 재개할 Step
```

**사용 규칙:**
1. 각 Step 완료 시 해당 필드 업데이트 후 파일에 기록
2. 세션 시작 시 파일이 존재하면 `halted == true`인지 확인 → 복구 흐름 진입
3. 정상 완료(Step 6) 시 파일 삭제 또는 초기화

---

## 실행 흐름

```
[0] 메인 세션: 이전 회고 팀 합의 로드 + 상태 복원
[1] Subagent: create-story → YAML 반환 → story 정보 저장
[2] Subagent: dev-story → YAML 반환 → complexity, modified_files 저장
[3] 메인 세션: E2E test & fix (E2E 전용, 단위 테스트는 Step 2에서 완료)
[4] 메인 세션: 조건 체크 GATE
    ├─ visual-confirm (visual_check_required == true) → HALT
    ├─ code-review (complexity >= 2 OR architecture_boundary_changed) → Subagent
    └─ retrospective (is_last_story_in_epic) → Subagent
[5] 메인 세션: commit (특정 파일 add + Co-Authored-By)
[6] 메인 세션: user-notice → 세션 종료
```

---

## Step 0: 이전 회고 팀 합의 로드

**메인 세션 직접 수행:**

1. **상태 복원 확인**: `orchestrator-state.yaml` 존재 여부 확인
   - `halted == true` → **HALT 복구 절차** 섹션으로 이동
   - 존재하지 않거나 `halted == false` → 새 세션 시작

2. **회고 합의 로드**: 최근 retrospective 파일 검색
   ```
   glob: _bmad-output/implementation-artifacts/epic-*-retro-*.md
   ```
   - 파일이 있으면: "팀 합의" 또는 "Agreements" 섹션에서 합의 항목 추출
   - `retro_agreements`에 저장
   - 해당 합의가 이번 스토리에 영향을 주는지 Step 1 전달 시 참고

3. **기술 부채 체크**: 현재 에픽의 기술 부채 스토리 할당 여부 사전 확인
   - `_bmad-output/implementation-artifacts/sprint-status.yaml`에서 현재 에픽 스토리 목록 확인
   - 기술 부채 스토리가 0건이면 Step 1에 `tech_debt_needed` 플래그 전달

4. **orchestrator-state.yaml 초기화**: 새 session_id, current_step: 0

---

## Step 1: create-story

**Subagent 실행:**
```
bmad:bmgd:workflows:create-story 워크플로우 실행
```

**반환 계약 (YAML 파싱):**
Subagent 응답 끝의 `# === BMGD CREATE-STORY RETURN ===` YAML 블록을 파싱:
```yaml
result: "success"
story_path: ""
story_id: ""
story_title: ""
epic_num: 0
story_num: 0
total_stories_in_epic: 0
visual_check_required: false
is_last_story_in_epic: false
tech_debt_slot_used: false
```

**visual_check_required 판단 기준:**

| true | false |
|------|-------|
| 새 UI 컴포넌트 생성 | game-core 순수 로직 |
| 레이아웃/배치 변경 | 기존 레이아웃 유지 |
| 새 색상/스타일/애니메이션 | 기존 스타일 재사용 |
| 새 인터랙션 영역 | 기존 인터랙션 패턴 |
| 새 텍스트 UI | 테스트/타입만 추가 |

**기술 부채 스토리 체크:**
- Step 0에서 `tech_debt_needed == true`이고 `tech_debt_slot_used == false`이면:
  - 사용자에게 알림: "이 에픽에 기술 부채 스토리가 아직 없습니다. 다음 스토리로 기술 부채를 추천합니다."
  - 추천만 하고 강제하지 않음 (사용자 결정 존중)

**메인 세션 후속:**
- 반환 YAML의 모든 필드를 orchestrator-state.yaml에 저장
- `current_step: 1` 업데이트

---

## Step 2: dev-story

**Subagent 실행:**
```
bmad:bmgd:workflows:dev-story 워크플로우 실행
story 파일: {{story_path}}
```

**반환 계약 (YAML 파싱):**
Subagent 응답 끝의 `# === BMGD DEV-STORY RETURN ===` YAML 블록을 파싱:
```yaml
result: "success"
complexity: 0
modified_files:
  - "path/to/file.ts"
unit_test_result: "pass"
unit_test_count: 0
architecture_boundary_changed: false
boundary_files_changed:
  - "path/to/boundary-file.ts"
```

**단위 테스트 책임**: dev-story Subagent가 구현 중 단위 테스트를 작성하고 통과시킴. 메인 세션은 단위 테스트를 별도로 실행하지 않음.

**메인 세션 후속:**
- 반환 YAML의 모든 필드를 orchestrator-state.yaml에 저장
- `current_step: 2` 업데이트

---

## Step 3: E2E test & fix

**메인 세션 직접 수행:**
```bash
npx playwright test
```
- **E2E 테스트 전용** — 단위 테스트는 Step 2(dev-story)에서 이미 완료
- 오류 시 수정 후 재실행 (`test_fix_attempts` 카운트)
- 3회 실패 시 **HALT** (복구 절차: HALT-3 참조)
- 통과 시 `e2e_test_result: "pass"`, `current_step: 3` 저장 후 Step 4로 진행

---

## Step 4: 조건 체크 GATE

### 4-1. visual-confirm
```
조건: visual_check_required == true
```
- false면 자동 진행 (4-2로)
- true면 아래 절차 수행:

1. orchestrator-state.yaml에 `halted: true`, `halt_reason: "visual_check"`, `halt_recovery_point: "step4-2"` 저장
2. 사용자에게 **게임을 직접 실행하여 확인**하도록 안내 메시지 출력:
   ```
   ## 시각적 확인 필요

   이 스토리({{story_id}})는 UI/비주얼 변경을 포함합니다.
   게임을 실행하여 아래 4가지 항목을 확인해주세요.
   확인 후 아래 질문에 답변해주시면 진행됩니다.
   ```
3. **`AskUserQuestion` 도구**로 4개 항목을 한번에 확인:

```yaml
questions:
  - question: "레이아웃/배치가 정상인가요? (UI 요소 위치, 크기, 정렬)"
    header: "레이아웃"
    multiSelect: false
    options:
      - label: "정상"
        description: "레이아웃이 의도대로 배치되어 있음"
      - label: "특이사항 있음"
        description: "위치, 크기, 정렬 등에 수정이 필요한 부분이 있음"
  - question: "색상/스타일이 정상인가요? (색상, 폰트, 시각 효과, 애니메이션)"
    header: "색상/스타일"
    multiSelect: false
    options:
      - label: "정상"
        description: "색상과 스타일이 의도대로 적용되어 있음"
      - label: "특이사항 있음"
        description: "색상, 폰트, 애니메이션 등에 수정이 필요한 부분이 있음"
  - question: "인터랙션이 정상인가요? (클릭, 호버, 드래그 등 사용자 상호작용)"
    header: "인터랙션"
    multiSelect: false
    options:
      - label: "정상"
        description: "모든 인터랙션이 의도대로 동작함"
      - label: "특이사항 있음"
        description: "클릭, 호버 등 상호작용에 문제가 있음"
  - question: "텍스트/콘텐츠가 정상인가요? (텍스트 내용, 잘림, 오버플로우, 한글 표시)"
    header: "텍스트"
    multiSelect: false
    options:
      - label: "정상"
        description: "텍스트가 정상적으로 표시되고 내용이 올바름"
      - label: "특이사항 있음"
        description: "텍스트 잘림, 오버플로우, 오타 등 수정이 필요함"
```

4. **응답 처리**:
   - **4개 모두 "정상"** → `halted: false`, Step 4-2로 자동 진행
   - **1개 이상 "특이사항 있음"** (사용자가 Other로 상세 입력) → 피드백 내용을 수집하여 수정 작업 수행 후 Step 3(E2E 재실행)부터 재개

### 4-2. code-review
```
조건: complexity >= 2 OR architecture_boundary_changed == true
```
- Subagent로 `bmad:bmgd:workflows:code-review` 실행
- `architecture_boundary_changed == true`인 경우, `boundary_files_changed` 목록을 리뷰 대상으로 명시 전달
- Critical/High 이슈 시 수정 후 재검토 (복구 절차: HALT-2 참조)
- `code_review_done: true`, `code_review_issues: N` 저장

### 4-3. retrospective
```
조건: is_last_story_in_epic == true
```
- Subagent로 `bmad:bmgd:workflows:retrospective` 실행
- **중요**: 모든 Step 완료 후 회고 문서 생성 필수
- 미생성 시 사용자에게 알림 후 재실행 여부 확인
- `retrospective_done: true` 저장

---

## Step 5: commit

```bash
git add {{modified_files}}
```

커밋 메시지는 HEREDOC으로 작성:
```bash
git commit -m "$(cat <<'EOF'
feat: {{story_id}} {{story_title}}

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**주의사항:**
- `git add .` 대신 `modified_files` 목록의 특정 파일만 스테이징
- orchestrator-state.yaml은 `.gitignore`에 등록되어 있으므로 커밋에 포함되지 않음
- `current_step: 5` 저장

---

## Step 6: user-notice

```
## BMGD 개발 사이클 완료

- Story: {{story_id}} {{story_title}}
- 복잡도: {{complexity}}
- 수정된 파일: {{file_count}}개
- 단위 테스트: {{unit_test_count}}개 ({{unit_test_result}})
- E2E 테스트: 통과
- 코드 리뷰: {{code_review_done ? "완료 (이슈 " + code_review_issues + "건)" : "스킵"}}
- 커밋: 완료

다음 스토리는 새 세션에서: /bmgd-dev-process
```

- orchestrator-state.yaml 삭제 (정상 완료)
- TaskUpdate로 모든 Step을 completed 처리

---

## 상태 변수

| 변수 | 설명 | 설정 시점 |
|------|------|----------|
| `session_id` | 세션 식별자 | Step 0 |
| `retro_agreements` | 이전 회고 합의 목록 | Step 0 |
| `story_path` | 스토리 파일 경로 | Step 1 |
| `story_id` | 스토리 ID | Step 1 |
| `story_title` | 스토리 제목 | Step 1 |
| `epic_num` | 에픽 번호 | Step 1 |
| `story_num` | 에픽 내 스토리 번호 | Step 1 |
| `total_stories_in_epic` | 에픽의 총 스토리 수 | Step 1 |
| `visual_check_required` | 시각적 확인 필요 여부 | Step 1 |
| `is_last_story_in_epic` | 에픽 마지막 스토리 여부 | Step 1 |
| `tech_debt_slot_used` | 기술 부채 스토리 여부 | Step 1 |
| `complexity` | 구현 복잡도 (1-5) | Step 2 |
| `modified_files` | 수정된 파일 목록 | Step 2 |
| `unit_test_result` | 단위 테스트 결과 | Step 2 |
| `unit_test_count` | 단위 테스트 수 | Step 2 |
| `architecture_boundary_changed` | 아키텍처 경계 변경 여부 | Step 2 |
| `boundary_files_changed` | 변경된 경계 파일 목록 | Step 2 |
| `e2e_test_result` | E2E 테스트 결과 | Step 3 |
| `test_fix_attempts` | 테스트 수정 시도 횟수 | Step 3 |
| `code_review_done` | 코드 리뷰 완료 여부 | Step 4 |
| `code_review_issues` | 코드 리뷰 이슈 수 | Step 4 |
| `retrospective_done` | 회고 완료 여부 | Step 4 |

---

## 복잡도 기준

| 레벨 | 설명 |
|------|------|
| 1 | 단순 설정, 타입 정의 |
| 2 | 단일 컴포넌트/함수 |
| 3 | 여러 파일 수정, 상태 관리 |
| 4 | 복잡한 로직, 시스템 연동 |
| 5 | 아키텍처 변경, 핵심 시스템 |

---

## HALT 조건 및 복구 절차

### HALT-1: visual_check_required == true → 시각적 확인 대기

**발생 시점**: Step 4-1
**HALT/복구 방식**: `AskUserQuestion` 도구를 사용한 구조화된 확인 (Step 4-1 상세 절차 참조)

**세션 분리된 경우 복구**:
1. orchestrator-state.yaml에서 `halt_reason: "visual_check"` 확인
2. 이전 세션에서 AskUserQuestion 응답을 받지 못한 상태 → **AskUserQuestion을 다시 호출**
3. 응답 처리는 Step 4-1의 "응답 처리" 규칙과 동일:
   - 4개 모두 "정상" → `halted: false`, Step 4-2로 진행
   - 1개 이상 "특이사항 있음" → 피드백 기반 수정 후 Step 3(E2E 재실행)부터 재개

### HALT-2: code-review Critical/High 이슈 발견

**발생 시점**: Step 4-2
**복구 절차**:
1. orchestrator-state.yaml에 `halted: true`, `halt_reason: "code_review_critical"`, `halt_recovery_point: "step4-2"` 저장
2. 이슈 목록과 심각도를 사용자에게 표시
3. **재개 시**: 사용자 선택지 제공
   - "자동 수정" → 이슈 수정 후 Step 3(E2E 재실행)부터 재개
   - "수동 수정" → HALT 유지, 사용자가 수정 후 재개 명령
   - "이슈 무시" → `halted: false`, Step 4-3으로 진행 (사용자 책임)

### HALT-3: 테스트 3회 연속 실패

**발생 시점**: Step 3
**복구 절차**:
1. orchestrator-state.yaml에 `halted: true`, `halt_reason: "test_failure_3x"`, `halt_recovery_point: "step3"` 저장
2. 마지막 3회 실패 로그 요약을 사용자에게 표시
3. **재개 시**: 사용자 선택지 제공
   - "재시도" → `test_fix_attempts` 리셋, Step 3 재실행
   - "수동 수정 후 재시도" → HALT 유지, 사용자가 수정 후 재개 명령
   - "스토리 중단" → orchestrator-state.yaml 삭제, 세션 종료

### HALT-4: 사용자 명시적 요청

**발생 시점**: 모든 Step
**트리거**: "잠깐", "멈춰", "대기", "stop", "halt", "wait"
**복구 절차**:
1. orchestrator-state.yaml에 `halted: true`, `halt_reason: "user_request"`, `halt_recovery_point: "step{현재}"` 저장
2. 현재 진행 상황 요약 표시
3. **재개 시**: 사용자가 "계속" 또는 "재개" → `halt_recovery_point`의 Step부터 재개

---

## 기술 부채 스토리 슬롯 규칙

**원칙**: 에픽당 최소 1건의 기술 부채 스토리를 포함하여 부채 누적을 방지한다.

**체크 시점**: Step 0 (사전 확인) + Step 1 (create-story 전달)

**규칙:**
1. 현재 에픽의 모든 스토리를 sprint-status.yaml에서 확인
2. 기술 부채 스토리가 0건이면 → Step 1에서 사용자에게 추천
3. 회고(retrospective)에서 기술 부채 HIGH 항목이 있으면 → 우선 추천 대상으로 제시
4. 사용자가 거부하면 강제하지 않음 (추천은 마지막 2개 스토리 시점에서 더 강하게)

**기술 부채 스토리 판별**:
- 스토리 제목에 "refactor", "tech-debt", "기술 부채", "리팩터링" 포함
- 또는 `tech_debt_slot_used: true` 반환
