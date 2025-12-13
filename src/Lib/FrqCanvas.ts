/**
 * 周波数表(Frq)のCanvas描画ロジック
 */

import { Frq } from './UtauFrq';
import { FrqColors, getFrqColors } from '../settings/frqColors';
import { FRQ_CONSTANTS } from '../settings/frqConstants';
import { hzToCanvasY, hzToTone, getToneGridPositions, toneToNoteName } from '../utils/FreqToTone';
import { ArraySelection, getSelectedIndices } from '../utils/ArraySelection';

/**
 * サムネイル用のfrq描画(amp面グラフ + freq折れ線を重ねて描画)
 * @param ctx Canvasの2Dコンテキスト
 * @param frq Frqオブジェクト
 * @param width 描画幅(論理ピクセル)
 * @param height 描画高さ(論理ピクセル)
 * @param colors カラーテーマ
 */
export function drawFrqThumbnail(
  ctx: CanvasRenderingContext2D,
  frq: Frq,
  width: number,
  height: number,
  colors: FrqColors
): void {
  ctx.clearRect(0, 0, width, height);
  
  // 背景
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);
  
  const dataLength = frq.getLength();
  if (dataLength === 0) return;
  
  // サムネイルは幅100%で時間等価ではない
  const xStep = width / dataLength;
  
  // Amp面グラフの描画
  drawAmpGraph(ctx, frq, width, height, xStep, colors);
  
  // Freq折れ線の描画
  drawFreqGraph(ctx, frq, width, height, xStep, colors, []);
}

/**
 * 音量(amp)面グラフの描画
 * @param ctx Canvasの2Dコンテキスト
 * @param frq Frqオブジェクト
 * @param width キャンバス幅
 * @param height キャンバス高さ
 * @param xStep X軸のステップ幅
 * @param colors カラーテーマ
 */
