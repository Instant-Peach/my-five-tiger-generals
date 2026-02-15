/**
 * @ftg/game-renderer
 *
 * Phaser 3 기반 게임 렌더링 패키지
 */

// Config
export { createGameConfig, createGame, type GameConfigOptions } from './config';

// Scenes
export { BootScene } from './scenes/BootScene';
export { GameScene } from './scenes/GameScene';

// Rendering
export {
  TileRenderer,
  getTileCenter,
  DEFAULT_TILE_CONFIG,
  type TileRenderConfig,
} from './rendering/TileRenderer';
export {
  BoardRenderer,
  type BoardRenderConfig,
} from './rendering/BoardRenderer';
export {
  GeneralRenderer,
  type GeneralRenderConfig,
  type GetTileCenterFn,
} from './rendering/GeneralRenderer';
export {
  TroopIndicator,
  type TroopIndicatorConfig,
} from './rendering/TroopIndicator';
export {
  DamageFloater,
  type DamageFloaterConfig,
} from './rendering/DamageFloater';
export {
  AttackEffect,
  type AttackEffectConfig,
} from './rendering/AttackEffect';

// Input
export { InputHandler, type TileSelectCallback } from './input';

// UI
export {
  GeneralActionMenu,
  type ActionType as GeneralActionType,
  type ActionMenuOptions,
} from './ui/GeneralActionMenu';
export {
  MoveConfirmButton,
} from './ui/MoveConfirmButton';
export {
  DisengageWarningModal,
} from './ui/DisengageWarningModal';
