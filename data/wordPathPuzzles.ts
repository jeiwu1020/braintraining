export type WordPathTier = 'BEGINNER' | 'STANDARD' | 'CHALLENGE';
export interface WordPathTarget {
  word: string;
  /** Shown instead of the answer at the standard tier. */
  clue: string;
  rationale: string;
  /** Curated examples, not a whitelist: any valid route spelling the target is accepted. */
  paths: number[][];
}
export interface WordPathPuzzle {
  id: string; tier: WordPathTier; title: string; columns: number; grid: string[];
  goal: 'TARGET_WORDS' | 'TWO_PATHS'; required: number; targets: WordPathTarget[];
}
const target = (word: string, clue: string, rationale: string, ...paths: number[][]): WordPathTarget => ({ word, clue, rationale, paths });

export const WORD_PATH_BANK: WordPathPuzzle[] = [
  {
    id: 'beginner-seasons', tier: 'BEGINNER', title: '春日學習', columns: 4,
    grid: ['春', '天', '開', '花', '樂', '學', '健', '生', '快', '習', '康', '活', '安', '平', '朋', '友'],
    goal: 'TARGET_WORDS', required: 4,
    targets: [target('春天', '一年中的季節', '春天是季節名稱。', [0, 1]), target('花開', '花朵綻放', '花開描述花朵綻放。', [3, 2]), target('快樂', '愉快的心情', '快樂表示愉快。', [8, 4]), target('學習', '練習新知識', '學習是獲得知識或技能。', [5, 9])],
  },
  {
    id: 'beginner-mealtime', tier: 'BEGINNER', title: '吃飯與休息', columns: 4,
    grid: ['喝', '水', '飯', '吃', '休', '花', '早', '朋', '息', '好', '安', '友', '茶', '心', '健', '康'],
    goal: 'TARGET_WORDS', required: 4,
    targets: [target('喝水', '補充水分', '喝水是日常補充水分的動作。', [0, 1]), target('吃飯', '享用餐點', '吃飯表示進食。', [3, 2]), target('休息', '暫時停下活動', '休息是暫停活動。', [4, 8]), target('早安', '早上的問候', '早安是早上的問候語。', [6, 10])],
  },
  {
    id: 'beginner-neighborhood', tier: 'BEGINNER', title: '散步看風景', columns: 4,
    grid: ['公', '園', '山', '高', '散', '心', '陽', '朋', '步', '水', '光', '友', '天', '花', '海', '大'],
    goal: 'TARGET_WORDS', required: 4,
    targets: [target('公園', '可以散步的地方', '公園是公共休閒空間。', [0, 1]), target('高山', '高大的山', '高山描述地形。', [3, 2]), target('散步', '慢慢走一走', '散步是輕鬆地步行。', [4, 8]), target('陽光', '太陽的光', '陽光是太陽發出的光。', [6, 10])],
  },
  {
    id: 'standard-growing', tier: 'STANDARD', title: '季節與互助', columns: 4,
    grid: ['春', '暖', '花', '友', '專', '心', '開', '樂', '習', '學', '健', '康', '助', '幫', '相', '互'],
    goal: 'TARGET_WORDS', required: 3,
    targets: [target('春暖花開', '春天變暖，花朵綻放。', '春暖花開描寫春天溫暖、花朵盛開的景象。', [0, 1, 2, 6]), target('專心學習', '集中注意力，認真學新事物。', '專心學習把集中注意與學習活動結合。', [4, 5, 9, 8]), target('互相幫助', '彼此有需要時，伸出援手。', '互相幫助是雙方彼此提供協助。', [15, 14, 13, 12])],
  },
  {
    id: 'standard-daily', tier: 'STANDARD', title: '身心與日常', columns: 4,
    grid: ['歡', '友', '朋', '健', '天', '活', '生', '康', '喜', '地', '和', '好', '習', '學', '心', '開'],
    goal: 'TARGET_WORDS', required: 3,
    targets: [target('健康生活', '讓身體保持良好狀態的日常方式。', '健康生活指照顧身體的日常生活方式。', [3, 7, 6, 5]), target('歡天喜地', '形容非常高興的樣子。', '歡天喜地形容十分高興、歡喜。', [0, 4, 8, 9]), target('開心學習', '懷著愉快的心情學新事物。', '開心學習指以愉快心情參與學習。', [15, 14, 13, 12])],
  },
  {
    id: 'standard-together', tier: 'STANDARD', title: '合作與作息', columns: 4,
    grid: ['起', '早', '睡', '早', '協', '力', '樂', '常', '心', '茶', '水', '足', '同', '花', '草', '知'],
    goal: 'TARGET_WORDS', required: 3,
    targets: [target('同心協力', '大家抱著共同目標，一起出力。', '同心協力指為共同目標合作努力。', [12, 8, 4, 5]), target('知足常樂', '懂得滿足，就容易保持快樂。', '知足常樂把滿足現況與常保快樂相連。', [15, 11, 7, 6]), target('早睡早起', '晚上及早休息，早晨及早起床的作息。', '早睡早起描述睡眠與起床時間較早的作息。', [3, 2, 1, 0])],
  },
  {
    id: 'challenge-shared-middle', tier: 'CHALLENGE', title: '同詞・分岔再相會', columns: 4,
    grid: ['同', '心', '朋', '花', '心', '協', '力', '開', '安', '力', '喜', '樂', '春', '暖', '生', '活'],
    goal: 'TWO_PATHS', required: 2,
    targets: [target('同心協力', '大家為共同目標出力。', '同心協力表示共同合作。兩條路可共用部分字格，但完整座標順序必須不同。', [0, 1, 5, 6], [0, 4, 5, 9])],
  },
  {
    id: 'challenge-shared-finish', tier: 'CHALLENGE', title: '同詞・不同出發點', columns: 4,
    grid: ['友', '樂', '暖', '春', '平', '開', '花', '天', '暖', '花', '心', '情', '春', '健', '安', '康'],
    goal: 'TWO_PATHS', required: 2,
    targets: [target('春暖花開', '春天回暖，花朵綻放。', '春暖花開描寫春天景象。不同出發點可走到同一個「開」。', [3, 2, 6, 5], [12, 8, 9, 5])],
  },
  {
    id: 'challenge-opposite-sides', tier: 'CHALLENGE', title: '同詞・從兩邊找路', columns: 4,
    grid: ['互', '相', '幫', '樂', '健', '心', '助', '安', '康', '生', '幫', '習', '天', '花', '相', '互'],
    goal: 'TWO_PATHS', required: 2,
    targets: [target('互相幫助', '彼此有需要時伸出援手。', '互相幫助表示彼此協助。兩條路從盤面的不同方向接近同一個「助」。', [0, 1, 2, 6], [15, 14, 10, 6])],
  },
];
