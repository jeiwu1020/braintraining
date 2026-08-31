import { Difficulty } from '../types';

export interface MastermindConfig {
  codeLength: number;
  colors: string[];
}

const NORMAL_CONFIG: MastermindConfig = {
  codeLength: 3,
  colors: ['bg-red-500', 'bg-blue-500', 'bg-green-500'],
};

const ADVANCED_CONFIG: MastermindConfig = {
  codeLength: 4,
  colors: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'],
};

export const getMastermindConfig = (difficulty: Difficulty): MastermindConfig =>
  difficulty === 'ADVANCED' ? ADVANCED_CONFIG : NORMAL_CONFIG;
