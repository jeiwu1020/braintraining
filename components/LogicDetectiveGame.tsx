import React, { useState } from 'react';
import type { Difficulty } from '../types';
import { advanceTeam, applyLogicMark, awardTeam, coordinateLabel, isLogicGridSolved, type LogicConstraint, type LogicMark } from '../utils/facilitatedPuzzleRules';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }
interface LogicPuzzle { title: string; people: readonly string[]; choices: readonly string[]; solution: readonly number[]; clues: readonly string[]; constraints: readonly LogicConstraint[] }

const makePuzzle = (title: string, people: string[], choices: string[], solution: number[], advanced = false): LogicPuzzle => {
  const startPerson = [...title].reduce((sum, character) => sum + character.charCodeAt(0), 0) % people.length;
  const deductionOrder = Array.from({ length: people.length }, (_, index) => (startPerson + index) % people.length);
  const [first, second, third, last] = deductionOrder;
  const constraints: LogicConstraint[] = advanced
    ? [
        ...choices.flatMap((_, choice) => choice === solution[first] ? [] : [{ person: first, choice, relation: 'NOT' as const }]),
        { person: second, choice: solution[third], relation: 'NOT' },
        { person: second, choice: solution[last], relation: 'NOT' },
        { person: third, choice: solution[last], relation: 'NOT' },
      ]
    : [
        ...choices.flatMap((_, choice) => choice === solution[first] ? [] : [{ person: first, choice, relation: 'NOT' as const }]),
        { person: second, choice: solution[third], relation: 'NOT' },
      ];
  return {
    title, people, choices, solution,
    clues: constraints.map((constraint, index) => index % 3 === 0
      ? `${people[constraint.person]}沒有選「${choices[constraint.choice]}」。`
      : index % 3 === 1
        ? `選「${choices[constraint.choice]}」的人不是${people[constraint.person]}。`
        : `${people[constraint.person]}與「${choices[constraint.choice]}」不相配。`),
    constraints,
  };
};

export const LOGIC_DETECTIVE_PUZZLES: Record<Difficulty, readonly LogicPuzzle[]> = {
  NORMAL: [
    makePuzzle('飲品時間', ['小安', '小美', '阿康'], ['茶', '牛奶', '咖啡'], [0, 1, 2]),
    makePuzzle('水果點心', ['阿芳', '小傑', '美玲'], ['蘋果', '香蕉', '葡萄'], [2, 0, 1]),
    makePuzzle('休閒活動', ['志明', '春嬌', '麗華'], ['散步', '唱歌', '拼圖'], [1, 2, 0]),
    makePuzzle('早餐選擇', ['阿福', '小玉', '大同'], ['饅頭', '蛋餅', '吐司'], [2, 1, 0]),
    makePuzzle('交通工具', ['佳佳', '明明', '康康'], ['公車', '捷運', '單車'], [1, 0, 2]),
    makePuzzle('花園植物', ['阿蘭', '小竹', '美惠'], ['玫瑰', '百合', '蘭花'], [0, 2, 1]),
    makePuzzle('音樂興趣', ['家豪', '怡君', '佩佩'], ['鋼琴', '吉他', '鼓'], [2, 0, 1]),
    makePuzzle('寵物朋友', ['阿德', '秀芬', '小凱'], ['貓', '狗', '鳥'], [1, 2, 0]),
    makePuzzle('午餐主食', ['淑華', '國強', '小玲'], ['飯', '麵', '粥'], [0, 2, 1]),
    makePuzzle('運動時光', ['文雄', '雅婷', '阿正'], ['游泳', '桌球', '健走'], [2, 1, 0]),
    makePuzzle('閱讀主題', ['小芬', '阿海', '嘉嘉'], ['旅遊', '歷史', '料理'], [1, 0, 2]),
    makePuzzle('顏色喜好', ['伯伯', '阿姨', '小敏'], ['紅色', '藍色', '綠色'], [2, 0, 1]),
  ],
  ADVANCED: [
    makePuzzle('益智活動', ['小安', '小美', '阿康', '阿珠'], ['數獨', '圍棋', '象棋', '拼圖'], [2, 0, 3, 1], true),
    makePuzzle('旅行地點', ['阿芳', '志明', '麗華', '大同'], ['台北', '台中', '台南', '花蓮'], [3, 1, 0, 2], true),
    makePuzzle('料理分工', ['美惠', '國強', '怡君', '家豪'], ['洗菜', '切菜', '煮湯', '擺盤'], [1, 3, 2, 0], true),
    makePuzzle('運動項目', ['小玉', '阿德', '佩佩', '文雄'], ['羽球', '慢跑', '游泳', '瑜伽'], [2, 0, 3, 1], true),
    makePuzzle('音樂樂器', ['秀芬', '阿海', '嘉嘉', '阿正'], ['笛子', '吉他', '鋼琴', '鼓'], [0, 2, 1, 3], true),
    makePuzzle('市場採買', ['春嬌', '伯伯', '雅婷', '小凱'], ['水果', '蔬菜', '魚', '米'], [3, 1, 0, 2], true),
    makePuzzle('社區課程', ['淑華', '阿福', '小玲', '佳佳'], ['書法', '舞蹈', '園藝', '攝影'], [1, 3, 0, 2], true),
    makePuzzle('下午茶點', ['康康', '明明', '小芬', '阿蘭'], ['蛋糕', '餅乾', '布丁', '地瓜'], [2, 0, 3, 1], true),
    makePuzzle('家事安排', ['麗華', '阿德', '小敏', '志明'], ['掃地', '洗衣', '澆花', '倒垃圾'], [0, 3, 1, 2], true),
    makePuzzle('節目選擇', ['怡君', '家豪', '美惠', '國強'], ['新聞', '戲劇', '旅遊', '運動'], [3, 1, 2, 0], true),
    makePuzzle('公園路線', ['阿珠', '小安', '春嬌', '大同'], ['湖邊', '花圃', '涼亭', '步道'], [1, 3, 0, 2], true),
    makePuzzle('閱讀分享', ['佩佩', '文雄', '小玉', '阿芳'], ['小說', '傳記', '科普', '食譜'], [2, 0, 3, 1], true),
  ],
};

const LogicDetectiveGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const puzzleBank = LOGIC_DETECTIVE_PUZZLES[difficulty];
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = puzzleBank[puzzleIndex];
  const size = puzzle.people.length;
  const [marks, setMarks] = useState<Record<string, LogicMark>>({});
  const [history, setHistory] = useState<Record<string, LogicMark>[]>([]);
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [recent, setRecent] = useState('請讀出線索，再說明哪個配對可以確認或排除。');
  const [finished, setFinished] = useState(false);
  const [autoOrganize, setAutoOrganize] = useState(true);

  const reset = (nextMode = mode) => {
    setMarks({});
    setHistory([]);
    setTeam('A');
    setFinished(false);
    setRecent(nextMode === 'TEAMS' ? 'A 組先選擇一條線索。' : '請選擇一條線索開始推理。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    setScores({ A: 0, B: 0 });
    reset(nextMode);
  };

  const nextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % puzzleBank.length;
    setPuzzleIndex(nextIndex);
    setMarks({});
    setHistory([]);
    setTeam('A');
    setFinished(false);
    setRecent(`已換到第 ${nextIndex + 1} 題「${puzzleBank[nextIndex].title}」。`);
  };

  const cycle = (row: number, col: number) => {
    if (finished) return;
    const key = `${row},${col}`;
    const current = marks[key] ?? 'UNKNOWN';
    const nextMark: LogicMark = current === 'UNKNOWN' ? 'NO' : current === 'NO' ? 'YES' : 'UNKNOWN';
    const next = applyLogicMark(marks, row, col, nextMark, size, autoOrganize);
    setHistory(items => [...items, { ...marks }]);
    setMarks(next);
    const action = nextMark === 'YES' ? '確認配對' : nextMark === 'NO' ? '排除' : '清除標記';
    setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}${coordinateLabel(row, col)} ${puzzle.people[row]}與${puzzle.choices[col]}，${action}。`);
    const selections = puzzle.people.map((_, personIndex) => {
      const selected = puzzle.choices.findIndex((__, choiceIndex) => next[`${personIndex},${choiceIndex}`] === 'YES');
      return selected >= 0 ? selected : null;
    });
    if (isLogicGridSolved(selections, puzzle.solution)) {
      setFinished(true);
      if (mode === 'TEAMS') setScores(value => awardTeam(value, team));
    } else if (mode === 'TEAMS') setTeam(advanceTeam);
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setMarks({ ...previous });
    setHistory(items => items.slice(0, -1));
    setFinished(false);
    if (mode === 'TEAMS') setTeam(advanceTeam);
    setRecent('已復原上一個推理標記。');
  };

  const hint = () => {
    const row = puzzle.solution.findIndex((col, index) => marks[`${index},${col}`] !== 'YES');
    if (row >= 0) setRecent(`提示：先找能直接排除「${puzzle.people[row]}」選項的線索，不會自動替你解讀文字。`);
  };

  return (
    <FacilitatedGameFrame
      title="邏輯線索偵探"
      subtitle={`${puzzle.title}｜${size}×${size}｜第 ${puzzleIndex + 1}/${puzzleBank.length} 題`}
      onBack={onBack}
      mode={mode}
      onModeChange={changeMode}
      currentTeam={team}
      scores={scores}
      recentAction={recent}
      onUndo={undo}
      onReset={() => reset()}
      onHint={hint}
      canUndo={history.length > 0}
      feedback={finished ? '破案成功！所有人物與選項都已正確配對。' : undefined}
      rules={[
        '目標：整合所有線索，找出每個人物唯一對應的飲品或活動。',
        '每個人物與每個選項只能使用一次；叉號代表排除，圓圈代表確認。',
        '操作：點一下標記叉號，再點一下確認圓圈；「自動整理」可由治療者隨時開關。',
        '自動整理開啟時，確認配對會排除同列同欄；某列或欄只剩一格時會自動確認，但不會代替玩家解讀線索。',
        '口述範例：「根據第 2 條線索，把小美和茶的 A2 格標記叉號。」',
        '一般模式為 3×3，需要先完成一輪排除再推得其餘配對；進階模式為 4×4，需要進行至少三階段交叉排除。',
        '分組玩法：A、B 組輪流提出一個有理由的標記；完成最後配對的組別得 1 分。',
      ]}
      sidebar={(
        <div className="mt-auto space-y-2">
          <ol className="space-y-1 rounded-xl bg-violet-50 p-2 text-sm font-semibold leading-snug text-violet-950">
            {puzzle.clues.map((clue, index) => <li key={clue}>{index + 1}. {clue}</li>)}
          </ol>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" aria-pressed={autoOrganize} onClick={() => setAutoOrganize(value => !value)} className={`min-h-11 rounded-xl border px-2 text-sm font-black ${autoOrganize ? 'border-violet-700 bg-violet-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>自動整理：{autoOrganize ? '開' : '關'}</button>
            <button type="button" onClick={nextPuzzle} className="min-h-11 rounded-xl border border-violet-700 bg-white px-2 text-sm font-black text-violet-800">換一題</button>
          </div>
        </div>
      )}
    >
      <div className="flex max-h-full w-full max-w-[30rem] flex-col items-center gap-1">
        <div className="ml-16 grid w-[calc(100%-4rem)] gap-0.5 pl-7 text-center text-xs font-bold text-slate-700" style={{ gridTemplateColumns: `repeat(${size}, minmax(2.75rem, 1fr))` }}>
          {puzzle.choices.map(choice => <div key={choice} className="truncate px-0.5">{choice}</div>)}
        </div>
        <div className="flex w-full items-center gap-1">
          <div className="flex w-16 shrink-0 flex-col gap-0.5 pt-6">
            {puzzle.people.map(person => <div key={person} className="flex min-h-11 items-center justify-end pr-1 text-sm font-bold text-slate-700">{person}</div>)}
          </div>
          <CoordinateGrid
            rows={size}
            columns={size}
            className="min-w-0 flex-1"
            renderCell={(row, col, coordinate) => {
              const mark = marks[`${row},${col}`] ?? 'UNKNOWN';
              return (
                <button
                  type="button"
                  aria-label={`${coordinate}，${puzzle.people[row]}與${puzzle.choices[col]}，${mark === 'YES' ? '已確認' : mark === 'NO' ? '已排除' : '未判定'}`}
                  onClick={() => cycle(row, col)}
                  className={`h-full w-full rounded-md border-2 text-xl font-black ${mark === 'YES' ? 'border-emerald-700 bg-emerald-100 text-emerald-800' : mark === 'NO' ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-300'}`}
                >
                  {mark === 'YES' ? '○' : mark === 'NO' ? '×' : '·'}
                </button>
              );
            }}
          />
        </div>
      </div>
    </FacilitatedGameFrame>
  );
};

export default LogicDetectiveGame;