function drawAmpGraph(
  ctx: CanvasRenderingContext2D,
  frq: Frq,
  width: number,
  height: number,
  xStep: number,
  colors: FrqColors
): void {
  const dataLength = frq.getLength();
  const ampData = frq.amp;
  
  // 最大音量を求める
  let maxAmp = 0;
  for (let i = 0; i < dataLength; i++) {
    maxAmp = Math.max(maxAmp, ampData[i]);
  }
  
  if (maxAmp === 0) return;
  
  // 面グラフのパスを作成
  ctx.beginPath();
  ctx.moveTo(0, height);
  
  for (let i = 0; i < dataLength; i++) {
    const x = i * xStep;
    const y = height - (ampData[i] / maxAmp) * height;
    ctx.lineTo(x, y);
  }
  
  ctx.lineTo(width, height);
  ctx.closePath();
  
  // 塗りつぶし
  ctx.fillStyle = colors.ampFill;
  ctx.fill();
  
  // 線描画
  ctx.strokeStyle = colors.ampStroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * 周波数(freq)折れ線グラフの描画
 * @param ctx Canvasの2Dコンテキスト
 * @param frq Frqオブジェクト
 * @param width キャンバス幅
 * @param height キャンバス高さ
 * @param xStep X軸のステップ幅
 * @param colors カラーテーマ
 * @param selectedIndices 選択されているインデックス(ハイライト用)
 */
function drawFreqGraph(
  ctx: CanvasRenderingContext2D,
  frq: Frq,
  width: number,
  height: number,
  xStep: number,
  colors: FrqColors,
  selectedIndices: number[]
): void {
  const dataLength = frq.getLength();
  const freqData = frq.frq;
  const selectedSet = new Set(selectedIndices);
  
  // 通常の周波数線
  ctx.strokeStyle = colors.freqStroke;
  ctx.lineWidth = 2;
  
  for (let i = 0; i < dataLength; i++) {
    if (selectedSet.has(i)) continue;
    
    const freq = freqData[i];
    
    // 周波数が0の場合はスキップ（描画を途切れさせる）
    if (freq <= 0) continue;
    
    const x = i * xStep;
    const y = hzToCanvasY(freq, height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
    
    // 前のポイントが0または選択範囲の場合、新しいパスを開始
    const prevFreq = i > 0 ? freqData[i - 1] : 0;
    const isPrevSelected = i > 0 && selectedSet.has(i - 1);
    
    if (prevFreq <= 0 || isPrevSelected) {
      // 新しいパスを開始
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      // 前のポイントから線を引く
      ctx.lineTo(x, y);
    }
    
    // 次のポイントが0または選択範囲または最後の場合、ここで描画
    const isLast = i === dataLength - 1;
    const nextFreq = !isLast ? freqData[i + 1] : 0;
    const isNextSelected = !isLast && selectedSet.has(i + 1);
    
    if (isLast || nextFreq <= 0 || isNextSelected) {
      ctx.stroke();
    }
  }
  
  // 選択範囲の周波数線
  if (selectedIndices.length > 0) {
    ctx.strokeStyle = colors.freqSelected;
    ctx.lineWidth = 3;
    
    for (let idx = 0; idx < selectedIndices.length; idx++) {
      const i = selectedIndices[idx];
      if (i < 0 || i >= dataLength) continue;
      
      const freq = freqData[i];
      
      // 周波数が0の場合はスキップ（描画を途切れさせる）
      if (freq <= 0) continue;
      
      const x = i * xStep;
      const y = hzToCanvasY(freq, height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
      
      // 前のポイントが0または選択範囲外の場合、新しいパスを開始
      const prevIdx = idx > 0 ? selectedIndices[idx - 1] : -1;
      const isPrevAdjacent = prevIdx === i - 1;
      const prevFreq = isPrevAdjacent && prevIdx >= 0 ? freqData[prevIdx] : 0;
      
      if (!isPrevAdjacent || prevFreq <= 0) {
        // 新しいパスを開始
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        // 前のポイントから線を引く
        ctx.lineTo(x, y);
      }
      
      // 次のポイントが0または選択範囲外または最後の場合、ここで描画
      const isLast = idx === selectedIndices.length - 1;
      const nextIdx = !isLast ? selectedIndices[idx + 1] : -1;
      const isNextAdjacent = nextIdx === i + 1;
      const nextFreq = isNextAdjacent && nextIdx >= 0 ? freqData[nextIdx] : 0;
      
      if (isLast || !isNextAdjacent || nextFreq <= 0) {
        ctx.stroke();
      }
    }
  }
}

/**
 * トーン補助線の描画(A0～A5の12半音ごと)
 * @param ctx Canvasの2Dコンテキスト
 * @param height キャンバス高さ
 * @param colors カラーテーマ
 */
export function drawToneGrid(
  ctx: CanvasRenderingContext2D,
  height: number,
  colors: FrqColors
): void {
  const minTone = hzToTone(FRQ_CONSTANTS.MIN_HZ);
  const maxTone = hzToTone(FRQ_CONSTANTS.MAX_HZ);
  const positions = getToneGridPositions(minTone, maxTone, FRQ_CONSTANTS.TONE_GRID_STEP);
  
  ctx.strokeStyle = colors.gridLine;
  ctx.lineWidth = 1;
  ctx.font = '12px sans-serif';
  ctx.fillStyle = colors.text;
  
  for (const tone of positions) {
    const hz = Math.pow(2, tone / 12) * FRQ_CONSTANTS.MIN_HZ;
    const y = hzToCanvasY(hz, height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
    
    // 横線
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
    
    // ラベル
    const noteName = toneToNoteName(tone);
    ctx.fillText(noteName, 5, y - 5);
  }
}

/**
 * ファイル名テキストの描画
 * @param ctx Canvasの2Dコンテキスト
 * @param fileName ファイル名
 * @param width キャンバス幅(論理ピクセル)
 * @param height キャンバス高さ(論理ピクセル)
 * @param colors カラーテーマ
 */
export function drawFileName(
  ctx: CanvasRenderingContext2D,
  fileName: string,
  width: number,
  height: number,
  colors: FrqColors
): void {
  ctx.font = '14px sans-serif';
  ctx.fillStyle = colors.text;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  
  // 背景の半透明ボックス
  const padding = 8;
  const textMetrics = ctx.measureText(fileName);
  const boxWidth = textMetrics.width + padding * 2;
  const boxHeight = 14 + padding * 2;
  
  ctx.fillStyle = colors.background + 'cc'; // 80%不透明
  ctx.fillRect(padding, padding, boxWidth, boxHeight);
  
  // テキスト
  ctx.fillStyle = colors.text;
  ctx.fillText(fileName, padding * 2, padding * 2);
}
