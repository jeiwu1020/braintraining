import React, { useMemo, useState } from 'react';
import type { Difficulty } from '../types';
import { advanceTeam, awardTeam, isTrafficJamSolved, moveTrafficCar, type TrafficCar } from '../utils/facilitatedPuzzleRules';
import CoordinateGrid from './game-ui/CoordinateGrid';
import FacilitatedGameFrame, { type FacilitatedMode } from './game-ui/FacilitatedGameFrame';

interface Props { onBack: () => void; difficulty?: Difficulty }

export const TRAFFIC_JAM_LEVELS: Record<Difficulty, TrafficCar[]> = {
  NORMAL: [
    { id: 'X', row: 2, col: 1, length: 2, axis: 'H', target: true, color: 'bg-rose-500' },
    { id: 'B', row: 1, col: 3, length: 3, axis: 'V', color: 'bg-sky-500' },
    { id: 'C', row: 4, col: 0, length: 2, axis: 'H', color: 'bg-amber-400' },
  ],
  ADVANCED: [
    { id: 'X', row: 2, col: 0, length: 2, axis: 'H', target: true, color: 'bg-rose-500' },
    { id: 'B', row: 0, col: 2, length: 3, axis: 'V', color: 'bg-sky-500' },
    { id: 'C', row: 3, col: 0, length: 2, axis: 'H', color: 'bg-violet-500' },
    { id: 'D', row: 4, col: 3, length: 3, axis: 'H', color: 'bg-amber-400' },
  ],
};

const cloneCars = (cars: readonly TrafficCar[]) => cars.map(car => ({ ...car }));

const TrafficJamGame: React.FC<Props> = ({ onBack, difficulty = 'NORMAL' }) => {
  const [cars, setCars] = useState(() => cloneCars(TRAFFIC_JAM_LEVELS[difficulty]));
  const [history, setHistory] = useState<TrafficCar[][]>([]);
  const [selected, setSelected] = useState('X');
  const [mode, setMode] = useState<FacilitatedMode>('COOP');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [recent, setRecent] = useState('請成員先說出車輛代號，再說移動方向與格數。');
  const [finished, setFinished] = useState(false);

  const occupancy = useMemo(() => {
    const map = new Map<string, TrafficCar>();
    cars.forEach(car => {
      for (let offset = 0; offset < car.length; offset += 1) {
        const row = car.row + (car.axis === 'V' ? offset : 0);
        const col = car.col + (car.axis === 'H' ? offset : 0);
        map.set(`${row},${col}`, car);
      }
    });
    return map;
  }, [cars]);

  const reset = (nextMode = mode) => {
    setCars(cloneCars(TRAFFIC_JAM_LEVELS[difficulty]));
    setHistory([]);
    setSelected('X');
    setTeam('A');
    setFinished(false);
    setRecent(nextMode === 'TEAMS' ? 'A 組先說出第一步。' : '請說出第一步。');
  };

  const changeMode = (nextMode: FacilitatedMode) => {
    setMode(nextMode);
    setScores({ A: 0, B: 0 });
    reset(nextMode);
  };

  const move = (distance: number) => {
    if (finished) return;
    const currentCar = cars.find(car => car.id === selected);
    if (!currentCar) return;
    const next = moveTrafficCar(cars, selected, distance, 6);
    if (JSON.stringify(next) === JSON.stringify(cars)) {
      setRecent(`${selected} 車無法往${distance > 0 ? '正向' : '反向'}移動，請重新討論。`);
      return;
    }
    setHistory(previous => [...previous, cloneCars(cars)]);
    setCars(next);
    const direction = currentCar.axis === 'H'
      ? (distance > 0 ? '右' : '左')
      : (distance > 0 ? '下' : '上');
    setRecent(`${mode === 'TEAMS' ? `${team} 組：` : ''}${selected} 車往${direction}移動 ${Math.abs(distance)} 格。`);
    const solved = isTrafficJamSolved(next, 6);
    if (solved) {
      setFinished(true);
      if (mode === 'TEAMS') setScores(value => awardTeam(value, team));
    } else if (mode === 'TEAMS') {
      setTeam(advanceTeam);
    }
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setCars(cloneCars(previous));
    setHistory(items => items.slice(0, -1));
    setFinished(false);
    if (mode === 'TEAMS') setTeam(advanceTeam);
    setRecent('已復原上一個移動。');
  };

  const selectedCar = cars.find(car => car.id === selected);

  return (
    <FacilitatedGameFrame
      title="塞車解謎"
      subtitle={difficulty === 'NORMAL' ? '6×6 入門停車場' : '6×6 多車挑戰'}
      onBack={onBack}
      mode={mode}
      onModeChange={changeMode}
      currentTeam={team}
      scores={scores}
      recentAction={recent}
      onUndo={undo}
      onReset={() => reset()}
      onHint={() => setRecent(difficulty === 'NORMAL' ? '提示：先讓 B 車往下移兩格。' : '提示：先處理擋住第 3 列出口路線的直向車。')}
      canUndo={history.length > 0}
      feedback={finished ? '完成！紅色 X 車已抵達出口。' : undefined}
      rules={[
        '目標：移動車輛，讓紅色 X 車從棋盤右側出口離開。',
        '車輛只能沿本身方向前後移動，不能轉彎、重疊或穿越其他車。',
        '操作：先點選車輛，再由右側按鈕移動一格；可復原、重開或取得提示。',
        '口述範例：「選 B 車，往下移一格」；盤面欄為 A～F、列為 1～6。',
        '一般模式阻擋較少；進階模式有更多互相牽制的車輛。',
        '分組玩法：A、B 組輪流提出一個合法移動，完成出口的組別得 1 分；也可選全體合作。',
      ]}
      sidebar={(
        <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
          <div className="mb-2 text-center text-sm font-bold text-slate-800">
            已選：{selectedCar?.id} 車（{selectedCar?.axis === 'H' ? '左右' : '上下'}）
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => move(-1)} className="min-h-11 rounded-xl bg-indigo-600 px-2 font-bold text-white">
              {selectedCar?.axis === 'H' ? '← 左移' : '↑ 上移'}
            </button>
            <button type="button" onClick={() => move(1)} className="min-h-11 rounded-xl bg-indigo-600 px-2 font-bold text-white">
              {selectedCar?.axis === 'H' ? '右移 →' : '下移 ↓'}
            </button>
          </div>
        </div>
      )}
    >
      <CoordinateGrid
        rows={6}
        columns={6}
        className="w-full max-w-[28rem]"
        renderCell={(row, col, coordinate) => {
          const car = occupancy.get(`${row},${col}`);
          if (!car) return <div className={`h-full w-full rounded-md border ${row === 2 && col === 5 ? 'border-dashed border-rose-500 bg-rose-50' : 'border-slate-200 bg-slate-50'}`} />;
          return (
            <button
              type="button"
              onClick={() => { setSelected(car.id); setRecent(`已選取 ${car.id} 車，位置 ${coordinate}。`); }}
              aria-label={`${coordinate}，${car.id} 車`}
              aria-pressed={selected === car.id}
              className={`h-full w-full rounded-md border-2 text-base font-black text-white shadow-sm ${car.color} ${selected === car.id ? 'border-slate-900 ring-2 ring-amber-300' : 'border-white'}`}
            >
              {car.id}
            </button>
          );
        }}
      />
    </FacilitatedGameFrame>
  );
};

export default TrafficJamGame;
