/**
 * 周波数表(Frq)描画用のカラーテーマ定義
 */

export interface FrqColors {
  /** 音量(amp)面グラフの塗りつぶし色 */
  ampFill: string;
  /** 音量(amp)面グラフの線の色 */
  ampStroke: string;
  /** 周波数(freq)折れ線の色 */
  freqStroke: string;
  /** 選択範囲の周波数折れ線の色 */
  freqSelected: string;
  /** トーン補助線の色 */
  gridLine: string;
  /** キャンバス背景色 */
  background: string;
  /** テキストの色 */
  text: string;
  /** 生成中の背景色 */
  generatingBackground: string;
  /** 平均周波数線の色 */
  averageFreqLine: string;
}

/**
 * ライトモード用のfrq描画カラー
 */
export const lightFrqColors: FrqColors = {
  ampFill: 'rgba(66, 165, 245, 0.2)',      // 青系の半透明
  ampStroke: 'rgba(66, 165, 245, 0.8)',    // 青系
  freqStroke: 'rgba(239, 83, 80, 0.8)',    // 赤系
  freqSelected: 'rgba(255, 193, 7, 1)',    // アンバー(選択時)
  gridLine: 'rgba(0, 0, 0, 0.15)',          // 濃いグレー
  background: '#eeeeee',                    // grey[200] - theme.tsと一致
  text: 'rgba(0, 0, 0, 0.87)',
  generatingBackground: 'rgba(245, 245, 245, 1)',
  averageFreqLine: 'rgba(255, 152, 0, 0.7)', // オレンジ系
};

/**
 * ダークモード用のfrq描画カラー
 */
export const darkFrqColors: FrqColors = {
  ampFill: 'rgba(100, 181, 246, 0.3)',     // 明るめの青系半透明
  ampStroke: 'rgba(100, 181, 246, 0.9)',   // 明るめの青系
  freqStroke: 'rgba(244, 143, 177, 0.9)',  // ピンク系
  freqSelected: 'rgba(255, 213, 79, 1)',   // 明るめのアンバー
  gridLine: 'rgba(255, 255, 255, 0.2)',   // 濃い白
  background: '#37474f',                   // blueGrey[900] - theme.tsと一致
  text: 'rgba(255, 255, 255, 0.87)',
  generatingBackground: 'rgba(30, 30, 30, 1)',
  averageFreqLine: 'rgba(255, 167, 38, 0.8)', // 明るいオレンジ系
};

/**
 * モードに応じたfrq描画カラーを取得
 * @param mode テーマモード
 * @returns FrqColorsオブジェクト
 */
export function getFrqColors(mode: 'light' | 'dark'): FrqColors {
  return mode === 'light' ? lightFrqColors : darkFrqColors;
}
