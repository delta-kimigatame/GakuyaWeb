/**
 * 周波数表(Frq)描画用のカラーテーマ定義
 * theme.tsのMUIカラーパレット(deepPurple/red)と整合性を持つ
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
  /** サムネイル枠線の色 */
  thumbnailBorder: string;
  /** サムネイルホバー時の枠線の色 */
  thumbnailBorderHover: string;
}

/**
 * ライトモード用のfrq描画カラー
 * theme.ts: primary=deepPurple[300], secondary=red[300], background=grey[200]
 */
export const lightFrqColors: FrqColors = {
  ampFill: 'rgba(179, 157, 219, 0.2)',     // deepPurple[200]の半透明
  ampStroke: 'rgba(149, 117, 205, 0.8)',   // deepPurple[300]系
  freqStroke: 'rgba(229, 115, 115, 0.8)',  // red[300]系
  freqSelected: 'rgba(206, 147, 216, 1)',  // deepPurple[200] - 選択時
  gridLine: 'rgba(0, 0, 0, 0.12)',         // grey系の薄いグリッド
  background: '#eeeeee',                   // grey[200] - theme.tsと一致
  text: 'rgba(0, 0, 0, 0.87)',            // grey[900]系
  generatingBackground: 'rgba(245, 245, 245, 1)',
  averageFreqLine: 'rgba(239, 83, 80, 0.6)', // red[500]系 - アクセント
  thumbnailBorder: '#e0e0e0',              // grey[300]
  thumbnailBorderHover: '#9575cd',         // deepPurple[300]
};

/**
 * ダークモード用のfrq描画カラー
 * theme.ts: primary=deepPurple[300], secondary=red[300], background=blueGrey[900]
 */
export const darkFrqColors: FrqColors = {
  ampFill: 'rgba(179, 157, 219, 0.25)',    // deepPurple[200]の半透明
  ampStroke: 'rgba(179, 157, 219, 0.9)',   // deepPurple[200]系 - 明るめ
  freqStroke: 'rgba(229, 115, 115, 0.9)',  // red[300]系
  freqSelected: 'rgba(206, 147, 216, 1)',  // deepPurple[200] - 選択時
  gridLine: 'rgba(255, 255, 255, 0.15)',   // 白系の薄いグリッド
  background: '#37474f',                   // blueGrey[900] - theme.tsと一致
  text: 'rgba(255, 255, 255, 0.87)',      // white系
  generatingBackground: 'rgba(38, 50, 56, 1)', // blueGrey[900]より暗め
  averageFreqLine: 'rgba(239, 83, 80, 0.7)', // red[500]系 - アクセント
  thumbnailBorder: '#455a64',              // blueGrey[700]
  thumbnailBorderHover: '#b39ddb',         // deepPurple[200]
};

/**
 * モードに応じたfrq描画カラーを取得
 * @param mode テーマモード
 * @returns FrqColorsオブジェクト
 */
export function getFrqColors(mode: 'light' | 'dark'): FrqColors {
  return mode === 'light' ? lightFrqColors : darkFrqColors;
}
