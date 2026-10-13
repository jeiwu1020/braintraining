import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TrafficJamGame from '../components/TrafficJamGame';
import { TRAFFIC_JAM_PUZZLES } from '../data/trafficJamLevels';

describe('traffic whole-car facilitator interface', () => {
  it('renders one complete button per car, clear coordinates and a dedicated exit', () => {
    const markup = renderToStaticMarkup(<TrafficJamGame onBack={() => undefined} />);
    expect(markup.match(/data-traffic-car="/g)).toHaveLength(TRAFFIC_JAM_PUZZLES.find(level => level.tier === 'STANDARD')!.cars.length);
    expect(markup).toContain('aria-label="A1"');
    expect(markup).toContain('data-coordinate-grid="true"');
    expect(markup).toContain('aria-label="第 3 列右側出口"');
    expect(markup).toContain('grid-column:');
  });
  it('requires a complete preview and explicit confirmation, with whole-move counting', () => {
    const markup = renderToStaticMarkup(<TrafficJamGame onBack={() => undefined} />);
    expect(markup).toContain('aria-label="移動方向"');
    expect(markup).toContain('aria-label="移動格數"');
    expect(markup).toContain('確認整步');
    expect(markup).toContain('策略步數');
    expect(markup).toContain('整句口述');
  });
  it('maps the global advanced entrance to challenge while retaining a three-tier selector', () => {
    const markup = renderToStaticMarkup(<TrafficJamGame difficulty="ADVANCED" onBack={() => undefined} />);
    expect(markup).toContain('標準');
    expect(markup).toContain('入門');
    expect(markup).toContain('挑戰');
    expect(markup).toContain('6×6 · 挑戰 1/12');
    expect(markup).toContain(TRAFFIC_JAM_PUZZLES.find(level => level.tier === 'CHALLENGE')!.title);
    expect(markup.match(/data-traffic-car="/g)).toHaveLength(TRAFFIC_JAM_PUZZLES.find(level => level.tier === 'CHALLENGE')!.cars.length);
  });
});
