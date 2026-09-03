import React from 'react';
import { motion } from 'motion/react';
import { GoBoard, Point, TerritoryScore } from '../services/goEngine';
import { GO_COLUMN_LABELS } from './WeiqiGame';

export interface WeiqiBoardProps {
  board: GoBoard;
  boardSize: number;
  currentTurn: 'BLACK' | 'WHITE';
  lastMove: Point | null;
  koPoint?: Point | null;
  blackAtariGroups?: { stones: Point[] }[];
  whiteAtariGroups?: { stones: Point[] }[];
  showTerritory?: boolean;
  territoryResult?: TerritoryScore | null;
  hoveredPoint: Point | null;
  setHoveredPoint: (pt: Point | null) => void;
  onCellClick: (r: number, c: number) => void;
  isAiThinking?: boolean;
  gameOverResult?: any;
  isLandscapeCompact?: boolean;
}

export const getStarPoints = (size: number): Point[] => {
  if (size === 9) {
    return [
      { r: 2, c: 2 },
      { r: 2, c: 6 },
      { r: 4, c: 4 },
      { r: 6, c: 2 },
      { r: 6, c: 6 }
    ];
  }
  if (size === 13) {
    return [
      { r: 3, c: 3 },
      { r: 3, c: 9 },
      { r: 6, c: 6 },
      { r: 9, c: 3 },
      { r: 9, c: 9 }
    ];
  }
  if (size === 19) {
    return [
      { r: 3, c: 3 },
      { r: 3, c: 9 },
      { r: 3, c: 15 },
      { r: 9, c: 3 },
      { r: 9, c: 9 },
      { r: 9, c: 15 },
      { r: 15, c: 3 },
      { r: 15, c: 9 },
      { r: 15, c: 15 }
    ];
  }
  return [];
};

