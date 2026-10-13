import type { Difficulty } from '../types';
import type { TrafficCar } from '../utils/facilitatedPuzzleRules';
import type { TrafficMove, TrafficTier } from '../utils/trafficJamModel';
import type { TrafficSolutionMetrics } from '../utils/trafficJamAudit';

export interface TrafficJamPuzzle {
  id: string;
  tier: TrafficTier;
  title: string;
  focus: string;
  dependency: string;
  hints: readonly [string, string];
  cars: TrafficCar[];
  minimumMoves: number;
  solution: TrafficMove[];
  metrics: TrafficSolutionMetrics;
  requiresReversal: boolean;
}

export const TRAFFIC_TIER_LABELS: Record<TrafficTier, string> = { BEGINNER: '入門', STANDARD: '標準', CHALLENGE: '挑戰' };
export const initialTrafficTier = (difficulty: Difficulty): TrafficTier => difficulty === 'ADVANCED' ? 'CHALLENGE' : 'STANDARD';

// 36 independently validated 6×6 boards. A move is one whole car slide.
// Entry levels keep short teaching examples. Normal/advanced menu entries now open
// STANDARD (8–14 moves) / CHALLENGE (15–25 moves), not the introductory examples.
// Tests exclude rotations, reflections, recolors, relabels and alternate scrambles
// of the same car lanes/lengths. All vehicles participate in a verified shortest path.
// dependencyDepth measures the first-move prerequisite chain of that verified path;
// it does not claim a clinical rating or a minimum over every possible solution.
export const TRAFFIC_JAM_PUZZLES: readonly TrafficJamPuzzle[] = [
  {
    "id": "beginner-1",
    "tier": "BEGINNER",
    "title": "長車向下讓路",
    "focus": "看清長車必須向下，替 X 清出通道。",
    "dependency": "B → X",
    "hints": [
      "先找第 3 列擋住 X 的車。",
      "長車 B 上方空間不足，看看下方。"
    ],
    "cars": [
      {
        "id": "X",
        "row": 2,
        "col": 1,
        "length": 2,
        "axis": "H",
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "row": 1,
        "col": 3,
        "length": 3,
        "axis": "V",
        "color": "bg-sky-700"
      }
    ],
    "minimumMoves": 2,
    "solution": [
      {
        "carId": "B",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 3
      }
    ],
    "metrics": {
      "participatingCars": 2,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 1,
      "dependencyChain": [
        "B",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-2",
    "tier": "BEGINNER",
    "title": "短車有兩條路",
    "focus": "比較同一部短車向上或向下的兩種合法讓路。",
    "dependency": "B 向上或向下 → X",
    "hints": [
      "短車 B 的上、下兩端各有多少空間？",
      "上移或下移都可能清出第 3 列，請先報完整一步。"
    ],
    "cars": [
      {
        "id": "X",
        "row": 2,
        "col": 0,
        "length": 2,
        "axis": "H",
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "row": 1,
        "col": 3,
        "length": 2,
        "axis": "V",
        "color": "bg-sky-700"
      }
    ],
    "minimumMoves": 2,
    "solution": [
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 2,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 1,
      "dependencyChain": [
        "B",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-3",
    "tier": "BEGINNER",
    "title": "兩車分別清路",
    "focus": "區分一部長車與一部短車，兩處都讓開才能出去。",
    "dependency": "B、C 分別讓路 → X",
    "hints": [
      "沿第 3 列往右數，有幾部車需要讓路？",
      "B 和 C 可以分開處理，先比較各自可移的方向。"
    ],
    "cars": [
      {
        "id": "X",
        "row": 2,
        "col": 0,
        "length": 2,
        "axis": "H",
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "row": 0,
        "col": 2,
        "length": 3,
        "axis": "V",
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "row": 1,
        "col": 4,
        "length": 2,
        "axis": "V",
        "color": "bg-amber-700"
      }
    ],
    "minimumMoves": 3,
    "solution": [
      {
        "carId": "B",
        "distance": 3
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 3,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 1,
      "dependencyChain": [
        "B",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-4",
    "tier": "BEGINNER",
    "title": "出口端也要看",
    "focus": "追蹤近處與最右端的兩部長車，避免漏看出口。",
    "dependency": "B、C 分別向下 → X",
    "hints": [
      "除了眼前的 B，出口端還有誰？",
      "兩部都是長車，請檢查它們下方的空位。"
    ],
    "cars": [
      {
        "id": "X",
        "row": 2,
        "col": 0,
        "length": 2,
        "axis": "H",
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "row": 1,
        "col": 2,
        "length": 3,
        "axis": "V",
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "row": 0,
        "col": 5,
        "length": 3,
        "axis": "V",
        "color": "bg-amber-700"
      }
    ],
    "minimumMoves": 3,
    "solution": [
      {
        "carId": "B",
        "distance": 2
      },
      {
        "carId": "C",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 3,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 1,
      "dependencyChain": [
        "B",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-5",
    "tier": "BEGINNER",
    "title": "先替 B 清路",
    "focus": "先移開橫車，阻擋 X 的直車才有地方停。",
    "dependency": "C → B → X",
    "hints": [
      "X 被 B 擋住，那 B 的下方又被誰擋？",
      "先讓 C 離開 B 要經過的位置，再移 B。"
    ],
    "cars": [
      {
        "id": "X",
        "row": 2,
        "col": 0,
        "length": 2,
        "axis": "H",
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "row": 1,
        "col": 3,
        "length": 3,
        "axis": "V",
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "row": 4,
        "col": 2,
        "length": 2,
        "axis": "H",
        "color": "bg-amber-700"
      }
    ],
    "minimumMoves": 3,
    "solution": [
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 3,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 2,
      "dependencyChain": [
        "C",
        "B",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-6",
    "tier": "BEGINNER",
    "title": "先安排下方車位",
    "focus": "先安置左側直車，再讓橫車與出口阻擋車依序通過。",
    "dependency": "D → C → B → X",
    "hints": [
      "C 需要向左，左側還停著 D。",
      "D 可先向下騰出空間，再把 C 往左移。"
    ],
    "cars": [
      {
        "id": "X",
        "row": 2,
        "col": 0,
        "length": 2,
        "axis": "H",
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "row": 0,
        "col": 3,
        "length": 3,
        "axis": "V",
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "row": 3,
        "col": 2,
        "length": 3,
        "axis": "H",
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "row": 3,
        "col": 0,
        "length": 2,
        "axis": "V",
        "color": "bg-violet-700"
      }
    ],
    "minimumMoves": 4,
    "solution": [
      {
        "carId": "D",
        "distance": 1
      },
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 4,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 3,
      "dependencyChain": [
        "D",
        "C",
        "B",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-7",
    "tier": "BEGINNER",
    "title": "長車接力讓路",
    "focus": "由最外側直車開始，逐層安排兩部長車的停車位置。",
    "dependency": "D → C → B → X",
    "hints": [
      "B 往下要經過 C，C 的右方又被 D 擋住。",
      "D 先往上、C 再往右，B 才有足夠空間下移。"
    ],
    "cars": [
      {
        "id": "X",
        "row": 2,
        "col": 0,
        "length": 2,
        "axis": "H",
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "row": 0,
        "col": 2,
        "length": 3,
        "axis": "V",
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "row": 3,
        "col": 0,
        "length": 3,
        "axis": "H",
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "row": 3,
        "col": 4,
        "length": 2,
        "axis": "V",
        "color": "bg-violet-700"
      }
    ],
    "minimumMoves": 4,
    "solution": [
      {
        "carId": "D",
        "distance": -3
      },
      {
        "carId": "C",
        "distance": 3
      },
      {
        "carId": "B",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 4,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 3,
      "dependencyChain": [
        "D",
        "C",
        "B",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-8",
    "tier": "BEGINNER",
    "title": "分成兩條支線",
    "focus": "分辨可以直接讓路的 B，和仍需前置工作的 C。",
    "dependency": "B 直接讓路；D → C；最後 X",
    "hints": [
      "B 和 C 都擋著 X，但只有一部能直接讓路。",
      "B 可往上；C 往下前，D 必須先向左。"
    ],
    "cars": [
      {
        "id": "X",
        "row": 2,
        "col": 0,
        "length": 2,
        "axis": "H",
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "row": 1,
        "col": 2,
        "length": 2,
        "axis": "V",
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "row": 0,
        "col": 4,
        "length": 3,
        "axis": "V",
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "row": 3,
        "col": 2,
        "length": 3,
        "axis": "H",
        "color": "bg-violet-700"
      }
    ],
    "minimumMoves": 4,
    "solution": [
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "D",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 4,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 2,
      "dependencyChain": [
        "D",
        "C",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-9",
    "tier": "BEGINNER",
    "title": "出口長車與三層橫車",
    "focus": "先找橫車能停在哪裡，三層都清開後才放行出口長車。",
    "dependency": "驗證解首移前置鏈：D → E → X",
    "hints": [
      "先沿 X 右側找出 E 車，再比較它們兩端缺少哪段空位。",
      "請比較 D、E、X 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 5,
        "col": 3,
        "length": 3,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 3,
        "col": 3,
        "length": 3,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 0,
        "col": 5,
        "length": 3,
        "color": "bg-emerald-700"
      }
    ],
    "minimumMoves": 5,
    "solution": [
      {
        "carId": "D",
        "distance": -3
      },
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 5,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 2,
      "dependencyChain": [
        "D",
        "E",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-10",
    "tier": "BEGINNER",
    "title": "底部橫車先整理",
    "focus": "比較下方三部橫車的移動順序，避免只盯著 X。",
    "dependency": "驗證解首移前置鏈：E → D → X",
    "hints": [
      "先沿 X 右側找出 D 車，再比較它們兩端缺少哪段空位。",
      "請比較 E、D、X 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 2,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 4,
        "col": 2,
        "length": 3,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 5,
        "col": 3,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 3,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 3,
        "col": 3,
        "length": 2,
        "color": "bg-emerald-700"
      }
    ],
    "minimumMoves": 5,
    "solution": [
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "D",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 2
      }
    ],
    "metrics": {
      "participatingCars": 5,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 2,
      "dependencyChain": [
        "E",
        "D",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-11",
    "tier": "BEGINNER",
    "title": "側邊開路再串連",
    "focus": "先替側邊車安排位置，再逐層清出出口通道。",
    "dependency": "驗證解首移前置鏈：C → D → E → B → X",
    "hints": [
      "先沿 X 右側找出 B、F 車，再比較它們兩端缺少哪段空位。",
      "請比較 C、D、E 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 2,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 1,
        "col": 4,
        "length": 3,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 3,
        "col": 1,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 4,
        "col": 2,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 1,
        "col": 5,
        "length": 3,
        "color": "bg-orange-700"
      }
    ],
    "minimumMoves": 6,
    "solution": [
      {
        "carId": "C",
        "distance": -3
      },
      {
        "carId": "D",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "F",
        "distance": 2
      },
      {
        "carId": "B",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 2
      }
    ],
    "metrics": {
      "participatingCars": 6,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 4,
      "dependencyChain": [
        "C",
        "D",
        "E",
        "B",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "beginner-12",
    "tier": "BEGINNER",
    "title": "第一次借位回移",
    "focus": "學習暫時借用出口列；空間打開後，還要把借位車移回。",
    "dependency": "驗證解首移前置鏈：D → E → C → X；回移車：D",
    "hints": [
      "先沿 X 右側找出 B、C、D 車，再比較它們兩端缺少哪段空位。",
      "請比較 D、E、C 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 1,
        "col": 4,
        "length": 3,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 0,
        "col": 3,
        "length": 3,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 2,
        "col": 2,
        "length": 3,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 4,
        "col": 3,
        "length": 2,
        "color": "bg-emerald-700"
      }
    ],
    "minimumMoves": 6,
    "solution": [
      {
        "carId": "D",
        "distance": -1
      },
      {
        "carId": "E",
        "distance": -3
      },
      {
        "carId": "D",
        "distance": 2
      },
      {
        "carId": "C",
        "distance": 3
      },
      {
        "carId": "B",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 5,
      "reversalsInSolution": 1,
      "reversingCars": [
        "D"
      ],
      "dependencyDepth": 3,
      "dependencyChain": [
        "D",
        "E",
        "C",
        "X"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "standard-1",
    "tier": "STANDARD",
    "title": "出口先留中繼站",
    "focus": "X 可以分段前進，先停在中繼位置，讓其他車有路可走。",
    "dependency": "驗證解首移前置鏈：F → G → D → B → C",
    "hints": [
      "先沿 X 右側找出 C 車，再比較它們兩端缺少哪段空位。",
      "請比較 F、G、D 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 1,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 4,
        "col": 3,
        "length": 3,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 0,
        "col": 5,
        "length": 3,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 4,
        "col": 2,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 3,
        "col": 4,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 3,
        "col": 1,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 3,
        "col": 2,
        "length": 2,
        "color": "bg-cyan-700"
      }
    ],
    "minimumMoves": 8,
    "solution": [
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": -4
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 1
      }
    ],
    "metrics": {
      "participatingCars": 7,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 4,
      "dependencyChain": [
        "F",
        "G",
        "D",
        "B",
        "C"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "standard-2",
    "tier": "STANDARD",
    "title": "上方開路，下方借位",
    "focus": "先清出上方位置，再讓下方直車借位；不要忘記歸還通道。",
    "dependency": "驗證解首移前置鏈：F → C → E → G → D → X；回移車：E",
    "hints": [
      "先沿 X 右側找出 C、D 車，再比較它們兩端缺少哪段空位。",
      "請比較 F、C、E 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 1,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 0,
        "col": 2,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 2,
        "col": 3,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 1,
        "col": 5,
        "length": 3,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 4,
        "col": 3,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 1,
        "col": 2,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-cyan-700"
      }
    ],
    "minimumMoves": 8,
    "solution": [
      {
        "carId": "F",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "G",
        "distance": -3
      },
      {
        "carId": "E",
        "distance": 1
      },
      {
        "carId": "D",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 3
      }
    ],
    "metrics": {
      "participatingCars": 7,
      "reversalsInSolution": 1,
      "reversingCars": [
        "E"
      ],
      "dependencyDepth": 5,
      "dependencyChain": [
        "F",
        "C",
        "E",
        "G",
        "D",
        "X"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "standard-3",
    "tier": "STANDARD",
    "title": "兩端接力開通",
    "focus": "上方與下方各有一條清路支線，先找兩條支線會交會的位置。",
    "dependency": "驗證解首移前置鏈：I → D → E → G → B → X",
    "hints": [
      "先沿 X 右側找出 B、C、D、F 車，再比較它們兩端缺少哪段空位。",
      "請比較 I、D、E 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 0,
        "col": 5,
        "length": 3,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 1,
        "col": 4,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 2,
        "col": 2,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 4,
        "col": 2,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 1,
        "col": 3,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 5,
        "col": 3,
        "length": 3,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "H",
        "row": 3,
        "col": 4,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "H",
        "row": 1,
        "col": 1,
        "length": 2,
        "color": "bg-slate-700"
      }
    ],
    "minimumMoves": 9,
    "solution": [
      {
        "carId": "I",
        "distance": -1
      },
      {
        "carId": "H",
        "distance": -1
      },
      {
        "carId": "D",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": -2
      },
      {
        "carId": "F",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 9,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 5,
      "dependencyChain": [
        "I",
        "D",
        "E",
        "G",
        "B",
        "X"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "standard-4",
    "tier": "STANDARD",
    "title": "X 前進換空間",
    "focus": "先替 X 開一小段路，X 前進後才有空間完成下一段計畫。",
    "dependency": "驗證解首移前置鏈：C → F → X → D → G → H",
    "hints": [
      "先沿 X 右側找出 F、H 車，再比較它們兩端缺少哪段空位。",
      "請比較 C、F、X 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 1,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 3,
        "col": 1,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 0,
        "col": 3,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 5,
        "col": 3,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 1,
        "col": 3,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 4,
        "col": 2,
        "length": 3,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 1,
        "col": 4,
        "length": 3,
        "color": "bg-fuchsia-700"
      }
    ],
    "minimumMoves": 9,
    "solution": [
      {
        "carId": "C",
        "distance": 1
      },
      {
        "carId": "F",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "D",
        "distance": -4
      },
      {
        "carId": "G",
        "distance": -1
      },
      {
        "carId": "E",
        "distance": -3
      },
      {
        "carId": "H",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 2
      }
    ],
    "metrics": {
      "participatingCars": 8,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 5,
      "dependencyChain": [
        "C",
        "F",
        "X",
        "D",
        "G",
        "H"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "standard-5",
    "tier": "STANDARD",
    "title": "橫車先右後左",
    "focus": "有的車需要先往一邊讓，再往另一邊回移，請先說出目的。",
    "dependency": "驗證解首移前置鏈：C → G → F → B → E；回移車：F、G",
    "hints": [
      "先沿 X 右側找出 G 車，再比較它們兩端缺少哪段空位。",
      "請比較 C、G、F 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 1,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 0,
        "col": 2,
        "length": 3,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 5,
        "col": 3,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 4,
        "col": 2,
        "length": 3,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 3,
        "col": 1,
        "length": 3,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 1,
        "col": 4,
        "length": 3,
        "color": "bg-cyan-700"
      }
    ],
    "minimumMoves": 10,
    "solution": [
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": -1
      },
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "B",
        "distance": -3
      },
      {
        "carId": "F",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "D",
        "distance": -2
      },
      {
        "carId": "G",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 2
      }
    ],
    "metrics": {
      "participatingCars": 7,
      "reversalsInSolution": 2,
      "reversingCars": [
        "F",
        "G"
      ],
      "dependencyDepth": 4,
      "dependencyChain": [
        "C",
        "G",
        "F",
        "B",
        "E"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "standard-6",
    "tier": "STANDARD",
    "title": "X 後退打開長鏈",
    "focus": "先讓 X 遠離出口，才能解開下面的依存鏈；之後再接回出口。",
    "dependency": "驗證解首移前置鏈：X → D → E → I → G → H → F；回移車：X",
    "hints": [
      "先沿 X 右側找出 F 車，再比較它們兩端缺少哪段空位。",
      "請比較 X、D、E 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 2,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 0,
        "col": 2,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 3,
        "col": 3,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 3,
        "col": 1,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 3,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 5,
        "col": 2,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "H",
        "row": 5,
        "col": 4,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-slate-700"
      }
    ],
    "minimumMoves": 10,
    "solution": [
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "D",
        "distance": -3
      },
      {
        "carId": "E",
        "distance": 1
      },
      {
        "carId": "I",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": -2
      },
      {
        "carId": "H",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "F",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 3
      }
    ],
    "metrics": {
      "participatingCars": 9,
      "reversalsInSolution": 1,
      "reversingCars": [
        "X"
      ],
      "dependencyDepth": 6,
      "dependencyChain": [
        "X",
        "D",
        "E",
        "I",
        "G",
        "H",
        "F"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "standard-7",
    "tier": "STANDARD",
    "title": "雙直車分段借位",
    "focus": "兩部直車要分段借位，不能只把所有車一直往同方向推。",
    "dependency": "驗證解首移前置鏈：G → H → B → C → F；回移車：C、E",
    "hints": [
      "先沿 X 右側找出 B、E 車，再比較它們兩端缺少哪段空位。",
      "請比較 G、H、B 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 1,
        "col": 2,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 3,
        "col": 2,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 5,
        "col": 3,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 2,
        "col": 3,
        "length": 3,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "H",
        "row": 0,
        "col": 1,
        "length": 3,
        "color": "bg-fuchsia-700"
      }
    ],
    "minimumMoves": 11,
    "solution": [
      {
        "carId": "G",
        "distance": 2
      },
      {
        "carId": "H",
        "distance": 2
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "F",
        "distance": -4
      },
      {
        "carId": "G",
        "distance": 1
      },
      {
        "carId": "D",
        "distance": 1
      },
      {
        "carId": "E",
        "distance": 2
      },
      {
        "carId": "C",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 8,
      "reversalsInSolution": 2,
      "reversingCars": [
        "C",
        "E"
      ],
      "dependencyDepth": 4,
      "dependencyChain": [
        "G",
        "H",
        "B",
        "C",
        "F"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "standard-8",
    "tier": "STANDARD",
    "title": "上排搬到下排",
    "focus": "比較上排、側邊和底部三段工作，讓同一空間接力使用。",
    "dependency": "驗證解首移前置鏈：F → E → I → D",
    "hints": [
      "先沿 X 右側找出 C、J 車，再比較它們兩端缺少哪段空位。",
      "請比較 F、E、I 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 0,
        "col": 1,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 1,
        "col": 2,
        "length": 3,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 4,
        "col": 3,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 0,
        "col": 3,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 5,
        "col": 2,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "H",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 3,
        "col": 5,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "V",
        "row": 1,
        "col": 4,
        "length": 2,
        "color": "bg-lime-700"
      }
    ],
    "minimumMoves": 11,
    "solution": [
      {
        "carId": "F",
        "distance": 2
      },
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "J",
        "distance": -1
      },
      {
        "carId": "I",
        "distance": -3
      },
      {
        "carId": "H",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": 1
      },
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "C",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 10,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 3,
      "dependencyChain": [
        "F",
        "E",
        "I",
        "D"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "standard-9",
    "tier": "STANDARD",
    "title": "左側交換通道",
    "focus": "左側空位要交給不同車輪流使用，請預想車移開後誰能通過。",
    "dependency": "驗證解首移前置鏈：X → I → E → G → H → B；回移車：I、X",
    "hints": [
      "先沿 X 右側找出 B、G 車，再比較它們兩端缺少哪段空位。",
      "請比較 X、I、E 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 1,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 0,
        "col": 5,
        "length": 3,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 4,
        "col": 0,
        "length": 3,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 0,
        "col": 0,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 1,
        "col": 3,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 5,
        "col": 3,
        "length": 3,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 2,
        "col": 3,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "H",
        "row": 3,
        "col": 4,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 0,
        "col": 2,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "H",
        "row": 5,
        "col": 1,
        "length": 2,
        "color": "bg-lime-700"
      }
    ],
    "minimumMoves": 12,
    "solution": [
      {
        "carId": "J",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "I",
        "distance": 2
      },
      {
        "carId": "E",
        "distance": -3
      },
      {
        "carId": "I",
        "distance": -2
      },
      {
        "carId": "G",
        "distance": -2
      },
      {
        "carId": "H",
        "distance": -1
      },
      {
        "carId": "F",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 10,
      "reversalsInSolution": 2,
      "reversingCars": [
        "I",
        "X"
      ],
      "dependencyDepth": 5,
      "dependencyChain": [
        "X",
        "I",
        "E",
        "G",
        "H",
        "B"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "standard-10",
    "tier": "STANDARD",
    "title": "同一台車三次轉接",
    "focus": "同一部直車要接手幾次讓路工作，先規劃兩段再操作。",
    "dependency": "驗證解首移前置鏈：C → B → I → H → G → X；回移車：C",
    "hints": [
      "先沿 X 右側找出 D、G 車，再比較它們兩端缺少哪段空位。",
      "請比較 C、B、I 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 3,
        "col": 4,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 3,
        "col": 2,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 0,
        "col": 5,
        "length": 3,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 5,
        "col": 4,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 1,
        "col": 2,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "H",
        "row": 0,
        "col": 1,
        "length": 3,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-slate-700"
      }
    ],
    "minimumMoves": 13,
    "solution": [
      {
        "carId": "C",
        "distance": 1
      },
      {
        "carId": "B",
        "distance": -4
      },
      {
        "carId": "I",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": 1
      },
      {
        "carId": "H",
        "distance": 2
      },
      {
        "carId": "G",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "F",
        "distance": -4
      },
      {
        "carId": "I",
        "distance": 1
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "D",
        "distance": 2
      },
      {
        "carId": "C",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 9,
      "reversalsInSolution": 2,
      "reversingCars": [
        "C"
      ],
      "dependencyDepth": 5,
      "dependencyChain": [
        "C",
        "B",
        "I",
        "H",
        "G",
        "X"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "standard-11",
    "tier": "STANDARD",
    "title": "單向長接力",
    "focus": "這題可用不反向回移的長計畫完成，關鍵是多層前置順序。",
    "dependency": "驗證解首移前置鏈：E → I → B → J → X → H → G → D",
    "hints": [
      "先沿 X 右側找出 I、J 車，再比較它們兩端缺少哪段空位。",
      "請比較 E、I、B 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 0,
        "col": 1,
        "length": 3,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 5,
        "col": 4,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 3,
        "col": 4,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 4,
        "col": 2,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 3,
        "col": 1,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 0,
        "col": 5,
        "length": 3,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "V",
        "row": 2,
        "col": 2,
        "length": 2,
        "color": "bg-lime-700"
      }
    ],
    "minimumMoves": 14,
    "solution": [
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "I",
        "distance": 1
      },
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "B",
        "distance": 2
      },
      {
        "carId": "J",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "H",
        "distance": -3
      },
      {
        "carId": "G",
        "distance": -2
      },
      {
        "carId": "D",
        "distance": -2
      },
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "I",
        "distance": 2
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "F",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 2
      }
    ],
    "metrics": {
      "participatingCars": 10,
      "reversalsInSolution": 0,
      "reversingCars": [],
      "dependencyDepth": 7,
      "dependencyChain": [
        "E",
        "I",
        "B",
        "J",
        "X",
        "H",
        "G",
        "D"
      ]
    },
    "requiresReversal": false
  },
  {
    "id": "standard-12",
    "tier": "STANDARD",
    "title": "穿過左側再回程",
    "focus": "X 的去程與回程會替不同車開路；先討論何時該把通道交還。",
    "dependency": "驗證解首移前置鏈：D → H → F → I → X → E；回移車：G、X",
    "hints": [
      "先沿 X 右側找出 I 車，再比較它們兩端缺少哪段空位。",
      "請比較 D、H、F 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 3,
        "col": 4,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 0,
        "col": 1,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 1,
        "col": 4,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 0,
        "col": 0,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 4,
        "col": 1,
        "length": 3,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 0,
        "col": 2,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 3,
        "col": 5,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 2,
        "col": 2,
        "length": 2,
        "color": "bg-slate-700"
      }
    ],
    "minimumMoves": 14,
    "solution": [
      {
        "carId": "D",
        "distance": -1
      },
      {
        "carId": "H",
        "distance": -3
      },
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "F",
        "distance": 2
      },
      {
        "carId": "I",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "E",
        "distance": 3
      },
      {
        "carId": "C",
        "distance": 4
      },
      {
        "carId": "X",
        "distance": -2
      },
      {
        "carId": "G",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": -3
      },
      {
        "carId": "G",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 9,
      "reversalsInSolution": 3,
      "reversingCars": [
        "G",
        "X"
      ],
      "dependencyDepth": 5,
      "dependencyChain": [
        "D",
        "H",
        "F",
        "I",
        "X",
        "E"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-1",
    "tier": "CHALLENGE",
    "title": "兩部橫車輪流借位",
    "focus": "兩部橫車會先後反向回移，和 X 交換通行空間。",
    "dependency": "驗證解首移前置鏈：C → J → B → I；回移車：C、F、X",
    "hints": [
      "先沿 X 右側找出 H、I 車，再比較它們兩端缺少哪段空位。",
      "請比較 C、J、B 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 1,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 4,
        "col": 3,
        "length": 3,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 3,
        "col": 1,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 0,
        "col": 3,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 3,
        "col": 3,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 0,
        "col": 1,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 1,
        "col": 3,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 1,
        "col": 4,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "V",
        "row": 4,
        "col": 2,
        "length": 2,
        "color": "bg-lime-700"
      }
    ],
    "minimumMoves": 15,
    "solution": [
      {
        "carId": "G",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "J",
        "distance": -4
      },
      {
        "carId": "D",
        "distance": 1
      },
      {
        "carId": "H",
        "distance": -1
      },
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "C",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "E",
        "distance": -3
      },
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "F",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "I",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 2
      }
    ],
    "metrics": {
      "participatingCars": 10,
      "reversalsInSolution": 4,
      "reversingCars": [
        "C",
        "F",
        "X"
      ],
      "dependencyDepth": 3,
      "dependencyChain": [
        "C",
        "J",
        "B",
        "I"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-2",
    "tier": "CHALLENGE",
    "title": "出口車道反覆借用",
    "focus": "需要多次暫借第 3 列，先比較每次借位會擋住誰。",
    "dependency": "驗證解首移前置鏈：H → I → D → E → X → C；回移車：D、E、I、X",
    "hints": [
      "先沿 X 右側找出 E、H 車，再比較它們兩端缺少哪段空位。",
      "請比較 H、I、D 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 3,
        "col": 2,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 0,
        "col": 1,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 0,
        "col": 2,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 1,
        "col": 2,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 3,
        "col": 3,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 3,
        "col": 0,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 2,
        "col": 4,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-slate-700"
      }
    ],
    "minimumMoves": 15,
    "solution": [
      {
        "carId": "H",
        "distance": 2
      },
      {
        "carId": "I",
        "distance": 1
      },
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "B",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": 3
      },
      {
        "carId": "D",
        "distance": 1
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "C",
        "distance": 4
      },
      {
        "carId": "X",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": 1
      },
      {
        "carId": "D",
        "distance": -3
      },
      {
        "carId": "I",
        "distance": -1
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 9,
      "reversalsInSolution": 6,
      "reversingCars": [
        "D",
        "E",
        "I",
        "X"
      ],
      "dependencyDepth": 5,
      "dependencyChain": [
        "H",
        "I",
        "D",
        "E",
        "X",
        "C"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-3",
    "tier": "CHALLENGE",
    "title": "先借右側，再還左側",
    "focus": "先整理右側讓車通過，再換左侧借位；完成前需歸還多個位置。",
    "dependency": "驗證解首移前置鏈：I → E → B → H → C → D → X → G；回移車：C、D、F、H、X",
    "hints": [
      "先沿 X 右側找出 B、D 車，再比較它們兩端缺少哪段空位。",
      "請比較 I、E、B 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 2,
        "col": 5,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 4,
        "col": 1,
        "length": 3,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 2,
        "col": 2,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 1,
        "col": 4,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 3,
        "col": 4,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 0,
        "col": 0,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 4,
        "col": 5,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "H",
        "row": 1,
        "col": 2,
        "length": 2,
        "color": "bg-slate-700"
      }
    ],
    "minimumMoves": 16,
    "solution": [
      {
        "carId": "I",
        "distance": -1
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "H",
        "distance": -2
      },
      {
        "carId": "F",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": 3
      },
      {
        "carId": "I",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "D",
        "distance": -3
      },
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "H",
        "distance": 1
      },
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 9,
      "reversalsInSolution": 6,
      "reversingCars": [
        "C",
        "D",
        "F",
        "H",
        "X"
      ],
      "dependencyDepth": 7,
      "dependencyChain": [
        "I",
        "E",
        "B",
        "H",
        "C",
        "D",
        "X",
        "G"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-4",
    "tier": "CHALLENGE",
    "title": "上方迴轉，下方重排",
    "focus": "上方長車、下方橫車與中間直車必須交替工作，無法一次全清空。",
    "dependency": "驗證解首移前置鏈：G → F → C → X → B → I；回移車：E、H、X",
    "hints": [
      "先沿 X 右側找出 C 車，再比較它們兩端缺少哪段空位。",
      "請比較 G、F、C 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 1,
        "col": 2,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 0,
        "col": 5,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 3,
        "col": 0,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 0,
        "col": 1,
        "length": 3,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 3,
        "col": 2,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "H",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "H",
        "row": 5,
        "col": 2,
        "length": 2,
        "color": "bg-lime-700"
      }
    ],
    "minimumMoves": 17,
    "solution": [
      {
        "carId": "J",
        "distance": 1
      },
      {
        "carId": "H",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": 1
      },
      {
        "carId": "D",
        "distance": 2
      },
      {
        "carId": "F",
        "distance": 2
      },
      {
        "carId": "E",
        "distance": 3
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "B",
        "distance": -4
      },
      {
        "carId": "X",
        "distance": -2
      },
      {
        "carId": "H",
        "distance": -2
      },
      {
        "carId": "I",
        "distance": -4
      },
      {
        "carId": "H",
        "distance": 2
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 10,
      "reversalsInSolution": 5,
      "reversingCars": [
        "E",
        "H",
        "X"
      ],
      "dependencyDepth": 5,
      "dependencyChain": [
        "G",
        "F",
        "C",
        "X",
        "B",
        "I"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-5",
    "tier": "CHALLENGE",
    "title": "兩側直車交替放行",
    "focus": "左右兩側的直車不能同時就位，請先把計畫拆成數個交接段。",
    "dependency": "驗證解首移前置鏈：G → E → D → C → H → B；回移車：B、E、G、X",
    "hints": [
      "先沿 X 右側找出 D、H 車，再比較它們兩端缺少哪段空位。",
      "請比較 G、E、D 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 4,
        "col": 5,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 1,
        "col": 3,
        "length": 3,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 1,
        "col": 2,
        "length": 3,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 5,
        "col": 2,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 3,
        "col": 3,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 2,
        "col": 5,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 0,
        "col": 1,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "V",
        "row": 3,
        "col": 0,
        "length": 2,
        "color": "bg-lime-700"
      },
      {
        "id": "K",
        "axis": "V",
        "row": 0,
        "col": 0,
        "length": 2,
        "color": "bg-indigo-700"
      }
    ],
    "minimumMoves": 19,
    "solution": [
      {
        "carId": "J",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": -1
      },
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "E",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": 2
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "H",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "K",
        "distance": 2
      },
      {
        "carId": "I",
        "distance": 3
      },
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": -3
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 3
      }
    ],
    "metrics": {
      "participatingCars": 11,
      "reversalsInSolution": 6,
      "reversingCars": [
        "B",
        "E",
        "G",
        "X"
      ],
      "dependencyDepth": 5,
      "dependencyChain": [
        "G",
        "E",
        "D",
        "C",
        "H",
        "B"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-6",
    "tier": "CHALLENGE",
    "title": "雙向中繼站",
    "focus": "中央中繼站會反覆換使用者，先規劃借用、通過與歸還。",
    "dependency": "驗證解首移前置鏈：J → F → E → H → K → C → G → I；回移車：C、E、G、H、K、X",
    "hints": [
      "先沿 X 右側找出 F、K 車，再比較它們兩端缺少哪段空位。",
      "請比較 J、F、E 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 0,
        "col": 1,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 3,
        "col": 0,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 0,
        "col": 3,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 2,
        "col": 3,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 4,
        "col": 0,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "H",
        "row": 1,
        "col": 0,
        "length": 3,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "H",
        "row": 5,
        "col": 1,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "H",
        "row": 4,
        "col": 3,
        "length": 2,
        "color": "bg-lime-700"
      },
      {
        "id": "K",
        "axis": "V",
        "row": 2,
        "col": 2,
        "length": 2,
        "color": "bg-indigo-700"
      }
    ],
    "minimumMoves": 20,
    "solution": [
      {
        "carId": "J",
        "distance": 1
      },
      {
        "carId": "F",
        "distance": 2
      },
      {
        "carId": "E",
        "distance": 2
      },
      {
        "carId": "H",
        "distance": 3
      },
      {
        "carId": "B",
        "distance": 3
      },
      {
        "carId": "K",
        "distance": -2
      },
      {
        "carId": "C",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": -4
      },
      {
        "carId": "I",
        "distance": -1
      },
      {
        "carId": "D",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "K",
        "distance": 4
      },
      {
        "carId": "C",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": 2
      },
      {
        "carId": "H",
        "distance": -3
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": 3
      }
    ],
    "metrics": {
      "participatingCars": 11,
      "reversalsInSolution": 8,
      "reversingCars": [
        "C",
        "E",
        "G",
        "H",
        "K",
        "X"
      ],
      "dependencyDepth": 7,
      "dependencyChain": [
        "J",
        "F",
        "E",
        "H",
        "K",
        "C",
        "G",
        "I"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-7",
    "tier": "CHALLENGE",
    "title": "九層前置接力",
    "focus": "前置關係長，還包含回移；先找最外層可以開工的小目標。",
    "dependency": "驗證解首移前置鏈：B → G → D → J → E → X → K → C → I → F；回移車：B、D、E、G、J、X",
    "hints": [
      "先沿 X 右側找出 E、F 車，再比較它們兩端缺少哪段空位。",
      "請比較 B、G、D 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 3,
        "col": 0,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 0,
        "col": 2,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 4,
        "col": 3,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 1,
        "col": 2,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 1,
        "col": 5,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 3,
        "col": 1,
        "length": 3,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 3,
        "col": 5,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "H",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "H",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-lime-700"
      },
      {
        "id": "K",
        "axis": "V",
        "row": 0,
        "col": 1,
        "length": 2,
        "color": "bg-indigo-700"
      }
    ],
    "minimumMoves": 21,
    "solution": [
      {
        "carId": "B",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": -1
      },
      {
        "carId": "D",
        "distance": -3
      },
      {
        "carId": "J",
        "distance": 2
      },
      {
        "carId": "H",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": 3
      },
      {
        "carId": "E",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "B",
        "distance": -4
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "J",
        "distance": -3
      },
      {
        "carId": "E",
        "distance": 2
      },
      {
        "carId": "G",
        "distance": -3
      },
      {
        "carId": "D",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": 3
      },
      {
        "carId": "K",
        "distance": 1
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "I",
        "distance": -1
      },
      {
        "carId": "F",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": 1
      }
    ],
    "metrics": {
      "participatingCars": 11,
      "reversalsInSolution": 9,
      "reversingCars": [
        "B",
        "D",
        "E",
        "G",
        "J",
        "X"
      ],
      "dependencyDepth": 9,
      "dependencyChain": [
        "B",
        "G",
        "D",
        "J",
        "E",
        "X",
        "K",
        "C",
        "I",
        "F"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-8",
    "tier": "CHALLENGE",
    "title": "中央通道反覆交換",
    "focus": "狹窄的中央通道需反覆交換，別把暫時離開出口當作錯誤。",
    "dependency": "驗證解首移前置鏈：K → H → G → B → X → I；回移車：B、C、E、G、H、I、X",
    "hints": [
      "先沿 X 右側找出 B、F、K、L 車，再比較它們兩端缺少哪段空位。",
      "請比較 K、H、G 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "V",
        "row": 1,
        "col": 2,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 3,
        "col": 2,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 5,
        "col": 1,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 3,
        "col": 0,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 2,
        "col": 5,
        "length": 3,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 0,
        "col": 2,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 0,
        "col": 0,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "H",
        "row": 5,
        "col": 3,
        "length": 3,
        "color": "bg-lime-700"
      },
      {
        "id": "K",
        "axis": "V",
        "row": 2,
        "col": 4,
        "length": 2,
        "color": "bg-indigo-700"
      },
      {
        "id": "L",
        "axis": "V",
        "row": 1,
        "col": 3,
        "length": 2,
        "color": "bg-stone-700"
      }
    ],
    "minimumMoves": 22,
    "solution": [
      {
        "carId": "K",
        "distance": 1
      },
      {
        "carId": "H",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": 1
      },
      {
        "carId": "D",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": 1
      },
      {
        "carId": "E",
        "distance": 1
      },
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "I",
        "distance": 3
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": 1
      },
      {
        "carId": "G",
        "distance": -3
      },
      {
        "carId": "L",
        "distance": -1
      },
      {
        "carId": "H",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": 3
      },
      {
        "carId": "I",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "J",
        "distance": -1
      },
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 1
      }
    ],
    "metrics": {
      "participatingCars": 12,
      "reversalsInSolution": 9,
      "reversingCars": [
        "B",
        "C",
        "E",
        "G",
        "H",
        "I",
        "X"
      ],
      "dependencyDepth": 5,
      "dependencyChain": [
        "K",
        "H",
        "G",
        "B",
        "X",
        "I"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-9",
    "tier": "CHALLENGE",
    "title": "出口前的雙重折返",
    "focus": "X 需要前後調整不只一次；每次折返都要替另一段計畫讓空間。",
    "dependency": "驗證解首移前置鏈：H → C → J → B → I → E → X → G → D；回移車：C、D、E、G、H、I、X",
    "hints": [
      "先沿 X 右側找出 H 車，再比較它們兩端缺少哪段空位。",
      "請比較 H、C、J 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 1,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 4,
        "col": 2,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 3,
        "col": 4,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 1,
        "col": 0,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 0,
        "col": 3,
        "length": 3,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 0,
        "col": 2,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 2,
        "col": 3,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "H",
        "row": 4,
        "col": 0,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "V",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-lime-700"
      }
    ],
    "minimumMoves": 23,
    "solution": [
      {
        "carId": "H",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": -3
      },
      {
        "carId": "J",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": 2
      },
      {
        "carId": "I",
        "distance": 1
      },
      {
        "carId": "H",
        "distance": 3
      },
      {
        "carId": "E",
        "distance": 2
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": 3
      },
      {
        "carId": "G",
        "distance": -2
      },
      {
        "carId": "C",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "E",
        "distance": -4
      },
      {
        "carId": "I",
        "distance": -1
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": 4
      },
      {
        "carId": "F",
        "distance": -2
      },
      {
        "carId": "D",
        "distance": -2
      },
      {
        "carId": "J",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": 4
      }
    ],
    "metrics": {
      "participatingCars": 10,
      "reversalsInSolution": 11,
      "reversingCars": [
        "C",
        "D",
        "E",
        "G",
        "H",
        "I",
        "X"
      ],
      "dependencyDepth": 8,
      "dependencyChain": [
        "H",
        "C",
        "J",
        "B",
        "I",
        "E",
        "X",
        "G",
        "D"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-10",
    "tier": "CHALLENGE",
    "title": "四角迴轉計畫",
    "focus": "車數較少仍需很多次借位，重點是反覆調度而不是一直加車。",
    "dependency": "驗證解首移前置鏈：I → E → H → B → G → D → C；回移車：C、D、E、F、H、I、X",
    "hints": [
      "先沿 X 右側找出 G 車，再比較它們兩端缺少哪段空位。",
      "請比較 I、E、H 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 1,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 4,
        "col": 3,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 1,
        "col": 0,
        "length": 3,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 3,
        "col": 2,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 3,
        "col": 0,
        "length": 2,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 2,
        "col": 4,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 4,
        "col": 2,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 3,
        "col": 1,
        "length": 2,
        "color": "bg-slate-700"
      }
    ],
    "minimumMoves": 24,
    "solution": [
      {
        "carId": "I",
        "distance": 1
      },
      {
        "carId": "F",
        "distance": 1
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "H",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": 2
      },
      {
        "carId": "C",
        "distance": 3
      },
      {
        "carId": "H",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "I",
        "distance": -4
      },
      {
        "carId": "F",
        "distance": -4
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": -2
      },
      {
        "carId": "H",
        "distance": 4
      },
      {
        "carId": "E",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "I",
        "distance": 2
      },
      {
        "carId": "C",
        "distance": -2
      },
      {
        "carId": "D",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": 2
      }
    ],
    "metrics": {
      "participatingCars": 9,
      "reversalsInSolution": 12,
      "reversingCars": [
        "C",
        "D",
        "E",
        "F",
        "H",
        "I",
        "X"
      ],
      "dependencyDepth": 6,
      "dependencyChain": [
        "I",
        "E",
        "H",
        "B",
        "G",
        "D",
        "C"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-11",
    "tier": "CHALLENGE",
    "title": "橫直交叉大換位",
    "focus": "橫車與直車要分批換位，先追蹤目前必須保留的空位。",
    "dependency": "驗證解首移前置鏈：K → I → J → B → E → G → F → D；回移車：C、D、F、G、I、J、K、X",
    "hints": [
      "先沿 X 右側找出 E、H 車，再比較它們兩端缺少哪段空位。",
      "請比較 K、I、J 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 4,
        "col": 3,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "H",
        "row": 0,
        "col": 2,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "V",
        "row": 4,
        "col": 1,
        "length": 2,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "V",
        "row": 2,
        "col": 4,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "H",
        "row": 1,
        "col": 0,
        "length": 3,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "V",
        "row": 0,
        "col": 4,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 2,
        "col": 5,
        "length": 3,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "H",
        "row": 3,
        "col": 2,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "V",
        "row": 4,
        "col": 2,
        "length": 2,
        "color": "bg-lime-700"
      },
      {
        "id": "K",
        "axis": "V",
        "row": 3,
        "col": 0,
        "length": 2,
        "color": "bg-indigo-700"
      }
    ],
    "minimumMoves": 25,
    "solution": [
      {
        "carId": "K",
        "distance": 1
      },
      {
        "carId": "I",
        "distance": -2
      },
      {
        "carId": "J",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "E",
        "distance": 2
      },
      {
        "carId": "G",
        "distance": 2
      },
      {
        "carId": "F",
        "distance": 3
      },
      {
        "carId": "C",
        "distance": 1
      },
      {
        "carId": "J",
        "distance": -2
      },
      {
        "carId": "I",
        "distance": 2
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "K",
        "distance": -4
      },
      {
        "carId": "D",
        "distance": -4
      },
      {
        "carId": "I",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": -2
      },
      {
        "carId": "J",
        "distance": 4
      },
      {
        "carId": "I",
        "distance": 2
      },
      {
        "carId": "H",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": 2
      },
      {
        "carId": "F",
        "distance": -2
      },
      {
        "carId": "C",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": 2
      }
    ],
    "metrics": {
      "participatingCars": 11,
      "reversalsInSolution": 11,
      "reversingCars": [
        "C",
        "D",
        "F",
        "G",
        "I",
        "J",
        "K",
        "X"
      ],
      "dependencyDepth": 7,
      "dependencyChain": [
        "K",
        "I",
        "J",
        "B",
        "E",
        "G",
        "F",
        "D"
      ]
    },
    "requiresReversal": true
  },
  {
    "id": "challenge-12",
    "tier": "CHALLENGE",
    "title": "左右支線合流",
    "focus": "左右支線最後要合流；先安排暫存位置，再處理出口前的最後阻擋。",
    "dependency": "驗證解首移前置鏈：H → G → L → K → D → J → B → C；回移車：B、C、D、E、H、I、J、K、X",
    "hints": [
      "先沿 X 右側找出 F、J、L 車，再比較它們兩端缺少哪段空位。",
      "請比較 H、G、L 的前後關係，想想哪部車要先得到空間。"
    ],
    "cars": [
      {
        "id": "X",
        "axis": "H",
        "row": 2,
        "col": 0,
        "length": 2,
        "color": "bg-rose-600",
        "target": true
      },
      {
        "id": "B",
        "axis": "H",
        "row": 3,
        "col": 0,
        "length": 2,
        "color": "bg-sky-700"
      },
      {
        "id": "C",
        "axis": "V",
        "row": 4,
        "col": 0,
        "length": 2,
        "color": "bg-amber-700"
      },
      {
        "id": "D",
        "axis": "H",
        "row": 1,
        "col": 0,
        "length": 3,
        "color": "bg-violet-700"
      },
      {
        "id": "E",
        "axis": "H",
        "row": 0,
        "col": 0,
        "length": 2,
        "color": "bg-emerald-700"
      },
      {
        "id": "F",
        "axis": "V",
        "row": 1,
        "col": 4,
        "length": 3,
        "color": "bg-orange-700"
      },
      {
        "id": "G",
        "axis": "H",
        "row": 4,
        "col": 4,
        "length": 2,
        "color": "bg-cyan-700"
      },
      {
        "id": "H",
        "axis": "V",
        "row": 3,
        "col": 3,
        "length": 2,
        "color": "bg-fuchsia-700"
      },
      {
        "id": "I",
        "axis": "V",
        "row": 0,
        "col": 3,
        "length": 2,
        "color": "bg-slate-700"
      },
      {
        "id": "J",
        "axis": "V",
        "row": 2,
        "col": 2,
        "length": 2,
        "color": "bg-lime-700"
      },
      {
        "id": "K",
        "axis": "V",
        "row": 0,
        "col": 5,
        "length": 2,
        "color": "bg-indigo-700"
      },
      {
        "id": "L",
        "axis": "V",
        "row": 2,
        "col": 5,
        "length": 2,
        "color": "bg-stone-700"
      }
    ],
    "minimumMoves": 25,
    "solution": [
      {
        "carId": "H",
        "distance": -1
      },
      {
        "carId": "G",
        "distance": -3
      },
      {
        "carId": "L",
        "distance": 2
      },
      {
        "carId": "K",
        "distance": 2
      },
      {
        "carId": "H",
        "distance": 2
      },
      {
        "carId": "I",
        "distance": 2
      },
      {
        "carId": "F",
        "distance": 2
      },
      {
        "carId": "E",
        "distance": 3
      },
      {
        "carId": "D",
        "distance": 3
      },
      {
        "carId": "J",
        "distance": -2
      },
      {
        "carId": "B",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "C",
        "distance": -4
      },
      {
        "carId": "G",
        "distance": -1
      },
      {
        "carId": "B",
        "distance": -1
      },
      {
        "carId": "X",
        "distance": -1
      },
      {
        "carId": "J",
        "distance": 4
      },
      {
        "carId": "B",
        "distance": 1
      },
      {
        "carId": "X",
        "distance": 1
      },
      {
        "carId": "C",
        "distance": 2
      },
      {
        "carId": "D",
        "distance": -3
      },
      {
        "carId": "K",
        "distance": -2
      },
      {
        "carId": "E",
        "distance": -2
      },
      {
        "carId": "I",
        "distance": -2
      },
      {
        "carId": "X",
        "distance": 3
      }
    ],
    "metrics": {
      "participatingCars": 12,
      "reversalsInSolution": 11,
      "reversingCars": [
        "B",
        "C",
        "D",
        "E",
        "H",
        "I",
        "J",
        "K",
        "X"
      ],
      "dependencyDepth": 7,
      "dependencyChain": [
        "H",
        "G",
        "L",
        "K",
        "D",
        "J",
        "B",
        "C"
      ]
    },
    "requiresReversal": true
  }
];
