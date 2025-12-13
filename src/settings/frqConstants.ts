/**
 * 周波数表(Frq)編集機能に関する定数定義
 */

/**
 * 周波数表編集関連の定数
 */
export const FRQ_CONSTANTS = {
  /** 表示する最小周波数(Hz) - A1 */
  MIN_HZ: 55,
  
  /** 表示する最大周波数(Hz) - A5 */
  MAX_HZ: 880,
  
  /** トーン補助線の間隔(半音単位) - 1(1半音ごと) */
  TONE_GRID_STEP: 1,
  
  /** Retinaディスプレイ対応のためのキャンバススケール */
  CANVAS_SCALE: 2,
  
  /** 一覧画面のデフォルト表示件数(1ページあたり) */
  DEFAULT_ITEMS_PER_PAGE: 5,
  
  /** サムネイルの最小高さ(px) */
  MIN_THUMBNAIL_HEIGHT: 100,
  
  /** 個別編集画面の周波数キャンバスの高さ比率(%) */
  FREQ_CANVAS_HEIGHT_RATIO: 40,
  
  /** 個別編集画面の音量キャンバスの高さ比率(%) */
  AMP_CANVAS_HEIGHT_RATIO: 10,
  
  /** ボタンエリアの高さ(px) */
  TOOLBAR_HEIGHT: 64,
  
  /** 横軸スケール - 1ピクセルあたり何サンプルを表すか */
  SAMPLES_PER_PIXEL: 100,
  
  /** 周波数軸ラベルの幅(px) */
  FREQ_LABEL_WIDTH: 50,
  
  /** 周波数倍率の選択肢 */
  FREQ_MULTIPLIERS: [3, 2, 0.5, 0.333333] as const,
  
  /** 平均周波数計算時の無効値(0Hz)のスキップ */
  SKIP_ZERO_FREQ_IN_AVERAGE: true,
} as const;

/**
 * アイコンボタンのアクション種別
 */
export enum FrqEditorAction {
  MULTIPLY_2 = 'multiply_2',
  MULTIPLY_3 = 'multiply_3',
  DIVIDE_2 = 'divide_2',
  DIVIDE_3 = 'divide_3',
  SET_FROM_AVERAGE = 'set_from_average',
  SET_AVERAGE_TO_GLOBAL = 'set_average_to_global',
  LINEAR_INTERPOLATE = 'linear_interpolate',
  SAVE = 'save',
  BACK = 'back',
}
