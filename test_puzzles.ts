import { GoBoard, createEmptyBoard, playGoMove, getGroupAndLiberties } from './services/goEngine';

function parse(str: string[]): GoBoard {
  return str.map(row => row.split('').map(c => c === 'B' ? 'BLACK' : c === 'W' ? 'WHITE' : 'EMPTY'));
}

function printBoard(b: GoBoard) {
  console.log(b.map(r => r.map(c => c === 'BLACK' ? '●' : c === 'WHITE' ? '○' : '.').join(' ')).join('\n'));
}

console.log('Testing puzzle test harness...');
