/**
 * 周波数表サムネイルコンポーネント
 * amp(音量)とfreq(周波数)を重ねて描画し、生成中はCircularProgressを表示
 */

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Frq } from "../../lib/UtauFrq";
import { getFrqColors } from "../../settings/frqColors";
import { FRQ_CONSTANTS } from "../../settings/frqConstants";
import { drawFrqThumbnail, drawFileName } from "../../lib/FrqCanvas";

export interface FrqThumbnailProps {
  /** wavファイル名 */
  wavFileName: string;
  /** Frqオブジェクト(nullの場合は生成中) */
  frqData: Frq | null;
  /** サムネイルの幅 */
  width: number;
  /** サムネイルの高さ */
  height: number;
  /** テーマモード */
  mode: "light" | "dark";
  /** 生成中フラグ */
  isGenerating: boolean;
  /** クリック時のコールバック */
  onClick: () => void;
}

/**
 * 周波数表サムネイル
 */
export const FrqThumbnail: React.FC<FrqThumbnailProps> = ({
  wavFileName,
  frqData,
  width,
  height,
  mode,
  isGenerating = false,
  onClick,
}) => {
  const { t } = useTranslation();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [actualWidth, setActualWidth] = React.useState(width);
  const colors = getFrqColors(mode);

  // コンテナの実際の幅を取得
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (containerWidth > 0) {
          setActualWidth(containerWidth);
        }
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || actualWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = FRQ_CONSTANTS.CANVAS_SCALE;
    canvas.width = actualWidth * scale;
    canvas.height = height * scale;
    canvas.style.width = `${actualWidth}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(scale, scale);

    if (frqData && !isGenerating) {
      // frqデータがある場合は描画
      drawFrqThumbnail(ctx, frqData, actualWidth, height, colors);
      drawFileName(ctx, wavFileName, actualWidth, height, colors);
    } else {
      // 生成中または未生成の場合は背景のみ
      ctx.fillStyle = colors.generatingBackground;
      ctx.fillRect(0, 0, actualWidth, height);
    }
  }, [frqData, actualWidth, height, colors, wavFileName, isGenerating]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: `${height}px`,
        cursor: "pointer",
        border: `1px solid ${mode === "light" ? "#e0e0e0" : "#424242"}`,
        borderRadius: 1,
        overflow: "hidden",
        "&:hover": {
          borderColor: mode === "light" ? "#1976d2" : "#90caf9",
          boxShadow: 2,
        },
      }}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />

      {isGenerating && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.generatingBackground + "dd",
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="caption" sx={{ mt: 1, color: colors.text }}>
            {t("editor.frq_editor.thumbnail.generating")}
          </Typography>
        </Box>
      )}

      {!frqData && !isGenerating && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.generatingBackground,
          }}
        >
          <Typography variant="body2" sx={{ color: colors.text }}>
            {wavFileName}
          </Typography>
          <Typography
            variant="caption"
            sx={{ mt: 1, color: colors.text, opacity: 0.7 }}
          >
            {t("editor.frq_editor.thumbnail.no_frq")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
