import * as React from "react";
import { PaletteMode } from "@mui/material";
import { useTranslation } from "react-i18next";

import ModeNightIcon from "@mui/icons-material/ModeNight";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

/**
 * ライトモード・ダークモードを切り替えるbutton
 * @param props {@link DarkModeButtonProps}
 * @returns ライトモード・ダークモードを切り替えるbutton
 */
export const DarkModeMenu: React.FC<DarkModeButtonProps> = (props) => {
  const { t } = useTranslation();
  return (
    <>
      <MenuItem
        onClick={() => {
          props.setMode(props.mode === "dark" ? "light" : "dark");
          props.setMenuAnchor(null)
        }}
      >
        <ListItemIcon>
          {props.mode === "dark" ? <LightModeIcon /> : <ModeNightIcon />}
        </ListItemIcon>
        <ListItemText>
          {props.mode === "dark" ? t("menu.toLightMode"): t("menu.toDarkMode")}
        </ListItemText>
      </MenuItem>
    </>
  );
};

export interface DarkModeButtonProps {
  /**ダークモードかライトモードか */
  mode: PaletteMode;
  /**ダークモードかライトモードかを変更する */
  setMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
  /**親メニューを閉じるために使用 */
  setMenuAnchor:React.Dispatch<React.SetStateAction<null | HTMLElement>>;
}