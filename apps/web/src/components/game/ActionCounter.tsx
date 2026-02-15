/**
 * ActionCounter Component
 *
 * 현재 턴의 남은 행동 횟수를 시각적으로 표시하는 컴포넌트입니다.
 * Story 8-2: 게임 HUD (Game HUD)
 *
 * AC2: 행동 카운터 표시
 * - 최대 3개 도트로 남은 행동 시각화 (채워진/빈 도트)
 * - 행동 소모 시 도트 페이드아웃 애니메이션
 * - role="status" + aria-label 접근성 지원
 */

import './ActionCounter.css';

export interface ActionCounterProps {
  /** 남은 행동 횟수 (0-3) */
  actionsRemaining: number;
  /** 최대 행동 횟수 (기본값: 3) */
  maxActions?: number;
}

/**
 * 행동 카운터 컴포넌트
 *
 * - 채워진 도트: #ffd700 (금색) - 사용 가능한 행동
 * - 빈 도트: rgba(255, 255, 255, 0.3) - 이미 소모된 행동
 * - 행동 소모 시 페이드아웃 애니메이션
 */
export function ActionCounter({
  actionsRemaining,
  maxActions = 3,
}: ActionCounterProps) {
  const clampedActions = Math.max(0, Math.min(actionsRemaining, maxActions));

  return (
    <div
      className="action-counter"
      role="status"
      aria-label={`남은 행동 ${clampedActions}/${maxActions}`}
      data-testid="action-counter"
    >
      <span className="action-counter__label">행동</span>
      <span className="action-counter__dots" data-testid="action-counter-dots">
        {Array.from({ length: maxActions }, (_, i) => {
          const isFilled = i < clampedActions;
          return (
            <span
              key={i}
              className={`action-counter__dot ${
                isFilled
                  ? 'action-counter__dot--filled'
                  : 'action-counter__dot--empty'
              }`}
              data-testid={`action-dot-${i}`}
              aria-hidden="true"
            />
          );
        })}
      </span>
    </div>
  );
}
