import * as React from "react";
import { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";

import useMediaQuery from "@mui/material/useMediaQuery";
import { Alert, PaletteMode } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useCookies } from "react-cookie";
import { getDesignTokens } from "../settings/theme";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BasePaper } from "../components/Common/BasePaper";
import { Footer } from "../components/Fotter";
import { FullWidthButton } from "../components/Common/FullWidthButton";
import { LogPaper } from "../components/Top/LogPaper";

import { Log } from "../lib/Logging";

export const ErrorPaper: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const { t } = useTranslation();
  // 端末のダークモード設定取得
  const prefersDarkMode: boolean = useMediaQuery(
    "(prefers-color-scheme: dark)"
  );
  const [cookies, setCookie, removeCookie] = useCookies(["mode"]);
  const mode_: PaletteMode =
    cookies.mode !== undefined
      ? cookies.mode
      : prefersDarkMode
      ? "dark"
      : "light";
  const [mode, setMode] = React.useState<PaletteMode>(mode_);
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const OnLogDownload = () => {
    const text =
      Log.datas.join("\r\n") + error.message + "\r\n" + error.stack + "\r\n";
    const logFile = new File([text], `log_${new Date().toJSON()}.txt`, {
      type: "text/plane;charset=utf-8",
    });
    const url = URL.createObjectURL(logFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = logFile.name;
    a.click();
  };
  const isRemoveChildError =
    !!error?.message &&
    error.message.startsWith("Failed to execute 'removeChild' on 'Node'");

  const getNoTranslateMessage = (): string => {
    const raw =
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      "en";
    const lang = raw.split("-")[0];
    switch (lang) {
      case "ja":
        return "このエラーはブラウザの自動翻訳機能が原因で発生することがあります。ブラウザの自動翻訳を無効にしてから再度お試しください。";
      case "en":
        return "This error can be caused by your browser's automatic translation. Please disable browser automatic translation and try again.";
      case "zh":
        return raw.toLowerCase().includes("tw") ||
          raw.toLowerCase().includes("hk")
          ? "此錯誤可能由瀏覽器自動翻譯功能導致。請關閉瀏覽器的自動翻譯後再試。"
          : "此错误可能由浏览器自动翻译功能导致。请关闭浏览器的自动翻译后再试。";
      case "ko":
        return "이 오류는 브라우저 자동 번역 기능으로 인해 발생할 수 있습니다. 브라우저의 자동 번역 기능을 끄고 다시 시도하세요.";
      case "fr":
        return "Cette erreur peut être causée par la traduction automatique du navigateur. Désactivez la traduction automatique du navigateur et réessayez.";
      case "de":
        return "Dieser Fehler kann durch die automatische Übersetzung des Browsers verursacht werden. Deaktivieren Sie die automatische Übersetzung und versuchen Sie es erneut.";
      case "es":
        return "Este error puede ser causado por la traducción automática del navegador. Desactive la traducción automática del navegador e inténtelo de nuevo.";
      case "ru":
        return "Эта ошибка может быть вызвана автоматическим переводом в браузере. Отключите автоматический перевод браузера и попробуйте снова.";
      case "pt":
        return "Este erro pode ser causado pela tradução automática do navegador. Desative a tradução automática do navegador e tente novamente.";
      default:
        return "This error can be caused by your browser's automatic translation. Please disable browser automatic translation and try again.";
    }
  };

  return (
    <>
      <BasePaper
        title={t("error.title")}
        body={
          <Box sx={{ m: 1, p: 1 }}>
            {isRemoveChildError && (
              <Alert severity="warning" sx={{ mb: 2, fontWeight: "bold" }}>
                {getNoTranslateMessage()}
              </Alert>
            )}
            <Typography variant="body2">{t("error.message")}</Typography>
            <FullWidthButton color="error" onClick={OnLogDownload}>
              {t("error.download")}
            </FullWidthButton>
          </Box>
        }
      />
      <LogPaper />
      <Footer theme={theme} />
    </>
  );
};