export const WeiqiBoard: React.FC<WeiqiBoardProps> = ({
  board,
  boardSize,
  currentTurn,
  lastMove,
  koPoint,
  blackAtariGroups = [],
  whiteAtariGroups = [],
  showTerritory = false,
  territoryResult,
  hoveredPoint,
  setHoveredPoint,
  onCellClick,
  isAiThinking = false,
  gameOverResult = null,
  isLandscapeCompact = false,
}) => {
  const starPoints = getStarPoints(boardSize);

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      style={
        isLandscapeCompact
          ? {
              width: 'min(calc(100vw - 280px), calc(100dvh - 12px))',
              height: 'min(calc(100vw - 280px), calc(100dvh - 12px))',
              maxWidth: '100%',
              maxHeight: '100%',
              aspectRatio: '1 / 1',
            }
          : {
              maxWidth: 'min(92vw, min(calc(100dvh - 240px), 580px))',
              maxHeight: 'min(92vw, min(calc(100dvh - 240px), 580px))',
              width: '100%',
              aspectRatio: '1 / 1',
            }
      }
    >
      {/* Coordinates Top: A, B, C, D, E, F, G, H, J... */}
      <div
        className={`w-full flex shrink-0 items-center ${
          isLandscapeCompact ? 'h-3 pl-2.5 pr-2.5' : 'h-3.5 sm:h-4 pl-3 sm:pl-4 pr-3 sm:pr-4'
        }`}
      >
        {Array.from({ length: boardSize }).map((_, c) => (
          <div
            key={c}
            className={`flex-1 text-center font-black text-amber-300/90 leading-none ${
              isLandscapeCompact ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[11px]'
            }`}
          >
            {GO_COLUMN_LABELS[c]}
          </div>
        ))}
      </div>

      {/* Left Coordinates + Wood Board Square + Right Coordinates */}
      <div className="w-full flex-1 flex items-stretch min-h-0 min-w-0">
        {/* Left Coordinates: boardSize..1 */}
        <div
          className={`flex flex-col justify-between shrink-0 ${
            isLandscapeCompact ? 'w-2.5 sm:w-3 py-0.5' : 'w-3 sm:w-4 py-1'
          }`}
        >
          {Array.from({ length: boardSize }).map((_, r) => (
            <div
              key={r}
              className={`flex-1 flex items-center justify-center font-black text-amber-300/90 leading-none ${
                isLandscapeCompact ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[11px]'
              }`}
            >
              {boardSize - r}
            </div>
          ))}
        </div>

        {/* Main Wood Board Square */}
        <div
          className="relative flex-1 aspect-square bg-gradient-to-br from-[#e8b571] via-[#dca358] to-[#c98e40] border-2 sm:border-4 border-[#522907] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
          style={{
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.7)',
          }}
        >
          {/* SVG Grid Lines with Resolution-Independent 0..1000 Coordinate System */}
          <svg
            viewBox="0 0 1000 1000"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {/* Border grid rectangle */}
            <rect
              x={1000 / (2 * boardSize)}
              y={1000 / (2 * boardSize)}
              width={1000 - 1000 / boardSize}
              height={1000 - 1000 / boardSize}
              fill="none"
              stroke="#4a2505"
              strokeWidth={boardSize === 19 ? 3 : 4.5}
            />
            {/* Interior Grid Lines */}
            {Array.from({ length: boardSize }).map((_, idx) => {
              const step = 1000 / boardSize;
              const pos = step * 0.5 + idx * step;
              const start = step * 0.5;
              const end = 1000 - step * 0.5;
              return (
                <g key={idx}>
                  {/* Horizontal line */}
                  <line
                    x1={start}
                    y1={pos}
                    x2={end}
                    y2={pos}
                    stroke="#4a2505"
                    strokeWidth={boardSize === 19 ? 1.5 : 2.5}
                  />
                  {/* Vertical line */}
                  <line
                    x1={pos}
                    y1={start}
                    x2={pos}
                    y2={end}
                    stroke="#4a2505"
                    strokeWidth={boardSize === 19 ? 1.5 : 2.5}
                  />
                </g>
              );
            })}

            {/* Star Points (星位) */}
            {starPoints.map((star, sIdx) => {
              const step = 1000 / boardSize;
              const cx = step * 0.5 + star.c * step;
              const cy = step * 0.5 + star.r * step;
              return (
                <circle
                  key={sIdx}
                  cx={cx}
                  cy={cy}
                  r={boardSize === 19 ? 5.5 : boardSize === 13 ? 7 : 8.5}
                  fill="#361701"
                />
              );
            })}
          </svg>

          {/* Intersection Interactive Cell Buttons */}
          <div
            className="absolute inset-0 grid w-full h-full touch-manipulation"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
              gridTemplateRows: `repeat(${boardSize}, 1fr)`,
              zIndex: 1,
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isLast = lastMove && lastMove.r === r && lastMove.c === c;
                const isHovered =
                  hoveredPoint &&
                  hoveredPoint.r === r &&
                  hoveredPoint.c === c &&
                  cell === 'EMPTY';
                const isKo = koPoint && koPoint.r === r && koPoint.c === c;
                const isAtari =
                  (cell === 'BLACK' &&
                    blackAtariGroups.some(g =>
                      g.stones.some(st => st.r === r && st.c === c)
                    )) ||
                  (cell === 'WHITE' &&
                    whiteAtariGroups.some(g =>
                      g.stones.some(st => st.r === r && st.c === c)
                    ));

                const territoryOwner =
                  showTerritory && territoryResult
                    ? territoryResult.territoryMap[r]?.[c]
                    : null;

                return (
                  <button
                    key={`${r}-${c}`}
                    id={`go-cell-${r}-${c}`}
                    onClick={() => onCellClick(r, c)}
                    onMouseEnter={() => setHoveredPoint({ r, c })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    aria-label={`圍棋交叉點 ${GO_COLUMN_LABELS[c]}${boardSize - r}`}
                    className="relative flex items-center justify-center w-full h-full focus:outline-none cursor-pointer select-none active:scale-95 transition-transform"
                    style={{ minWidth: 0, minHeight: 0 }}
                    title={`${GO_COLUMN_LABELS[c]}${boardSize - r}`}
                  >
                    {/* Stone Render */}
                    {cell === 'BLACK' && (
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-[88%] h-[88%] rounded-full bg-gradient-to-br from-stone-700 via-stone-900 to-black shadow-md border border-stone-800 flex items-center justify-center relative"
                        style={{
                          boxShadow:
                            '2px 3px 6px rgba(0,0,0,0.7), inset -2px -2px 4px rgba(0,0,0,0.8)',
                        }}
                      >
                        {/* Top Shine */}
                        <div className="absolute top-1 left-1.5 w-1/3 h-1/3 bg-white/20 rounded-full blur-[0.5px]" />
                        {isLast && (
                          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                        )}
                        {isAtari && !isLast && (
                          <span className="absolute -inset-0.5 rounded-full ring-2 ring-rose-500 animate-pulse" />
                        )}
                      </motion.div>
                    )}

                    {cell === 'WHITE' && (
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-[88%] h-[88%] rounded-full bg-gradient-to-br from-white via-amber-50 to-stone-300 shadow-md border border-stone-300 flex items-center justify-center relative"
                        style={{
                          boxShadow:
                            '2px 3px 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(0,0,0,0.3)',
                        }}
                      >
                        {/* Top Shine */}
                        <div className="absolute top-1 left-1.5 w-1/3 h-1/3 bg-white rounded-full" />
                        {isLast && (
                          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600 ring-2 ring-stone-900 animate-pulse" />
                        )}
                        {isAtari && !isLast && (
                          <span className="absolute -inset-0.5 rounded-full ring-2 ring-rose-500 animate-pulse" />
                        )}
                      </motion.div>
                    )}

                    {/* Hover Ghost Stone */}
                    {isHovered && !isAiThinking && !gameOverResult && (
                      <div
                        className={`w-[80%] h-[80%] rounded-full opacity-45 border-2 border-dashed pointer-events-none ${
                          currentTurn === 'BLACK'
                            ? 'bg-black border-white'
                            : 'bg-white border-black'
                        }`}
                      />
                    )}

                    {/* Ko Forbidden Marker */}
                    {isKo && cell === 'EMPTY' && (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-dashed border-rose-500 rounded bg-rose-500/25 flex items-center justify-center pointer-events-none">
                        <span className="text-[8px] font-black text-rose-300">劫</span>
                      </div>
                    )}

                    {/* Territory Overlay Marker */}
                    {showTerritory && territoryOwner && territoryOwner !== 'STONE' && (
                      <div
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm flex items-center justify-center pointer-events-none shadow ${
                          territoryOwner === 'BLACK'
                            ? 'bg-stone-950/90 border border-amber-400 text-[8px] font-black text-amber-300'
                            : territoryOwner === 'WHITE'
                            ? 'bg-white/95 border border-stone-800 text-[8px] font-black text-stone-950'
                            : 'bg-amber-600/40 rounded-full w-2 h-2'
                        }`}
                      >
                        {territoryOwner === 'BLACK' ? '黑' : territoryOwner === 'WHITE' ? '白' : ''}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Coordinates: boardSize..1 */}
        <div
          className={`flex flex-col justify-between shrink-0 ${
            isLandscapeCompact ? 'w-2.5 sm:w-3 py-0.5' : 'w-3 sm:w-4 py-1'
          }`}
        >
          {Array.from({ length: boardSize }).map((_, r) => (
            <div
              key={r}
              className={`flex-1 flex items-center justify-center font-black text-amber-300/70 leading-none ${
                isLandscapeCompact ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[11px]'
              }`}
            >
              {boardSize - r}
            </div>
          ))}
        </div>
      </div>

      {/* Coordinates Bottom: A, B, C, D, E, F, G, H, J... */}
      <div
        className={`w-full flex shrink-0 items-center mt-0.5 ${
          isLandscapeCompact ? 'h-3 pl-2.5 pr-2.5' : 'h-3.5 sm:h-4 pl-3 sm:pl-4 pr-3 sm:pr-4'
        }`}
      >
        {Array.from({ length: boardSize }).map((_, c) => (
          <div
            key={c}
            className={`flex-1 text-center font-black text-amber-300/90 leading-none ${
              isLandscapeCompact ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[11px]'
            }`}
          >
            {GO_COLUMN_LABELS[c]}
          </div>
        ))}
      </div>
    </div>
  );
};
