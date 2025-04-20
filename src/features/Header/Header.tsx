import * as React from "react";
import { useTranslation } from "react-i18next";

import { PaletteMode } from "@mui/material";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MenuIcon from "@mui/icons-material/Menu";
import { HeaderMenu } from "../../components/Header/HeaderMenu";

import { setting } from "../../settings/setting";
/**
 * ヘッダ
 * @param props {@link HeaderProps}
 * @returns ヘッダ全体
 */
export const Header: React.FC<HeaderProps> = (props) => {
  const { t } = useTranslation();
  /** テキスト表示領域 */
  const [textWidth, setTextWidth] = React.useState<number>(
    props.windowSize[0] - 40 - 24 - 32
  );
  /** 画面サイズが変更されたとき、テキスト表示領域も変更する。 */
  React.useEffect(() => {
    setTextWidth(props.windowSize[0] - 40 - 24 - 32);
  }, [props.windowSize]);
  /** メニューの表示位置。nullの時は非表示 */
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  return (
    <>
      <AppBar position="relative">
        <Toolbar
          sx={{ justifyContent: "space-between", minHeight: "40!important" }}
        >
          <Box
            sx={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}
          >
            <IconButton>
              <Avatar sx={{ width: 24, height: 24 }}>
                <img
                  src="./static/logo192.png"
                  alt="logo"
                  style={{ width: 32 }}
                />
              </Avatar>
            </IconButton>
            <Typography variant="subtitle2">{setting.productName}</Typography>
          </Box>
          <Box sx={{ minWidth: 40 }}>
            <IconButton
              onClick={(e) => {
                setMenuAnchor(e.currentTarget);
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <HeaderMenu
        mode={props.mode}
        setMode={props.setMode}
        language={props.language}
        setLanguage={props.setLanguage}
        menuAnchor={menuAnchor}
        setMenuAnchor={setMenuAnchor}
      />
    </>
  );
};

export interface HeaderProps {
  /**ダークモードかライトモードか */
  mode: PaletteMode;
  /**ダークモードかライトモードかを変更する */
  setMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
  /**言語設定 */
  language: string;
  /**言語設定を変更する処理 */
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  /**画面サイズ */
  windowSize: [number, number];
}
