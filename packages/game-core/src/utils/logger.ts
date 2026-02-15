/**
 * 로거 유틸리티
 *
 * 게임 코어의 디버깅을 위한 로거입니다.
 * 개발 환경에서만 로그를 출력합니다.
 *
 * Story 4-2: 공격 방향 판정 (Attack Direction Judgment)
 */

/** 로그 레벨 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 로그 도메인 */
export type LogDomain = 'combat' | 'movement' | 'turn' | 'board' | 'general' | 'state';

/**
 * Logger 설정
 */
interface LoggerConfig {
  /** 로깅 활성화 여부 */
  enabled: boolean;
  /** 최소 로그 레벨 */
  minLevel: LogLevel;
}

/**
 * 환경에 따른 기본 활성화 여부 확인
 * 브라우저/Node.js 환경 모두 지원
 */
function getDefaultEnabled(): boolean {
  try {
    // Node.js 환경 확인
    if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
      return nodeEnv !== 'production';
    }
    // 브라우저 환경에서는 기본적으로 비활성화 (프로덕션 가정)
    return false;
  } catch {
    return false;
  }
}

/** 현재 로거 설정 */
let config: LoggerConfig = {
  enabled: getDefaultEnabled(),
  minLevel: 'debug',
};

/** 로그 레벨 우선순위 */
const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * 로거 설정 변경
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * 로그 출력 함수
 */
function log(
  level: LogLevel,
  domain: LogDomain,
  message: string,
  data?: Record<string, unknown>
): void {
  if (!config.enabled) return;
  if (levelPriority[level] < levelPriority[config.minLevel]) return;

  const prefix = `[${domain.toUpperCase()}]`;
  const timestamp = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS

  const logFn = level === 'error'
    ? console.error
    : level === 'warn'
      ? console.warn
      : console.log;

  if (data) {
    logFn(`${timestamp} ${prefix} ${message}`, data);
  } else {
    logFn(`${timestamp} ${prefix} ${message}`);
  }
}

/**
 * Logger 유틸리티
 *
 * @example
 * ```typescript
 * Logger.debug('combat', 'Attack direction: sun', { attacker: 12, defender: 13 });
 * Logger.info('movement', 'General moved', { generalId: 'player1_general1', from: 12, to: 17 });
 * ```
 */
export const Logger = {
  debug: (domain: LogDomain, message: string, data?: Record<string, unknown>) =>
    log('debug', domain, message, data),
  info: (domain: LogDomain, message: string, data?: Record<string, unknown>) =>
    log('info', domain, message, data),
  warn: (domain: LogDomain, message: string, data?: Record<string, unknown>) =>
    log('warn', domain, message, data),
  error: (domain: LogDomain, message: string, data?: Record<string, unknown>) =>
    log('error', domain, message, data),
  configure: configureLogger,
};
