import * as React from "react";
import JSZip from "jszip";
import i18n from "../i18n/configs";

import useMediaQuery from "@mui/material/useMediaQuery";
import { PaletteMode } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useCookies } from "react-cookie";
import { getDesignTokens } from "../settings/theme";

import { Header } from "./Header/Header";
import { Footer } from "./Fotter";
import { TopView } from "./Top/TopView";
import { EditorView } from "./Editor/EditorView";

import { Log } from "../lib/Logging";

export const App: React.FC = () => {
  // 端末のダークモード設定取得
  const prefersDarkMode: boolean = useMediaQuery(
    "(prefers-color-scheme: dark)"
  );
  // cookieの取得
  const [cookies, setCookie, removeCookie] = useCookies(["mode", "language"]);
  const mode_: PaletteMode =
    cookies.mode !== undefined
      ? cookies.mode
      : prefersDarkMode
      ? "dark"
      : "light";
  const language_: string =
    cookies.language !== undefined ? cookies.language : "ja";
  const [mode, setMode] = React.useState<PaletteMode>(mode_);
  const [language, setLanguage] = React.useState<string>(language_);
  const [zipFileName, setZipFileName] = React.useState<string>("");
  const [readZip, setReadZip] = React.useState<{
    [key: string]: JSZip.JSZipObject;
  } | null>(null);
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  /**
   * ダークモード設定が切り替わった際、クッキーに保存する。
   */
  const SetCookieMode = React.useMemo(() => {
    setCookie("mode", mode);
    Log.log(mode + ":モードを変更", "App");
  }, [mode]);
  React.useMemo(() => {
    setCookie("language", language);
    i18n.changeLanguage(language);
    Log.log(language + ":表示言語を変更", "App");
  }, [language]);

  const [windowSize, setWindowSize] = React.useState<[number, number]>([0, 0]);
  React.useLayoutEffect(() => {
    Log.log(window.navigator.userAgent, "App");
    const updateSize = (): void => {
      setTimeout(() => {
        setWindowSize([window.innerWidth, window.innerHeight]);
        Log.log("画面サイズ:" + [window.innerWidth, window.innerHeight], "App");
      }, 100);
    };
    window.addEventListener("orientationchange", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header
        mode={mode}
        setMode={setMode}
        language={language}
        setLanguage={setLanguage}
        windowSize={windowSize}
      />
      {readZip === null ? (
        <>
          <TopView
            readZip={readZip}
            setReadZip={setReadZip}
            zipFileName={zipFileName}
            setZipFileName={setZipFileName}
          />
        </>
      ) : (
        <>
          <EditorView zipFiles={readZip} zipFileName={zipFileName} mode={mode}/>
        </>
      )}
      <Footer theme={theme} />
    </ThemeProvider>
  );
};
