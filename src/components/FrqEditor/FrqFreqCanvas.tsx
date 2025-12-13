/**
 * 周波数キャンバス
 * 周波数グラフを表示し、選択範囲のハイライトと編集をサポート
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { Frq } from '../../lib/UtauFrq';
import { ArraySelection, getSelectedIndices } from '../../utils/ArraySelection';
import { FRQ_CONSTANTS } from '../../settings/frqConstants';
import { getFrqColors, FrqColors } from '../../settings/frqColors';
import { hzToCanvasY, hzToTone, getToneGridPositions, toneToHz } from '../../utils/FreqToTone';

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
}) => {
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);
  const internalYScrollRef = useRef<HTMLDivElement>(null);
  const internalXScrollRef = useRef<HTMLDivElement>(null);
  const graphScrollRef = yScrollContainerRef || internalYScrollRef;
  const outerScrollRef = xScrollContainerRef || internalXScrollRef;

  // frqのフレーム数から幅を計算
  const dataLength = frq.getLength();
  // 総サンプル数 = データ長 × perSamples
  const totalSamples = dataLength * frq.perSamples;
  // グラフ幅 = 総サンプル数 / SAMPLES_PER_PIXEL
  const graphWidth = Math.ceil(totalSamples / FRQ_CONSTANTS.SAMPLES_PER_PIXEL);
  // 横軸スケール = グラフ幅 / データ長（各データポイントのx座標計算用）
  const xStep = graphWidth / dataLength;
  
  // 周波数グラフは縦方向に十分な高さを確保（A0～A5の範囲を表示）
  // 1半音あたり20pxとして、A0(0)～A5(60半音) = 1200px
  const minTone = hzToTone(FRQ_CONSTANTS.MIN_HZ);
  const maxTone = hzToTone(FRQ_CONSTANTS.MAX_HZ);
  const toneRange = maxTone - minTone;
  const pixelsPerSemitone = 20; // 1半音あたりのピクセル数
  const height = Math.ceil(toneRange * pixelsPerSemitone);
  const labelWidth = FRQ_CONSTANTS.FREQ_LABEL_WIDTH;

  // Y軸スクロールの処理
  const handleYScroll = useCallback(() => {
    if (graphScrollRef.current) {
      const scrollTop = graphScrollRef.current.scrollTop;
      onYScroll?.(scrollTop);
    }
  }, [onYScroll, graphScrollRef]);

  // X軸スクロールの処理
  const handleXScroll = useCallback(() => {
    onXScroll?.();
  }, [onXScroll]);

  useEffect(() => {
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
        // スクロールバーを非表示にするが、スクロール機能は維持
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none', // Firefox用
        msOverflowStyle: 'none', // IE/Edge用
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
        }}
      >
        <canvas ref={graphCanvasRef} />
      </Box>
    </Box>
  );
};
