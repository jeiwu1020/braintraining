import { describe, expect, it } from 'vitest';
import { getMastermindConfig } from '../services/mastermind';

describe('Mastermind difficulty configuration', () => {
  it('gives normal mode a three-slot code with three available colors', () => {
    const config = getMastermindConfig('NORMAL');

    expect(config.codeLength).toBe(3);
    expect(config.colors).toHaveLength(3);
  });

  it('keeps advanced mode at the former normal four-slot, four-color challenge', () => {
    const config = getMastermindConfig('ADVANCED');

    expect(config.codeLength).toBe(4);
    expect(config.colors).toHaveLength(4);
  });
});
