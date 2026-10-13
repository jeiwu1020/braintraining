import React, { type ReactNode } from 'react';
import { coordinateLabel } from '../../utils/facilitatedPuzzleRules';

interface CoordinateGridProps {
  rows: number;
  columns: number;
  renderCell: (row: number, col: number, coordinate: string) => ReactNode;
  className?: string;
  cellSizeClassName?: string;
}

const CoordinateGrid: React.FC<CoordinateGridProps> = ({
  rows,
  columns,
  renderCell,
  className = '',
  cellSizeClassName = 'min-h-11 min-w-11',
}) => (
  <div
    data-coordinate-grid="true"
    role="grid"
    className={`grid max-h-full max-w-full gap-0.5 ${className}`}
    style={{ '--coordinate-columns': columns, gridTemplateColumns: `1.75rem repeat(${columns}, minmax(2.75rem, 1fr))` } as React.CSSProperties}
  >
    <span aria-hidden="true" />
    {Array.from({ length: columns }, (_, col) => (
      <div key={`column-${col}`} className="flex h-6 items-center justify-center text-sm font-black text-slate-700">
        {String.fromCharCode(65 + col)}
      </div>
    ))}

    {Array.from({ length: rows }, (_, row) => (
      <React.Fragment key={`row-${row}`}>
        <div className="flex items-center justify-center text-sm font-black text-slate-700">{row + 1}</div>
        {Array.from({ length: columns }, (_, col) => {
          const coordinate = coordinateLabel(row, col);
          return (
            <div
              key={coordinate}
              role="gridcell"
              aria-label={coordinate}
              className={`relative flex items-center justify-center ${cellSizeClassName}`}
            >
              {renderCell(row, col, coordinate)}
            </div>
          );
        })}
      </React.Fragment>
    ))}
  </div>
);

export default CoordinateGrid;
