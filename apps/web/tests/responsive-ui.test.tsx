/**
 * Responsive UI Tests
 *
 * Story 8-7: 반응형 UI (Responsive UI)
 * 삼국지 영걸전 스타일 레이아웃: 우측 사이드바 + 하단 액션바
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameHUD } from '../src/components/game/GameHUD';
import fs from 'fs';
import path from 'path';

describe('GameHUD 반응형 레이아웃', () => {
  it('GameHUD가 game-hud 클래스로 렌더링된다', () => {
    render(
      <GameHUD sidebarContent={<span>Sidebar</span>} />
    );
    const hud = screen.getByTestId('game-hud');
    expect(hud).toHaveClass('game-hud');
  });

  it('사이드바 영역이 game-hud__sidebar 클래스로 렌더링된다', () => {
    render(
      <GameHUD sidebarContent={<span>Sidebar</span>} />
    );
    const hud = screen.getByTestId('game-hud');
    const sidebar = hud.querySelector('.game-hud__sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('하단 액션바가 game-hud__bottom-bar 클래스로 렌더링된다', () => {
    render(
      <GameHUD bottomBarContent={<button>Actions</button>} />
    );
    const hud = screen.getByTestId('game-hud');
    const bottomBar = hud.querySelector('.game-hud__bottom-bar');
    expect(bottomBar).toBeInTheDocument();
  });

  it('모바일 정보바가 game-hud__mobile-info 클래스로 렌더링된다', () => {
    render(
      <GameHUD mobileInfoContent={<span>Info</span>} />
    );
    const hud = screen.getByTestId('game-hud');
    const mobileInfo = hud.querySelector('.game-hud__mobile-info');
    expect(mobileInfo).toBeInTheDocument();
  });

  it('sidebarContent가 없으면 사이드바 영역이 렌더링되지 않는다', () => {
    render(
      <GameHUD bottomBarContent={<button>Actions</button>} />
    );
    const hud = screen.getByTestId('game-hud');
    const sidebar = hud.querySelector('.game-hud__sidebar');
    expect(sidebar).not.toBeInTheDocument();
  });

  it('bottomBarContent가 없으면 하단 바 영역이 렌더링되지 않는다', () => {
    render(
      <GameHUD sidebarContent={<span>Sidebar</span>} />
    );
    const hud = screen.getByTestId('game-hud');
    const bottomBar = hud.querySelector('.game-hud__bottom-bar');
    expect(bottomBar).not.toBeInTheDocument();
  });

  it('mobileInfoContent가 없으면 모바일 정보바가 렌더링되지 않는다', () => {
    render(
      <GameHUD sidebarContent={<span>Sidebar</span>} />
    );
    const hud = screen.getByTestId('game-hud');
    const mobileInfo = hud.querySelector('.game-hud__mobile-info');
    expect(mobileInfo).not.toBeInTheDocument();
  });
});

// safe-area CSS 적용 확인 (CSS 존재 검증)
describe('safe-area CSS 적용 확인', () => {
  it('GameHUD.css에 safe-area-inset-bottom이 포함되어 있다', () => {
    const cssPath = path.resolve(__dirname, '../src/components/game/GameHUD.css');
    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain('safe-area-inset-bottom');
  });

  it('GameHUD.css에 모바일 브레이크포인트(430px) 미디어 쿼리가 포함되어 있다', () => {
    const cssPath = path.resolve(__dirname, '../src/components/game/GameHUD.css');
    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain('max-width: 430px');
  });

  it('GameHUD.css에 데스크톱 브레이크포인트(1024px) 미디어 쿼리가 포함되어 있다', () => {
    const cssPath = path.resolve(__dirname, '../src/components/game/GameHUD.css');
    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain('min-width: 1024px');
  });

  it('index.html에 viewport-fit=cover가 포함되어 있다', () => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toContain('viewport-fit=cover');
  });

  it('index.html에 user-scalable=yes가 포함되어 있다', () => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toContain('user-scalable=yes');
  });

  it('index.html에 prefers-reduced-motion 전역 규칙이 포함되어 있다', () => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toContain('prefers-reduced-motion');
  });

  it('index.html에 clamp() 폰트 크기가 포함되어 있다', () => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toContain('clamp(14px');
  });

  it('StartScreen.css에 safe-area-inset이 포함되어 있다', () => {
    const cssPath = path.resolve(__dirname, '../src/components/menu/StartScreen.css');
    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain('safe-area-inset');
  });

  it('ResultScreen.css에 safe-area-inset이 포함되어 있다', () => {
    const cssPath = path.resolve(__dirname, '../src/components/result/ResultScreen.css');
    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain('safe-area-inset');
  });
});
