/**
 * 周波数キャンバス
 * 周波数グラフを表示し、選択範囲のハイライトと編集をサポート
 */

import React from 'react';
import { Box } from '@mui/material';
import { Frq } from '../../lib/UtauFrq';
import { ArraySelection, getSelectedIndices } from '../../utils/ArraySelection';
import { FRQ_CONSTANTS } from '../../settings/frqConstants';
import { getFrqColors, FrqColors } from '../../settings/frqColors';
import { hzToCanvasY, hzToTone, getToneGridPositions, toneToHz } from '../../utils/FreqToTone';
import { Log } from '../../lib/Logging';

/**
 * トーングリッド線の描画（スクロール部分）
 */
function drawToneGridLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: FrqColors
): void {
  const minTone = hzToTone(FRQ_CONSTANTS.MIN_HZ);
  const maxTone = hzToTone(FRQ_CONSTANTS.MAX_HZ);
  const positions = getToneGridPositions(minTone, maxTone, FRQ_CONSTANTS.TONE_GRID_STEP);
  
  ctx.strokeStyle = colors.gridLine;
  ctx.lineWidth = 1;
  
  for (const tone of positions) {
    const hz = toneToHz(tone);
    const y = hzToCanvasY(hz, height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * 周波数折れ線グラフの描画
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
  
  // ファイル全体の平均周波数を示す横線
  const avgFreq = frq.frqAverage;
  if (avgFreq > 0) {
    const avgY = hzToCanvasY(avgFreq, height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
    ctx.strokeStyle = colors.averageFreqLine;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // 破線
    ctx.beginPath();
    ctx.moveTo(0, avgY);
    ctx.lineTo(width, avgY);
    ctx.stroke();
    ctx.setLineDash([]); // 破線をリセット
  }
  
  // 通常の周波数線
  ctx.strokeStyle = colors.freqStroke;
  ctx.lineWidth = 2;
  
  for (let i = 0; i < dataLength; i++) {
    if (selectedSet.has(i)) continue;
    
    const freq = freqData[i];
    
    if (freq <= 0) continue;
    
    const x = i * xStep;
    const y = hzToCanvasY(freq, height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
    
    const prevFreq = i > 0 ? freqData[i - 1] : 0;
    const isPrevSelected = i > 0 && selectedSet.has(i - 1);
    
    if (prevFreq <= 0 || isPrevSelected) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    const isLast = i === dataLength - 1;
    const nextFreq = !isLast ? freqData[i + 1] : 0;
    const isNextSelected = !isLast && selectedSet.has(i + 1);
    
    if (isLast || nextFreq <= 0 || isNextSelected) {
      ctx.stroke();
    }
  }
  
  // 選択範囲の描画：連続した閉区間ごとに処理
  if (selectedIndices.length > 0) {
    // 選択インデックスを連続した区間に分割
    const ranges: Array<{ start: number; end: number }> = [];
    let rangeStart = selectedIndices[0];
    
    for (let idx = 1; idx <= selectedIndices.length; idx++) {
      const current = selectedIndices[idx];
      const prev = selectedIndices[idx - 1];
      
      // 区間が途切れた場合、または最後の要素の場合
      if (idx === selectedIndices.length || current !== prev + 1) {
        ranges.push({ start: rangeStart, end: prev });
        if (idx < selectedIndices.length) {
          rangeStart = current;
        }
      }
    }
    
    // 各区間の背景を描画
    ctx.fillStyle = colors.selectionBackground;
    for (const range of ranges) {
      const startX = range.start * xStep;
      const endX = (range.end + 1) * xStep; // 右端は次のフレームの開始位置まで
      const rectWidth = endX - startX;
      
      // 選択範囲が1点のみの場合は縦線として描画
      if (range.start === range.end) {
        const lineWidth = Math.max(2, xStep / 2); // 最低2px、最大xStep/2
        ctx.fillRect(startX - lineWidth / 2, 0, lineWidth, height);
      } else {
        // 複数点の場合は範囲全体を塗りつぶし
        ctx.fillRect(startX, 0, rectWidth, height);
      }
    }
    
    // 選択範囲の周波数線を描画
    ctx.strokeStyle = colors.freqSelected;
    ctx.lineWidth = 3;
    
    // 各区間を描画
    for (const range of ranges) {
      // 始点の1つ前から始点までは通常色で描画（ポルタメント）
      const startPrev = range.start - 1;
      if (startPrev >= 0 && freqData[startPrev] > 0 && freqData[range.start] > 0) {
        ctx.save();
        ctx.strokeStyle = colors.freqStroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const xPrev = startPrev * xStep;
        const yPrev = hzToCanvasY(freqData[startPrev], height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
        const xStart = range.start * xStep;
        const yStart = hzToCanvasY(freqData[range.start], height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
        ctx.moveTo(xPrev, yPrev);
        ctx.lineTo(xStart, yStart);
        ctx.stroke();
        ctx.restore();
      }
      
      // 選択範囲を選択色で描画（値0の点で線を切る）
      ctx.beginPath();
      let hasDrawn = false;
      
      for (let i = range.start; i <= range.end; i++) {
        const freq = freqData[i];
        
        if (freq <= 0) {
          // 値0の点では線を切る
          if (hasDrawn) {
            ctx.stroke();
            hasDrawn = false;
          }
          continue;
        }
        
        const x = i * xStep;
        const y = hzToCanvasY(freq, height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
        
        if (!hasDrawn) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          hasDrawn = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      if (hasDrawn) {
        ctx.stroke();
      }
      
      // 終点から終点+1までは通常色で描画（ポルタメント）
      const endNext = range.end + 1;
      if (endNext < dataLength && freqData[range.end] > 0 && freqData[endNext] > 0) {
        ctx.save();
        ctx.strokeStyle = colors.freqStroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const xEnd = range.end * xStep;
        const yEnd = hzToCanvasY(freqData[range.end], height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
        const xNext = endNext * xStep;
        const yNext = hzToCanvasY(freqData[endNext], height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
        ctx.moveTo(xEnd, yEnd);
        ctx.lineTo(xNext, yNext);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

export interface FrqFreqCanvasProps {
  /** 表示するfrqデータ */
  frq: Frq;
  /** 選択状態 */
  selection: ArraySelection;
  /** テーマモード */
  mode: 'light' | 'dark';
  /** Y軸スクロール変更時のコールバック */
  onYScroll?: (scrollTop: number) => void;
  /** X軸スクロール変更時のコールバック */
  onXScroll?: () => void;
  /** Y軸スクロールコンテナのref（初期スクロール位置設定用） */
  yScrollContainerRef?: React.RefObject<HTMLDivElement>;
  /** X軸スクロールコンテナのref（音量グラフとの同期用） */
  xScrollContainerRef?: React.RefObject<HTMLDivElement>;
  /** 短形選択モードが有効か */
  isRangeSelectionMode?: boolean;
  /** 範囲選択のコールバック（開始インデックス、終了インデックス） */
  onRangeSelect?: (startIndex: number, endIndex: number) => void;
  /** 範囲選択完了時のコールバック */
  onRangeSelectComplete?: (startIndex: number, endIndex: number) => void;
}

/**
 * 周波数キャンバス（グラフ部分のみ、ラベルは別コンポーネント）
 */
export const FrqFreqCanvas: React.FC<FrqFreqCanvasProps> = ({
  frq,
  selection,
  mode,
  onYScroll,
  onXScroll,
  yScrollContainerRef,
  xScrollContainerRef,
  isRangeSelectionMode = false,
  onRangeSelect,
  onRangeSelectComplete,
}) => {
  const graphCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const internalYScrollRef = React.useRef<HTMLDivElement>(null);
  const internalXScrollRef = React.useRef<HTMLDivElement>(null);
  const graphScrollRef = yScrollContainerRef || internalYScrollRef;
  const outerScrollRef = xScrollContainerRef || internalXScrollRef;
  
  // 範囲選択用の状態
  const touchStartIndexRef = React.useRef<number | null>(null);

  // frqのフレーム数から幅を計算
  const dataLength = frq.getLength();
  // 総サンプル数 = データ長 × perSamples
  const totalSamples = dataLength * frq.perSamples;
  // グラフ幅 = 総サンプル数 / SAMPLES_PER_PIXEL
  const graphWidth = Math.ceil(totalSamples / FRQ_CONSTANTS.SAMPLES_PER_PIXEL);
  const xStep = graphWidth / dataLength;
  
  const minTone = hzToTone(FRQ_CONSTANTS.MIN_HZ);
  const maxTone = hzToTone(FRQ_CONSTANTS.MAX_HZ);
  const toneRange = maxTone - minTone;
  const pixelsPerSemitone = 20;
  const height = Math.ceil(toneRange * pixelsPerSemitone);

  // Y軸スクロールの処理
  const handleYScroll = React.useCallback(() => {
    if (graphScrollRef.current) {
      const scrollTop = graphScrollRef.current.scrollTop;
      onYScroll?.(scrollTop);
    }
  }, [onYScroll, graphScrollRef]);

  // X軸スクロールの処理
  const handleXScroll = React.useCallback(() => {
    onXScroll?.();
  }, [onXScroll]);

  // 範囲選択用のタッチイベントハンドラ
  const handleTouchStart = React.useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isRangeSelectionMode || e.touches.length !== 1) return;
    
    e.preventDefault(); // スクロールを無効化
    e.stopPropagation(); // 親要素へのイベント伝播を停止
    const touch = e.touches[0];
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const index = Math.floor(x / xStep);
    
    if (index >= 0 && index < dataLength) {
      touchStartIndexRef.current = index;
      Log.debug(`範囲選択開始: インデックス ${index}`, 'FrqFreqCanvas');
    }
  }, [isRangeSelectionMode, xStep, dataLength]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isRangeSelectionMode || touchStartIndexRef.current === null || e.touches.length !== 1) return;
    
    e.preventDefault(); // スクロールを無効化
    e.stopPropagation(); // 親要素へのイベント伝播を停止
    const touch = e.touches[0];
    const canvas = graphCanvasRef.current;
    if (!canvas || !onRangeSelect) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const endIndex = Math.floor(x / xStep);
    
    if (endIndex >= 0 && endIndex < dataLength && touchStartIndexRef.current !== null) {
      const startIndex = Math.min(touchStartIndexRef.current, endIndex);
      const finalEndIndex = Math.max(touchStartIndexRef.current, endIndex);
      onRangeSelect(startIndex, finalEndIndex);
    }
  }, [isRangeSelectionMode, xStep, dataLength, onRangeSelect]);

  const handleTouchEnd = React.useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isRangeSelectionMode || touchStartIndexRef.current === null) return;
    
    e.preventDefault();
    e.stopPropagation(); // 親要素へのイベント伝播を停止
    const canvas = graphCanvasRef.current;
    if (!canvas || !onRangeSelect) {
      touchStartIndexRef.current = null;
      return;
    }
    
    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const endIndex = Math.floor(x / xStep);
    
    if (endIndex >= 0 && endIndex < dataLength && touchStartIndexRef.current !== null) {
      const startIndex = Math.min(touchStartIndexRef.current, endIndex);
      const finalEndIndex = Math.max(touchStartIndexRef.current, endIndex);
      onRangeSelect(startIndex, finalEndIndex);
      Log.debug(`範囲選択完了: ${startIndex} - ${finalEndIndex}`, 'FrqFreqCanvas');
      
      // 選択完了を通知
      onRangeSelectComplete?.(startIndex, finalEndIndex);
    }
    
    touchStartIndexRef.current = null;
  }, [isRangeSelectionMode, xStep, dataLength, onRangeSelect, onRangeSelectComplete]);

  React.useEffect(() => {
    const graphCanvas = graphCanvasRef.current;
    if (!graphCanvas) return;

    const graphCtx = graphCanvas.getContext('2d');
    if (!graphCtx) return;

    const scale = FRQ_CONSTANTS.CANVAS_SCALE;
    
    // グラフCanvas設定
    graphCanvas.width = graphWidth * scale;
    graphCanvas.height = height * scale;
    graphCanvas.style.width = `${graphWidth}px`;
    graphCanvas.style.height = `${height}px`;
    graphCtx.scale(scale, scale);

    // 描画
    const colors = getFrqColors(mode);
    const selectedIndices = getSelectedIndices(selection);
    
    // グラフ部分の描画
    graphCtx.clearRect(0, 0, graphWidth, height);
    graphCtx.fillStyle = colors.background;
    graphCtx.fillRect(0, 0, graphWidth, height);
    drawToneGridLines(graphCtx, graphWidth, height, colors);
    drawFreqGraph(graphCtx, frq, graphWidth, height, xStep, colors, selectedIndices);
  }, [frq, selection, mode, graphWidth, height, xStep]);

  return (
    <Box 
      ref={outerScrollRef}
      onScroll={handleXScroll}
      sx={{ 
        width: '100%',
        height: '100%', 
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch', // iOS慣性スクロール
      }}
    >
      <Box
        ref={graphScrollRef}
        onScroll={handleYScroll}
        sx={{ 
          width: graphWidth,
          height: '100%', 
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch', // iOS慣性スクロール
        }}
      >
        <canvas
          ref={graphCanvasRef}
          onTouchStart={isRangeSelectionMode ? handleTouchStart : undefined}
          onTouchMove={isRangeSelectionMode ? handleTouchMove : undefined}
          onTouchEnd={isRangeSelectionMode ? handleTouchEnd : undefined}
          style={{ 
            cursor: isRangeSelectionMode ? 'crosshair' : 'default',
            touchAction: isRangeSelectionMode ? 'none' : 'auto'
          }}
        />
      </Box>
    </Box>
  );
};
