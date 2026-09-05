import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Roulette facilitator FULL acceptance', () => {
  it('protects the existing wheel content, scoring, and progression semantics', () => {
    const source = readFileSync('components/RouletteGame.tsx', 'utf8');

    expect(source).toContain('const STANDARD_ITEMS_NORMAL = [');
    expect(source).toContain('const STANDARD_ITEMS_ADVANCED = [');
    expect(source).toContain('const EVENT_ITEMS_NORMAL = [');
    expect(source).toContain('const EVENT_ITEMS_ADVANCED = [');
    for (const value of ['red', 'yellow', 'blue', 'green', 'dog', 'cat', 'pig', 'frog', 'fox', 'bear']) {
      expect(source).toContain(`id: '${value}'`);
    }
    for (const value of ['plus_10', 'minus_10', 'plus_20', 'bomb', 'swap', 'nothing']) {
      expect(source).toContain(`id: '${value}'`);
    }

    expect(source).toContain('useState(100)');
    expect(source).toContain('const amounts = [10, 20, 50];');
    expect(source).toContain("useState<'ROUNDS' | 'SCORE'>('ROUNDS')");
    expect(source).toContain('useState(10)');
    expect(source).toContain('useState(1)');
    expect(source).toContain('setTargetValue(10)');
    expect(source).toContain('setTargetValue(300)');
    expect(source).toContain('Math.max(gameMode === \'ROUNDS\' ? 1 : 100');
    expect(source).toContain('Math.min(gameMode === \'ROUNDS\' ? 50 : 2000');
    expect(source).toContain('setTeamAScore(100)');
    expect(source).toContain('setTeamBScore(100)');
    expect(source).toContain('if (!teamAChoice || !teamBChoice) return;');
    expect(source).toContain('const maxTicks = Math.floor(Math.random() * 20) + 40;');
    expect(source).toContain('if (ticks > maxTicks - 15) speed += 20;');
    expect(source).toContain('deltaA = teamAChoice.amount;');
    expect(source).toContain('deltaA = -teamAChoice.amount;');
    expect(source).toContain('deltaA = 10; deltaB = 10;');
    expect(source).toContain('deltaA = -10; deltaB = -10;');
    expect(source).toContain('deltaA = 20; deltaB = 20;');
    expect(source).toContain('deltaA = -20; deltaB = -20;');
    expect(source).toContain('newA = teamBScore;');
    expect(source).toContain('newB = teamAScore;');
    expect(source).toContain('setCurrentRound(r => r + 1);');
    expect(source).toContain("setGameState('GAMEOVER');");
    expect(source).toContain('clearTimeout(spinInterval.current);');
  });

  it('uses a dedicated fullscreen stage and direct three-column betting panels', () => {
    const source = readFileSync('components/RouletteGame.tsx', 'utf8');
    const css = readFileSync('index.css', 'utf8');

    for (const hook of [
      'data-roulette-root',
      'data-roulette-safe-stage',
      'data-roulette-layout',
      'data-roulette-header',
      'data-roulette-setup',
      'data-roulette-status',
      'data-roulette-team-a',
      'data-roulette-team-b',
      'data-roulette-center',
      'data-roulette-wheel',
      'data-roulette-spin',
      'data-roulette-event-guide',
      'data-roulette-gameover',
    ]) {
      expect(source).toContain(hook);
    }

    expect(source).toContain('app-safe-screen');
    expect(source).toContain('h-[100dvh]');
    expect(source).toContain('min-h-[100dvh]');
    expect(source).toContain('max-h-[100dvh]');
    expect(source).toContain('overflow-hidden');
    expect(source).not.toContain('GameShell');
    expect(source).not.toContain('landscape:min-w-[200px]');
    expect(source).not.toContain('landscape:w-32');
    expect(source).not.toContain('editingTeam');
    expect(source).not.toContain('BetEditor');
    expect(source).not.toContain('roulette-editor-layer');
    expect(source).not.toContain('roulette-bet-editor');
    expect(source).toContain('const [isEditing, setIsEditing] = useState(!choice);');
    expect(source).toContain('TeamBetPanel');
    expect(source).toMatch(/<TeamBetPanel\s+team="A"/);
    expect(source).toMatch(/<TeamBetPanel\s+team="B"/);
    expect(source).toContain('standardItems.map');
    expect(source).toContain('aria-pressed={draftItem === item.id}');
    expect(source).toContain('aria-pressed={draftAmount === amount}');
    expect(source).toContain('確認押注');
    expect(source).toContain('押注項目');
    expect(source).toContain('押注金額');
    expect(source).toContain('修改${team}組押注');
    expect(source).toContain('data-roulette-center');
    expect(source).toContain('data-roulette-action');

    expect(css).toContain('[data-roulette-root]');
    expect(css).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(css).toContain('[data-roulette-root] .roulette-landscape-columns');
    expect(css).toContain('[data-roulette-root] .roulette-center-column');
    expect(css).toContain('[data-roulette-root] .roulette-wheel-visual');
    expect(css).toContain('aspect-ratio: 1');
    expect(css).not.toContain('roulette-editor-');
    expect(css).toContain('overflow-x: auto');
  });

  it('keeps setup, wheel action, result, event guide, game-over, and accessibility contracts', () => {
    const source = readFileSync('components/RouletteGame.tsx', 'utf8');

    expect(source).toContain('aria-label="返回遊戲選單"');
    expect(source).toContain('aria-label="重新設定遊戲"');
    expect(source).toContain('data-roulette-spin');
    expect(source).toContain('開始旋轉！');
    expect(source).toContain('旋轉中...');
    expect(source).toContain('轉到了：');
    expect(source).toContain('下一回合');
    expect(source).toContain('查看結果');
    expect(source).toContain('轉盤也可能轉到以下事件');
    expect(source).toContain('遊戲結束！');
    expect(source).toContain('重新設定');
    expect(source).toContain('const [hasSpinStarted, setHasSpinStarted] = useState(false);');
    expect(source).toContain('setHasSpinStarted(true);');
    expect(source).toContain('setHasSpinStarted(false);');
    expect(source).toContain('等待旋轉');
    expect(source).toContain('準備旋轉');
    expect(source).toContain('hasSpinStarted ?');
    expect(source).toContain('min-h-11');
    expect(source).toContain('min-h-12');
    expect(source).toContain('whitespace-nowrap');
    expect(source).toContain('aria-label={`減少');
    expect(source).toContain('aria-label={`增加');
  });
});
