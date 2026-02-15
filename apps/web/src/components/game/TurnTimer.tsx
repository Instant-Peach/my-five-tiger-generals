/**
 * TurnTimer Component
 *
 * 턴 타이머를 표시하는 UI 컴포넌트입니다.
 * Story 5-3: 60초 타이머 (Sixty Second Timer)
 *
 * AC1: 타이머 UI 컴포넌트
 * - 게임 HUD 영역에 남은 시간 표시
 * - 표시 형식: "00:59", "00:30" 등 (SS 형식)
 * - 텍스트 크기: 읽기 쉬운 적절한 크기 (16px 이상)
 *
 * AC4: 타이머 시각적 피드백
 * - 30초 이하: 주의 색상 (노란색/주황색 계열)
 * - 10초 이하: 경고 색상 (빨간색 계열) + 깜빡임/펄스 효과
 * - 색상 전환 시 부드러운 애니메이션
 */

import { useMemo } from 'react';
import './TurnTimer.css';

export interface TurnTimerProps {
  /** 남은 시간 (초) */
  remainingTime: number;
}

/**
 * 턴 타이머 컴포넌트
 *
 * - 기본 (60-31초): 흰색/밝은 색
 * - 경고 (30-11초): 노란색/주황색 (#F59E0B)
 * - 위험 (10-0초): 빨간색 (#DC2626) + 깜빡임
 */
export function TurnTimer({ remainingTime }: TurnTimerProps) {
  // 경고/위험 상태 계산
  const isWarning = remainingTime <= 30 && remainingTime > 10;
  const isCritical = remainingTime <= 10;

  // CSS 클래스 계산
  const timerClass = useMemo(() => {
    if (isCritical) return 'turn-timer--critical';
    if (isWarning) return 'turn-timer--warning';
    return 'turn-timer--normal';
  }, [isWarning, isCritical]);

  // 시간 포맷팅 (SS 형식, 2자리)
  const formattedTime = useMemo(() => {
    const seconds = Math.max(0, remainingTime);
    return seconds.toString().padStart(2, '0');
  }, [remainingTime]);

  return (
    <div
      className={`turn-timer ${timerClass}`}
      role="timer"
      aria-live="polite"
      aria-label={`남은 시간 ${remainingTime}초`}
    >
      <span className="turn-timer__value">{formattedTime}</span>
      <span className="turn-timer__label">초</span>
    </div>
  );
}
