import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MatchstickGame, { MatchstickEquation } from '../components/MatchstickGame';
import { createMatchstickBoard, moveMatchstick } from '../utils/matchstickRules';

describe('matchstick facilitator presentation', () => {
  it('renders real, labelled seven-segment digits and an operator that maps to the source buttons', () => {
    const markup = renderToStaticMarkup(<MatchstickGame onBack={() => undefined} />);
    expect(markup).toContain('data-matchstick-equation="true"');
    expect(markup).toContain('data-matchstick-segment="A1"');
    expect(markup).toContain('data-matchstick-segment="A7"');
    expect(markup).toContain('data-matchstick-segment="B2"');
    expect(markup).toContain('火柴 B2');
    expect(markup).toContain('加號・直棒');
    expect(markup).toContain('確認移動');
    expect(markup).toContain('入門');
    expect(markup).toContain('標準');
    expect(markup).toContain('挑戰');
    expect(markup).toContain('清除本次選取');
    expect(markup).toContain('min-h-11');
  });

  it('renders a move preview as changed physical segments with both source and destination highlighted', () => {
    const original = createMatchstickBoard('6+4=4');
    const move = { source: 'B2', target: 'A2' };
    const markup = renderToStaticMarkup(<MatchstickEquation board={moveMatchstick(original, move)!} originalBoard={original} selection={move} activeSlot="A" onSelectSlot={() => undefined} />);
    expect(markup).toContain('data-segment-state="removed"');
    expect(markup).toContain('data-segment-state="added"');
    expect(markup).toContain('aria-label="火柴算式 8-4=4"');
    expect(markup).toContain('等號不移動');
  });
});
