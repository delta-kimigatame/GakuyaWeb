/**
 * 周波数キャンバスのラベル部分
 * Y軸の音名ラベルを表示（固定表示）
 */

import React from 'react';
import { Box } from '@mui/material';
import { FRQ_CONSTANTS } from '../../settings/frqConstants';
import { getFrqColors, FrqColors } from '../../settings/frqColors';
import { hzToCanvasY, hzToTone, getToneGridPositions, toneToNoteName, toneToHz } from '../../utils/FreqToTone';

/**
 * トーンラベルの描画（左側固定）
 */
function drawToneLabels(
  ctx: CanvasRenderingContext2D,
  height: number,
  colors: FrqColors
): void {
  const minTone = hzToTone(FRQ_CONSTANTS.MIN_HZ);
  const maxTone = hzToTone(FRQ_CONSTANTS.MAX_HZ);
  const positions = getToneGridPositions(minTone, maxTone, FRQ_CONSTANTS.TONE_GRID_STEP);
  
  ctx.font = '12px sans-serif';
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  
  for (const tone of positions) {
    const hz = toneToHz(tone);
    const y = hzToCanvasY(hz, height, FRQ_CONSTANTS.MIN_HZ, FRQ_CONSTANTS.MAX_HZ);
    const noteName = toneToNoteName(tone);
    ctx.fillText(noteName, 5, y - 5);
  }
}

export interface FrqFreqCanvasLabelProps {
  /** キャンバス高さ */
  height: number;
  /** テーマモード */
  mode: 'light' | 'dark';
  /** Y軸スクロール量（初期値のみ） */
  scrollTop: number;
}

export interface FrqFreqCanvasLabelHandle {
  updateScroll: (scrollTop: number) => void;
}

/**
 * 周波数キャンバスラベル
 */
export const FrqFreqCanvasLabel = React.forwardRef<FrqFreqCanvasLabelHandle, FrqFreqCanvasLabelProps>(({
  height,
  mode,
  scrollTop,
}, ref) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const labelWidth = FRQ_CONSTANTS.FREQ_LABEL_WIDTH;

  // 外部から直接スクロール位置を更新できるようにする
  React.useImperativeHandle(ref, () => ({
    updateScroll: (scrollTop: number) => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(-${scrollTop}px)`;
      }
    },
  }), []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = FRQ_CONSTANTS.CANVAS_SCALE;
    
    // Canvas設定
    canvas.width = labelWidth * scale;
    canvas.height = height * scale;
    canvas.style.width = `${labelWidth}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(scale, scale);

    // 描画
    const colors = getFrqColors(mode);
    ctx.clearRect(0, 0, labelWidth, height);
    drawToneLabels(ctx, height, colors);
  }, [height, mode, labelWidth]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: labelWidth,
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: mode === 'dark' ? 'grey.900' : 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: labelWidth,
          height: height,
          transform: `translateY(-${scrollTop}px)`,
        }}
      >
        <canvas ref={canvasRef} />
      </Box>
    </Box>
  );
});
