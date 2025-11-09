import CachedIcon from "@mui/icons-material/Cached";
import React from "react";
import { useTranslation } from "react-i18next";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Log } from "../../../lib/Logging";
export const HeaderMenuClearCache: React.FC<HeaderMenuClearCacheProps> = (props) => {
  const { t } = useTranslation();
  const handleClick = () => {
    Log.info("click", "HeaderMenuClearCache");
    Log.info("アプリのキャッシュクリア", "HeaderMenuClearCache");
    clearAppCache();
  };

  const clearAppCache = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      Log.info("swクリア", "HeaderMenuClearCache");
    } else {
      Log.info("sw未登録", "HeaderMenuClearCache");
    }
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
      await caches.delete(key);
      Log.info("キャッシュクリア${key}", "HeaderMenuClearCache");
    }
    Log.info("アプリのキャッシュクリア完了", "HeaderMenuClearCache");
    props.setMenuAnchor(null);
  };
  return (
    <>
    <MenuItem onClick={handleClick}>
      <ListItemIcon>
      <CachedIcon />
      </ListItemIcon>
      <ListItemText>{t("menu.clearAppCache")}</ListItemText>
    </MenuItem>
    </>
  );
};

interface HeaderMenuClearCacheProps{
  /**親メニューを閉じるために使用 */
  setMenuAnchor: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
}