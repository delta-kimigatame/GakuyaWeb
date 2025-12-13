/**
 * 音量キャンバス
 * 音量グラフを表示（参考情報として、選択範囲のハイライトなし）
 */

import React from 'react';
import { Box } from '@mui/material';
import { Frq } from '../../lib/UtauFrq';
import { FRQ_CONSTANTS } from '../../settings/frqConstants';
import { getFrqColors, FrqColors } from '../../settings/frqColors';

/**
 * 音量面グラフの描画
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

export interface FrqAmpCanvasProps {
  /** 表示するfrqデータ */
  frq: Frq;
  /** テーマモード */
  mode: 'light' | 'dark';
  /** 表示領域の高さ */
  containerHeight: number;
}

/**
 * 音量キャンバス（選択範囲ハイライトなし）
 */
export const FrqAmpCanvas: React.FC<FrqAmpCanvasProps> = ({
  frq,
  mode,
  containerHeight,
}) => {
  const graphCanvasRef = React.useRef<HTMLCanvasElement>(null);

  // frqのフレーム数から幅を計算
  const dataLength = frq.getLength();
  // 総サンプル数 = データ長 × perSamples
  const totalSamples = dataLength * frq.perSamples;
  // グラフ幅 = 総サンプル数 / SAMPLES_PER_PIXEL
  const graphWidth = Math.ceil(totalSamples / FRQ_CONSTANTS.SAMPLES_PER_PIXEL);
  // 横軸スケール = グラフ幅 / データ長（各データポイントのx座標計算用）
  const xStep = graphWidth / dataLength;
  
  // 音量グラフは表示領域の高さに合わせる
  const height = containerHeight;
  const labelWidth = FRQ_CONSTANTS.FREQ_LABEL_WIDTH;

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
    
    graphCtx.clearRect(0, 0, graphWidth, height);
    graphCtx.fillStyle = colors.background;
    graphCtx.fillRect(0, 0, graphWidth, height);
    drawAmpGraph(graphCtx, frq, graphWidth, height, xStep, colors);
  }, [frq, mode, graphWidth, height, xStep]);

  return (
    <Box sx={{ display: 'flex', width: graphWidth, height }}>
      <canvas ref={graphCanvasRef} />
    </Box>
  );
};
