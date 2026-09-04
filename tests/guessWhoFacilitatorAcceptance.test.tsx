import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import GuessWhoGame from '../components/GuessWhoGame';

describe('Guess Who facilitator LIGHT acceptance', () => {
  it('keeps all candidates available with responsive short-landscape geometry', () => {
    const normalMarkup = renderToStaticMarkup(<GuessWhoGame onBack={() => undefined} />);
    const advancedMarkup = renderToStaticMarkup(<GuessWhoGame onBack={() => undefined} isAdvanced />);
    const source = readFileSync('components/GuessWhoGame.tsx', 'utf8');
    const css = readFileSync('index.css', 'utf8');

    expect((normalMarkup.match(/viewBox="0 0 100 100"/g) ?? [])).toHaveLength(8);
    expect((advancedMarkup.match(/viewBox="0 0 100 100"/g) ?? [])).toHaveLength(12);
    expect(source).toContain('CHARACTERS.slice(0, numCards)');
    expect(source).toContain('const numCards = isAdvanced ? 12 : 8');
    expect(source).toContain('data-guess-who-root');
    expect(source).toContain('data-guess-who-board');
    expect(source).toContain('data-guess-who-grid');
    expect(source).toContain('data-guess-who-support');
    expect(source).toContain('data-guess-who-questions');
    expect(source).toContain('data-guess-who-history');
    expect(source).toContain('data-guess-who-mode={isAdvanced ? \'ADVANCED\' : \'NORMAL\'}');
    expect(source).toContain('app-safe-screen');
    expect(source).toContain('h-[100dvh]');
    expect(source).toContain('max-h-[100dvh]');
    expect(source).toContain('overflow-hidden');
    expect(source).not.toContain('GameShell');
    expect(source).not.toContain('sm:grid-cols-6');
    expect(source).toContain('aria-label="返回遊戲選單"');
    expect(source).toContain('aria-label="查看遊戲規則"');
    expect(source).toContain("aria-label={isWin ? '下一局' : '重新開始'}");
    expect(source).toContain('min-h-11 min-w-11');
    expect(source).toContain('min-h-11');

    expect(css).toContain('@media (orientation: landscape) and (max-height: 480px)');
    expect(css).toContain('.guess-who-root');
    expect(css).toContain('.guess-who-grid');
    expect(css).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))');
    expect(css).toContain('grid-template-columns: repeat(6, minmax(0, 1fr))');
    expect(css).toContain('min-width: 760px');
    expect(css).toContain('.guess-who-questions');
    expect(css).toContain('overflow-y: auto');
    expect(css).not.toContain('max-width: 480px');
  });

  it('preserves question, elimination, scoring, reset, and win semantics', () => {
    const source = readFileSync('components/GuessWhoGame.tsx', 'utf8');

    expect(source).toContain('QUESTIONS.find(x => x.id === qId)');
    expect(source).toContain('history.some(h => h.question === q.text)');
    expect(source).toContain('setHistory(prev => [{ question: q.text, answer }, ...prev])');
    expect(source).toContain('setWrongGuesses(prev => prev + 1)');
    expect(source).toContain('isEliminated: true');
    expect(source).toContain('setIsWin(true)');
    expect(source).toContain('Math.max(10, 100 - (history.length * 5) - (wrongGuesses * 10))');
    expect(source).toContain('setHistory([])');
    expect(source).toContain('setWrongGuesses(0)');
    expect(source).toContain('setScore(100)');
    expect(source).toContain('soundService.playTone(answer ? 600 : 400, \'sine\', 0.1)');
    expect(source).toContain('soundService.playWin()');
    expect(source).toContain('soundService.playWrong()');
    expect(source).toContain('答對了！得分：{score}');
    expect(source).toContain('QUESTIONS.map');
  });

  it('uses a separate safe stage and reflows questions below candidates with history on the right', () => {
    const source = readFileSync('components/GuessWhoGame.tsx', 'utf8');
    const css = readFileSync('index.css', 'utf8');
    const boardIndex = source.indexOf('data-guess-who-board');
    const questionsIndex = source.indexOf('data-guess-who-questions');
    const supportIndex = source.indexOf('data-guess-who-support');
    const historyIndex = source.indexOf('data-guess-who-history');

    expect(source).toContain('data-guess-who-safe-stage');
    expect(source).toContain('data-guess-who-layout');
    expect(source).toContain('data-guess-who-header');
    expect(source).toMatch(/data-guess-who-safe-stage[^>]*className="app-safe-screen[^"p]*"/);
    expect(source).not.toMatch(/data-guess-who-root[^>]*app-safe-screen/);
    expect(source).not.toContain('guess-who-back absolute');
    expect(source).not.toContain('absolute top-2 left-2');
    expect(source).not.toContain('padding-left: 2.75rem');
    expect(source).toContain('data-guess-who-header');
    expect(source).toContain('aria-label="返回遊戲選單"');
    expect(source).toContain('aria-label="查看遊戲規則"');
    expect(source).toContain('aria-label={isWin ? \'下一局\' : \'重新開始\'}');
    expect(source).toContain('人物下方發問區');
    expect(source).toContain('overflow-x-auto');
    expect(source).toContain('data-guess-who-history');
    expect(source).toMatch(/className="guess-who-history[^"\n]*flex-1[^"\n]*overflow-y-auto/);
    expect(source).not.toContain('guess-who-board flex-1 min-w-0 min-h-0 bg-white p-4 rounded-2xl shadow-md border border-blue-100 overflow-y-auto');
    expect(boardIndex).toBeGreaterThan(-1);
    expect(questionsIndex).toBeGreaterThan(boardIndex);
    expect(supportIndex).toBeGreaterThan(questionsIndex);
    expect(historyIndex).toBeGreaterThan(supportIndex);

    expect(css).toContain('@media (orientation: landscape) and (max-height: 480px) and (max-width: 759px)');
    expect(css).toContain('@media (orientation: landscape) and (max-height: 480px) and (min-width: 760px)');
    expect(css).not.toMatch(/\.guess-who-root\s*\{[^}]*padding\s*:/s);
    expect(css).not.toContain('.guess-who-back {');
    expect(css).not.toContain('.guess-who-board-header {');
  });
});
