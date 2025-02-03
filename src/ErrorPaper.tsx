import * as React from "react";
import { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";

import useMediaQuery from "@mui/material/useMediaQuery";
import { PaletteMode } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useCookies } from "react-cookie";
import { getDesignTokens } from "./settings/theme";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BasePaper } from "./Common/BasePaper";
import { Footer } from "./Fotter";
import { FullWidthButton } from "./Common/FullWidthButton";
import { LogPaper } from "./Top/LogPaper";

import { Log } from "./Lib/Logging";

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

  return (
    <>
      <BasePaper
        title={t("error.title")}
        body={
          <Box sx={{ m: 1, p: 1 }}>
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