import type { QwirkleColor, QwirkleShape, QwirklePlacedTile, QwirklePuzzle, QwirkleTileData } from '../utils/qwirkleRules';
const tile = (id: string, color: QwirkleColor, shape: QwirkleShape): QwirkleTileData => ({ id, color, shape });
const at = (x: number, y: number, color: QwirkleColor, shape: QwirkleShape): QwirklePlacedTile => ({ x, y, tile: tile(`board-${x}-${y}`, color, shape) });
/** Small curated puzzles. Tests enumerate every legal answer and every two-step continuation. */
export const QWIRKLE_PUZZLES: QwirklePuzzle[] = [
  {
    id: 'warm-color', tier: 'BEGINNER', title: '同色，不重複形狀', prompt: '選一顆棋放到 P，延長紅色連線。先說出哪個形狀還沒出現。',
    board: [at(0, 0, 'red', 'circle'), at(1, 0, 'red', 'square'), at(2, 0, 'red', 'clover')],
    targets: [{ id: 'P', x: 3, y: 0 }],
    hand: [tile('1', 'red', 'star'), tile('2', 'blue', 'star'), tile('3', 'red', 'circle'), tile('4', 'green', 'diamond')],
    hints: ['這條線共同的是顏色；每顆形狀需要不同。', '檢查紅色候選：圓形已經出現過。'],
  },
  {
    id: 'warm-shape', tier: 'BEGINNER', title: '同形，不重複顏色', prompt: '選一顆棋放到 P，延長星星連線。先檢查顏色有沒有重複。',
    board: [at(0, 0, 'blue', 'star'), at(1, 0, 'yellow', 'star'), at(2, 0, 'green', 'star')],
    targets: [{ id: 'P', x: 3, y: 0 }],
    hand: [tile('1', 'blue', 'star'), tile('2', 'red', 'circle'), tile('3', 'purple', 'star'), tile('4', 'yellow', 'cross')],
    hints: ['這條線固定星星；需要一種還沒出現的顏色。', '藍色已在桌上。另一顆星星是什麼顏色？'],
  },
  {
    id: 'warm-six', tier: 'BEGINNER', title: '補齊六種形狀', prompt: '黃色已有五種形狀。選一顆放到 P，完成六顆連線。',
    board: [at(0, 0, 'yellow', 'circle'), at(1, 0, 'yellow', 'square'), at(2, 0, 'yellow', 'diamond'), at(3, 0, 'yellow', 'star'), at(4, 0, 'yellow', 'cross')],
    targets: [{ id: 'P', x: 5, y: 0 }],
    hand: [tile('1', 'purple', 'clover'), tile('2', 'yellow', 'star'), tile('3', 'yellow', 'circle'), tile('4', 'yellow', 'clover')],
    hints: ['顏色不變，六種形狀各用一次。', '逐一核對圓、方、菱、星、十字，還缺哪個？'],
  },
  {
    id: 'cross-corner', tier: 'STANDARD', title: '兩條線一起看', prompt: '選棋子和落點，同時形成橫線與直線。只延長一條線還沒達成本題目標。',
    board: [at(0, 0, 'blue', 'circle'), at(0, 1, 'red', 'circle'), at(1, 0, 'blue', 'square')],
    targets: [{ id: 'P', x: 1, y: 1 }, { id: 'Q', x: 2, y: 0 }],
    hand: [tile('1', 'red', 'star'), tile('2', 'red', 'square'), tile('3', 'blue', 'star'), tile('4', 'blue', 'square')],
    hints: ['先找哪個落點旁邊和上方都已有棋。', '橫線需要紅色，直線需要正方形；也不能重複。'],
  },
  {
    id: 'cross-gap', tier: 'STANDARD', title: '補洞也檢查直線', prompt: '選棋子和落點，讓橫向與直向都連成合法線。空格兩邊都要檢查。',
    board: [at(0, 0, 'red', 'circle'), at(1, 0, 'red', 'square'), at(2, 0, 'red', 'star'), at(0, 1, 'blue', 'circle'), at(2, 1, 'blue', 'star')],
    targets: [{ id: 'P', x: 3, y: 0 }, { id: 'Q', x: 1, y: 1 }],
    hand: [tile('1', 'blue', 'clover'), tile('2', 'red', 'clover'), tile('3', 'blue', 'square'), tile('4', 'yellow', 'star')],
    hints: ['找同時接觸橫線和直線的空格。', '左右都是藍色；上方是正方形。'],
  },
  {
    id: 'cross-three', tier: 'STANDARD', title: '上下左右都核對', prompt: '選棋子和落點，同時連接橫線和直線；上下顏色也不能重複。',
    board: [at(0, 0, 'yellow', 'cross'), at(1, 0, 'yellow', 'circle'), at(0, 1, 'blue', 'cross'), at(0, 2, 'green', 'cross'), at(1, 2, 'green', 'circle')],
    targets: [{ id: 'P', x: 1, y: 1 }, { id: 'Q', x: 2, y: 2 }],
    hand: [tile('1', 'yellow', 'circle'), tile('2', 'green', 'star'), tile('3', 'blue', 'square'), tile('4', 'blue', 'circle')],
    hints: ['中間落點可以同時看左邊、上面和下面。', '直線固定圓形、已有黃與綠；橫線固定藍色。'],
  },
  {
    id: 'plan-corner', tier: 'CHALLENGE', title: '替下一顆留路', prompt: '先從手牌選一顆，再放公開的藍色正方形。只用 P、Q、R；兩步都要有地方放，再比較總棋分。',
    board: [at(0, 0, 'blue', 'circle'), at(0, 1, 'red', 'circle'), at(1, 0, 'blue', 'square')],
    targets: [{ id: 'P', x: 1, y: 1 }, { id: 'Q', x: 2, y: 0 }, { id: 'R', x: 2, y: 1 }],
    hand: [tile('1', 'red', 'square'), tile('2', 'blue', 'star'), tile('3', 'red', 'circle'), tile('4', 'yellow', 'cross')],
    nextTile: tile('next', 'blue', 'square'),
    hints: ['先想藍色正方形第二步能接在哪裡；眼前分數最高不一定能走完。', '桌上已有藍色正方形。比較先放 P 或先放 Q，哪一條新線能接第二顆？'],
  },
  {
    id: 'plan-gap', tier: 'CHALLENGE', title: '先補洞或先延伸', prompt: '先選一顆，再放公開的藍色四葉草。只用 P、Q、R，找兩步棋分總和最高的合法方案。',
    board: [at(0, 0, 'red', 'circle'), at(1, 0, 'red', 'square'), at(2, 0, 'red', 'star'), at(0, 1, 'blue', 'circle'), at(2, 1, 'blue', 'star')],
    targets: [{ id: 'P', x: 1, y: 1 }, { id: 'Q', x: 3, y: 0 }, { id: 'R', x: 3, y: 1 }],
    hand: [tile('1', 'red', 'clover'), tile('2', 'blue', 'square'), tile('3', 'green', 'diamond'), tile('4', 'blue', 'circle')],
    nextTile: tile('next', 'blue', 'clover'),
    hints: ['兩步都合法還不夠，請把兩次棋分加起來比較。', '補中間的洞會延長下方整條線；也看看先延伸上方會發生什麼。'],
  },
  {
    id: 'plan-branch', tier: 'CHALLENGE', title: '看兩步，不只眼前', prompt: '先選一顆，再放公開的綠色菱形。只用 P、Q、R、S，比較兩步棋分總和最高的方案。',
    board: [at(0, 0, 'orange', 'circle'), at(1, 0, 'orange', 'square'), at(0, 1, 'green', 'circle'), at(0, 2, 'purple', 'circle')],
    targets: [{ id: 'P', x: 1, y: 1 }, { id: 'Q', x: 1, y: 2 }, { id: 'R', x: 2, y: 1 }, { id: 'S', x: 2, y: 0 }],
    hand: [tile('1', 'purple', 'square'), tile('2', 'green', 'circle'), tile('3', 'green', 'square'), tile('4', 'orange', 'diamond')],
    nextTile: tile('next', 'green', 'diamond'),
    hints: ['先想綠色菱形能加入哪一條線，再比較第一顆的位置。', '同一顆正方形放不同位置，是否會擋住或連接下一顆？'],
  },
];
