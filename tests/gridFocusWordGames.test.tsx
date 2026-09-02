import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SentenceRoundView } from '../components/SentenceGame';
import { WordTileRoundView } from '../components/WordTileGame';

describe('grid-focus word games', () => {
  it('keeps the idiom answer slots and available characters in separate regions', () => {
    const markup = renderToStaticMarkup(
      <WordTileRoundView
        currentIdiom={{ word: '一心一意', origin: '《三國志》', meaning: '心思專一。' }}
        isAdvanced={false}
        roundIndex={1}
        totalScore={30}
        placed={['一', null, null, null]}
        options={['', '心', '一', '意']}
        isWin={false}
        hasGuessed={false}
        time={4}
        onBack={() => undefined}
        onShowRules={() => undefined}
        onRemovePlaced={() => undefined}
        onSelectOption={() => undefined}
        onNextRound={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('aria-label="成語排列區"');
    expect(markup).toContain('aria-label="待選文字區"');
    expect(markup).toContain('第 2/10 題');
    expect(markup).toContain('心');
    expect(markup).toContain('意');
  });

  it('keeps sentence error feedback outside both word regions', () => {
    const markup = renderToStaticMarkup(
      <SentenceRoundView
        difficulty="ADVANCED"
        round={3}
        totalScore={45}
        userAnswer={[{ id: '0-我', text: '我' }]}
        availableWords={[{ id: '1-今天', text: '今天' }]}
        isCorrect={false}
        showError
        onBack={() => undefined}
        onSkip={() => undefined}
        onSelectWord={() => undefined}
        onDeselectWord={() => undefined}
        onShowAnswer={() => undefined}
        onReset={() => undefined}
        onCheckAnswer={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('aria-label="句子排列區"');
    expect(markup).toContain('aria-label="待選詞語區"');
    expect(markup).toContain('順序不對喔，再試試看！');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('進階');
  });

  it('explains how to revise an idiom after every character has been placed', () => {
    const markup = renderToStaticMarkup(
      <WordTileRoundView
        currentIdiom={{ word: '一心一意', origin: '《三國志》', meaning: '心思專一。' }}
        isAdvanced={false}
        roundIndex={0}
        totalScore={0}
        placed={['意', '一', '心', '一']}
        options={['', '', '', '']}
        isWin={false}
        hasGuessed
        time={8}
        onBack={() => undefined}
        onShowRules={() => undefined}
        onRemovePlaced={() => undefined}
        onSelectOption={() => undefined}
        onNextRound={() => undefined}
      />,
    );

    expect(markup).toContain('文字已全部放入');
    expect(markup).toContain('點擊左側文字可取回調整');
  });
});
