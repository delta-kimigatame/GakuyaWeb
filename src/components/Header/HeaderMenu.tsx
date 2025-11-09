import * as React from "react";
import { useTranslation } from "react-i18next";

import { PaletteMode } from "@mui/material";

import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";

import { DarkModeMenu } from "../../features/Header/HeaderMenuItem/DarkModeMenu";
import { LanguageMenu } from "../../features/Header/HeaderMenuItem/LanguageMenu";
import { WorkersCountMenu } from "../../features/Header/HeaderMenuItem/WorkersCountMenu";
import { ShowLogMenu } from "../../features/Header/HeaderMenuItem/ShowLogMenu";
import { HeaderMenuClearCache } from "../../features/Header/HeaderMenuItem/HeaderMenuClearCache";

/**
 * ヘッダメニュー
 * @param props {@link HeaderMenuProps}
 * @returns ヘッダメニュー
 */
export const HeaderMenu: React.FC<HeaderMenuProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <Menu
        anchorEl={props.menuAnchor}
        open={Boolean(props.menuAnchor)}
        onClose={() => {
          props.setMenuAnchor(null);
        }}
      >
        <LanguageMenu
          language={props.language}
          setLanguage={props.setLanguage}
          setMenuAnchor={props.setMenuAnchor}
        />
        <DarkModeMenu
          mode={props.mode}
          setMode={props.setMode}
          setMenuAnchor={props.setMenuAnchor}
        />
        <WorkersCountMenu
          workersCount={props.workersCount}
          setWorkersCount={props.setWorkersCount}
          setMenuAnchor={props.setMenuAnchor}
        />
        <Divider />
        <HeaderMenuClearCache setMenuAnchor={props.setMenuAnchor} />
        <Divider />
        <ShowLogMenu setMenuAnchor={props.setMenuAnchor} />
      </Menu>
    </>
  );
};

export interface HeaderMenuProps {
  /**ダークモードかライトモードか */
  mode: PaletteMode;
  /**ダークモードかライトモードかを変更する */
  setMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
  /**言語設定 */
  language: string;
  /**言語設定を変更する処理 */
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  /**ワーカー数 */
  workersCount: number;
  /**ワーカー数を変更する処理 */
  setWorkersCount: React.Dispatch<React.SetStateAction<number>>;
  /** メニューの表示位置。nullの時は非表示 */
  menuAnchor: null | HTMLElement;
  /**メニューの表示制御 */
  setMenuAnchor: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
}
