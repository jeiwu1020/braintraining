import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EmotionRoundView } from '../components/EmotionGame';
import { SocialContextRoundView } from '../components/SocialContextGame';
import { StepsRoundView } from '../components/StepsGame';
import { TimeRoundView } from '../components/TimeGame';

describe('split-choice game screens', () => {
  it('keeps the time question and answers in the shared landscape regions', () => {
    const markup = renderToStaticMarkup(
      <TimeRoundView
        level={{
          type: 'CLOCK',
          question: '時鐘顯示幾點？',
          clockTime: { hour: 3, minute: 30 },
          options: ['3:30', '6:15', '9:00'],
          correctAnswer: '3:30',
        }}
        difficulty="NORMAL"
        round={2}
        score={10}
        feedback={null}
        selectedOption={null}
        onBack={() => undefined}
        onOptionClick={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="split-choice"');
    expect(markup).toContain('aria-label="時間題目區"');
    expect(markup).toContain('aria-label="時間作答區"');
    expect(markup).toContain('時鐘顯示幾點？');
    expect(markup).toContain('3:30');
    expect(markup).toContain('第 2/10 題');
  });

  it('announces emotion feedback without replacing the question or choices', () => {
    const markup = renderToStaticMarkup(
      <EmotionRoundView
        level={{
          question: '朋友收到禮物時可能有什麼感受？',
          emoji: '🎁',
          options: ['開心', '生氣', '害怕'],
          correctAnswer: '開心',
        }}
        difficulty="ADVANCED"
        round={4}
        score={25}
        feedback="wrong"
        wrongOption="生氣"
        feedbackMessage="再想想看！"
        onBack={() => undefined}
        onOptionClick={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="split-choice"');
    expect(markup).toContain('aria-label="情緒題目區"');
    expect(markup).toContain('aria-label="情緒作答區"');
    expect(markup).toContain('朋友收到禮物時可能有什麼感受？');
    expect(markup).toContain('開心');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('再想想看！');
  });

  it('keeps the ordered steps and remaining choices in separate accessible regions', () => {
    const markup = renderToStaticMarkup(
      <StepsRoundView
        level={{
          title: '泡一杯茶',
          steps: [
            { id: 'boil', text: '把水煮開', order: 1 },
            { id: 'pour', text: '把熱水倒進杯子', order: 2 },
          ],
        }}
        difficulty="NORMAL"
        round={3}
        score={40}
        availableSteps={[{ id: 'pour', text: '把熱水倒進杯子', order: 2 }]}
        userOrder={[{ id: 'boil', text: '把水煮開', order: 1 }]}
        isCorrect={false}
        showError={false}
        onBack={() => undefined}
        onSkip={() => undefined}
        onSelectStep={() => undefined}
        onDeselectStep={() => undefined}
        onReset={() => undefined}
        onShowAnswer={() => undefined}
        onCheck={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="split-choice"');
    expect(markup).toContain('aria-label="步驟排列區"');
    expect(markup).toContain('aria-label="待選步驟區"');
    expect(markup).toContain('泡一杯茶');
    expect(markup).toContain('把水煮開');
    expect(markup).toContain('把熱水倒進杯子');
  });

  it('keeps social feedback and the next action inside the answer region', () => {
    const markup = renderToStaticMarkup(
      <SocialContextRoundView
        scenario={{
          id: 1,
          title: '在餐廳',
          description: '服務生不小心把水灑到桌上並向你道歉。',
          options: [
            { text: '大聲責罵', isCorrect: false, feedback: '這會讓氣氛更緊張。' },
            { text: '請他協助擦乾', isCorrect: true, feedback: '這是有禮貌且能解決問題的回應。' },
          ],
        }}
        difficulty="ADVANCED"
        currentIndex={1}
        total={10}
        selectedOption={0}
        showFeedback
        showOptions
        isLast={false}
        onBack={() => undefined}
        onShowOptions={() => undefined}
        onOptionSelect={() => undefined}
        onNext={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="split-choice"');
    expect(markup).toContain('aria-label="社交情境題目區"');
    expect(markup).toContain('aria-label="社交情境作答區"');
    expect(markup).toContain('這會讓氣氛更緊張。');
    expect(markup).toContain('這是有禮貌且能解決問題的回應。');
    expect(markup).toContain('下一題');
    expect(markup).toContain('role="status"');
  });
});
