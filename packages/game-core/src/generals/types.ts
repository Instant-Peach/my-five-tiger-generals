/**
 * 장수 시스템 타입 정의
 *
 * 삼국지 장수들의 데이터 모델을 정의합니다.
 * GDD의 Unit Types and Classes 섹션 기반.
 */

import type { TileId } from '../board/types';

/** 플레이어 ID */
export type PlayerId = 'player1' | 'player2';

/** 장수 ID - 고유 식별자 (예: "player1_guanyu") */
export type GeneralId = string;

/** 장수 기본 ID - 장수 종류 식별자 (예: "guanyu") */
export type GeneralBaseId = string;

/**
 * 장수 상태
 * - active: 보드에서 활동 중
 * - engaged: 전선 교전 중 (이동 제한, 공격/이탈만 가능)
 * - out: 병력 0으로 일시 퇴장 (복귀 가능)
 * - eliminated: 2차 OUT으로 완전 퇴장 (복귀 불가)
 * - standby: 대기 (배치 전)
 */
export type GeneralStatus = 'active' | 'engaged' | 'out' | 'eliminated' | 'standby';

/**
 * 장수 스탯 (GDD 기준)
 *
 * @property star - 별 ⭐: 최대 병력 수 (최대 HP)
 * @property sun - 해 ☀️: 우측 대각선 공격/방어력
 * @property moon - 달 🌙: 좌측 대각선 공격/방어력
 * @property speed - 발 👣: 한 턴 이동 가능 거리
 */
export interface GeneralStats {
  /** 별 ⭐ - 최대 병력 */
  star: number;
  /** 해 ☀️ - Sun 방향 공격/방어력 */
  sun: number;
  /** 달 🌙 - Moon 방향 공격/방어력 */
  moon: number;
  /** 발 👣 - 이동력 */
  speed: number;
}

/**
 * 장수 기본 데이터 (불변)
 * 게임 시작 전 정의되는 장수의 기본 정보
 */
export interface GeneralBaseData {
  /** 장수 기본 ID (예: "guanyu") */
  baseId: GeneralBaseId;
  /** 영문 이름 */
  name: string;
  /** 한글 이름 */
  nameKo: string;
  /** 기본 스탯 */
  stats: GeneralStats;
}

/**
 * 장수 엔티티 (게임 중 상태)
 * 게임 진행 중 변경되는 장수의 상태
 */
export interface General {
  /** 고유 ID (예: "player1_guanyu") */
  id: GeneralId;
  /** 장수 기본 ID (예: "guanyu") */
  baseId: GeneralBaseId;
  /** 영문 이름 */
  name: string;
  /** 한글 이름 */
  nameKo: string;
  /** 소유 플레이어 */
  owner: PlayerId;
  /** 기본 스탯 (불변) */
  stats: GeneralStats;
  /** 현재 병력 (= 현재 HP, 0이 되면 OUT) */
  troops: number;
  /** 현재 위치 (null = 배치 전 또는 OUT 상태) */
  position: TileId | null;
  /** 현재 상태 */
  status: GeneralStatus;
  /** 남은 목숨 (초기값 2, 0이 되면 eliminated) */
  livesRemaining: number;
  /** 교전 상대 장수 ID (engaged 상태일 때만 설정) */
  engagedWith?: GeneralId;
}
