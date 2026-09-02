import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HazardRoundView } from '../components/HazardIdentificationGame';
import { RevealPictureRoundView } from '../components/RevealPictureGame';

describe('grid-focus visual and safety games', () => {
  it('keeps the covered picture and answer controls in separate regions', () => {
    const markup = renderToStaticMarkup(
      <RevealPictureRoundView
        target={{ emoji: '🐘', name: '大象' }}
        isAdvanced={false}
        roundIndex={2}
        totalScore={80}
        gridSize={3}
        revealed={[true, false, false, false, false, false, false, false, false]}
        isPeek
        isDone={false}
        score={0}
        onBack={() => undefined}
        onShowRules={() => undefined}
        onTileClick={() => undefined}
        onRevealAll={() => undefined}
        onGuess={() => undefined}
        onNextRound={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('aria-label="隱藏圖片格線"');
    expect(markup).toContain('aria-label="答案判斷區"');
    expect(markup).toContain('大象');
    expect(markup).toContain('答對');
    expect(markup).toContain('答錯');
    expect(markup).toContain('已翻開 1/9 塊');
  });

  it('shows the latest safety explanation beside the compact option grid', () => {
    const markup = renderToStaticMarkup(
      <HazardRoundView
        scene={{
          id: 1,
          title: '廚房煮飯',
          context: '瓦斯爐正在煮湯。',
          items: [
            { text: '打開抽油煙機', isHazard: false, explanation: '保持通風是好習慣。' },
            { text: '離開廚房聊天', isHazard: true, explanation: '瓦斯爐開著不能離開視線。' },
          ],
        }}
        difficulty="ADVANCED"
        currentIndex={3}
        totalScenes={10}
        revealedItems={[1]}
        isLast={false}
        onBack={() => undefined}
        onItemClick={() => undefined}
        onNext={() => undefined}
      />,
    );

    expect(markup).toContain('data-layout="mobile-landscape-game"');
    expect(markup).toContain('data-layout-preset="grid-focus"');
    expect(markup).toContain('aria-label="安全情境選項區"');
    expect(markup).toContain('aria-label="安全判斷說明區"');
    expect(markup).toContain('瓦斯爐正在煮湯。');
    expect(markup).toContain('危險行為');
    expect(markup).toContain('瓦斯爐開著不能離開視線。');
    expect(markup).toContain('進階');
  });
});
