// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FacilitatedGameFrame, { FacilitatedModeSelector } from '../components/game-ui/FacilitatedGameFrame';

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });
const click = (element: Element | null) => {
  if (!element) throw new Error('Expected visible control');
  act(() => { element.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
const button = (label: string) => host.querySelector(`button[aria-label="${label}"]`);
const byText = (text: string) => [...host.querySelectorAll('button')].find(item => item.textContent === text) ?? null;
const renderFrame = (props: Record<string, unknown> = {}) => {
  const callbacks = { onBack: vi.fn(), onModeChange: vi.fn(), onReset: vi.fn(), onUndo: vi.fn(), onHint: vi.fn() };
  act(() => root.render(
    <FacilitatedGameFrame title="測試活動" subtitle="目前目標" mode="COOP" rules={['說明']}
      recentAction="已選 B2" canUndo={true} hasProgress={true} {...callbacks} {...props}>
      <div>完整盤面</div>
    </FacilitatedGameFrame>,
  ));
  return callbacks;
};

describe('facilitator action safety', () => {
  it('treats tapping the already selected activity mode as a no-op', () => {
    const onChange = vi.fn();
    act(() => root.render(<FacilitatedModeSelector value="COOP" onChange={onChange} />));
    click(byText('全體合作'));
    expect(onChange).not.toHaveBeenCalled();
    click(byText('A／B 分組'));
    expect(onChange).toHaveBeenCalledWith('TEAMS');
  });
  it('keeps progress when reset is canceled and only resets after confirmation', () => {
    const callbacks = renderFrame();
    click(button('重新開始'));
    expect(callbacks.onReset).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull();
    click(byText('繼續活動'));
    expect(callbacks.onReset).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alertdialog"]')).toBeNull();
    click(button('重新開始'));
    click(byText('確認繼續'));
    expect(callbacks.onReset).toHaveBeenCalledTimes(1);
  });
  it('does not add a confirmation when no progress exists', () => {
    const callbacks = renderFrame({ hasProgress: false, canUndo: false });
    click(button('重新開始'));
    expect(callbacks.onReset).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[role="alertdialog"]')).toBeNull();
  });
  it('labels leaving the game explicitly without changing reset or mode wording', () => {
    const callbacks = renderFrame();
    click(button('返回遊戲目錄'));
    expect(byText('確認離開')).not.toBeNull();
    expect(byText('確認繼續')).toBeNull();
    click(byText('確認離開'));
    expect(callbacks.onBack).toHaveBeenCalledTimes(1);
    click(button('重新開始'));
    expect(byText('確認繼續')).not.toBeNull();
  });
  it('guards back and changing to a different mode', () => {
    const callbacks = renderFrame();
    click(button('返回遊戲目錄'));
    expect(callbacks.onBack).not.toHaveBeenCalled();
    click(byText('繼續活動'));
    click(byText('A／B 分組'));
    expect(callbacks.onModeChange).not.toHaveBeenCalled();
    click(byText('確認繼續'));
    expect(callbacks.onModeChange).toHaveBeenCalledExactlyOnceWith('TEAMS');
  });
  it('runs a confirmed destructive action only once even on repeated taps', () => {
    const callbacks = renderFrame();
    click(button('重新開始'));
    const confirm = byText('確認繼續');
    expect(confirm).not.toBeNull();
    act(() => {
      confirm!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      confirm!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(callbacks.onReset).toHaveBeenCalledTimes(1);
  });
  it('cancels with Escape, initially focuses cancel and restores the opener', () => {
    const callbacks = renderFrame();
    const reset = button('重新開始') as HTMLButtonElement;
    reset.focus();
    click(reset);
    expect(document.activeElement).toBe(byText('繼續活動'));
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(callbacks.onReset).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alertdialog"]')).toBeNull();
    expect(document.activeElement).toBe(reset);
  });
  it('keeps keyboard focus within the confirmation dialog', () => {
    renderFrame();
    click(button('重新開始'));
    const cancel = byText('繼續活動') as HTMLButtonElement;
    const confirm = byText('確認繼續') as HTMLButtonElement;
    expect(cancel).not.toBeNull();
    cancel.focus();
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })));
    expect(document.activeElement).toBe(confirm);
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })));
    expect(document.activeElement).toBe(cancel);
  });
});

describe('facilitator compact slots', () => {
  it('puts frequent controls outside the scrollable supporting information', () => {
    renderFrame({ controls: <button>確認移動</button>, settings: <div>本地三階</div>, sidebar: <p>長題目</p> });
    const controls = host.querySelector('[data-facilitated-controls]');
    const details = host.querySelector('[data-facilitated-details]');
    expect(controls?.textContent).toContain('確認移動');
    expect(details?.textContent).toContain('長題目');
    expect(details?.contains(controls)).toBe(false);
    const turnStatus = host.querySelector('[data-facilitated-turn-status]');
    expect(turnStatus?.textContent).toContain('已選 B2');
    expect(details?.contains(turnStatus)).toBe(false);
  });
  it('bounds long status text and keeps completion feedback inside supporting details', () => {
    renderFrame({ controls: <button>確認執行</button>, recentAction: '完整提示'.repeat(60), feedback: '完成本題' });
    const status = host.querySelector('[data-facilitated-turn-status]');
    expect(status?.classList.contains('max-h-16')).toBe(true);
    expect(status?.classList.contains('overflow-y-auto')).toBe(true);
    expect(status?.textContent).toContain('完整提示'.repeat(60));
    expect(host.querySelector('[data-layout-region="feedback"]')).toBeNull();
    expect(host.querySelector('[data-facilitated-details]')?.textContent).toContain('完成本題');
  });

  it('starts optional settings collapsed, while preserving legacy mode controls', () => {
    renderFrame({ settings: <div>本地三階</div> });
    const settings = host.querySelector('details[data-facilitated-settings]');
    expect(settings).not.toBeNull();
    expect(settings?.hasAttribute('open')).toBe(false);
    expect(byText('全體合作')).not.toBeNull();
  });
});
