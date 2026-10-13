import { describe, expect, it } from 'vitest';
import { initialTrafficTier, TRAFFIC_JAM_PUZZLES } from '../data/trafficJamLevels';
import { analyzeTrafficSolution, trafficGeometrySignature, trafficTopologySignature } from '../utils/trafficJamAudit';
import { solveTrafficJam } from '../utils/trafficJamModel';

describe('expanded traffic curriculum', () => {
  it('opens the actual standard and challenge tiers from the two menu choices', () => {
    expect(initialTrafficTier('NORMAL')).toBe('STANDARD');
    expect(initialTrafficTier('ADVANCED')).toBe('CHALLENGE');
  });
  it.each(['BEGINNER', 'STANDARD', 'CHALLENGE'] as const)('%s offers at least twelve curated boards', tier => {
    expect(TRAFFIC_JAM_PUZZLES.filter(level => level.tier === tier).length).toBeGreaterThanOrEqual(12);
  });
  it('rejects renamed, recolored or geometrically mirrored copies from the full bank', () => {
    const keys = TRAFFIC_JAM_PUZZLES.map(level => trafficGeometrySignature(level.cars));
    expect(new Set(keys).size).toBe(keys.length);
    const topologies = TRAFFIC_JAM_PUZZLES.map(level => trafficTopologySignature(level.cars));
    expect(new Set(topologies).size).toBe(topologies.length);
  });
  it.each(TRAFFIC_JAM_PUZZLES.filter(level => level.tier !== 'BEGINNER'))('$id has a verified planning challenge and honest structural metrics', level => {
    expect(level.minimumMoves).toBeGreaterThanOrEqual(level.tier === 'STANDARD' ? 8 : 15);
    expect(level.minimumMoves).toBeLessThanOrEqual(level.tier === 'STANDARD' ? 14 : 25);
    const measured = analyzeTrafficSolution(level.cars, level.solution);
    expect(measured).toEqual(level.metrics);
    expect(measured.participatingCars).toBe(level.cars.length);
    expect(measured.dependencyDepth).toBeGreaterThanOrEqual(2);
    if (level.tier === 'CHALLENGE') {
      expect(measured.reversalsInSolution).toBeGreaterThanOrEqual(2);
      expect(solveTrafficJam(level.cars, { forbidDirectionChanges: true }).status).toBe('UNSOLVABLE');
    }
  });
});
