/**
 * 게임 상태 타입 정의
 *
 * 게임 진행에 필요한 모든 상태를 정의합니다.
 */

import type { General, GeneralId, PlayerId } from '../generals/types';

/**
 * 승리 사유
 * - knock: 노크 3회 성공
 * - annihilation: 전멸 (상대 병력 전부 소멸)
 * - collapse: 와해 (상대 장수 모두 OUT)
 * - surrender: 항복
 */
export type VictoryReason = 'knock' | 'annihilation' | 'collapse' | 'surrender';

/**
 * 승리 결과
 */
export interface VictoryResult {
  /** 승리 플레이어 */
  winner: PlayerId;
  /** 승리 사유 */
  reason: VictoryReason;
}

/**
 * 행동 타입 정의
 * - move: 이동
 * - attack: 공격
 * - tactic: 책략 사용
 * - knock: 노크 (적진 진입)
 * - deploy: 배치 (OUT 상태에서 복귀)
 */
export type ActionType = 'move' | 'attack' | 'tactic' | 'knock' | 'deploy';

/**
 * 수행된 행동 기록
 * 동일 장수의 동일 행동 제한 검증에 사용
 */
export interface PerformedAction {
  /** 행동을 수행한 장수 ID */
  generalId: GeneralId;
  /** 행동 타입 */
  actionType: ActionType;
}

/**
 * 게임 단계
 * - setup: 게임 설정/준비 중
 * - playing: 게임 진행 중
 * - ended: 게임 종료
 */
export type GamePhase = 'setup' | 'playing' | 'ended';

/**
 * 턴 내 단계
 * - select: 장수 선택 단계
 * - action: 행동(이동/공격) 선택 단계
 * - confirm: 행동 확정 단계
 */
export type TurnPhase = 'select' | 'action' | 'confirm';

/**
 * 게임 상태
 */
export interface GameState {
  /** 게임 단계 */
  phase: GamePhase;
  /** 턴 내 단계 */
  turnPhase: TurnPhase;
  /** 현재 턴 플레이어 */
  currentPlayer: PlayerId;
  /** 현재 턴 번호 */
  turn: number;
  /** 모든 장수 목록 */
  generals: General[];
  /** 현재 선택된 장수 ID (null이면 선택 없음) */
  selectedGeneralId: GeneralId | null;
  /** 현재 턴의 남은 행동 횟수 (기본값: 3) */
  actionsRemaining: number;
  /** 현재 턴에 수행된 행동 기록 (동일 장수 동일 행동 제한용) */
  performedActions: PerformedAction[];
  /** Player 1의 노크 카운트 (0-3) */
  player1KnockCount: number;
  /** Player 2의 노크 카운트 (0-3) */
  player2KnockCount: number;
  /** 승리 결과 (게임 종료 시에만 설정) */
  victoryResult?: VictoryResult;
}

/**
 * 게임 통계 (결과 화면 표시용)
 *
 * Story 8-6: 결과 화면 (Result Screen)
 * Phase 2에서 totalDamageDealt, generalKills 등 확장 가능
 */
export interface GameStats {
  /** 총 턴 수 */
  totalTurns: number;
  /** Player 1 노크 횟수 */
  player1KnockCount: number;
  /** Player 2 노크 횟수 */
  player2KnockCount: number;
  /** Player 1 남은 장수 수 */
  player1RemainingGenerals: number;
  /** Player 2 남은 장수 수 */
  player2RemainingGenerals: number;
}

/**
 * 게임 에러 코드
 */
export type GameErrorCode =
  | 'GENERAL_NOT_FOUND'
  | 'INVALID_OWNER'
  | 'GENERAL_NOT_ACTIVE'
  | 'NOT_YOUR_TURN'
  | 'NO_ACTIONS_REMAINING'
  | 'SAME_ACTION_SAME_GENERAL'
  | 'INVALID_MOVE'
  | 'CANNOT_ATTACK_ALLY'
  | 'NOT_ADJACENT'
  | 'ATTACKER_IS_OUT'
  | 'DEFENDER_IS_OUT'
  | 'NOT_IN_KNOCK_ZONE'
  | 'KNOCK_NOT_AVAILABLE'
  | 'GAME_NOT_IN_PROGRESS'
  | 'INVALID_PLAYER'
  | 'ENGAGED_CANNOT_ATTACK_OTHER'
  | 'GENERAL_ELIMINATED';

/**
 * 게임 에러
 */
export interface GameError {
  /** 에러 코드 */
  code: GameErrorCode;
  /** 에러 메시지 */
  message: string;
}

/**
 * Result 타입 - 성공/실패를 타입 안전하게 표현
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: GameError };

/**
 * 게임 이벤트 타입 정의
 * Epic 4 (전투 시스템)에서 실제 이벤트 발행 구현 예정
 */
export interface GameEventPayloads {
  /** 장수 선택 이벤트 */
  'general:selected': {
    generalId: GeneralId;
    owner: PlayerId;
  };
  /** 장수 선택 해제 이벤트 */
  'general:deselected': {
    generalId: GeneralId;
  };
  /** 병력 변화 이벤트 (Story 2-5) */
  'general:troops-changed': {
    generalId: GeneralId;
    previousTroops: number;
    currentTroops: number;
    maxTroops: number;
  };
}
