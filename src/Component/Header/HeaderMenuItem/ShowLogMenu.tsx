import * as React from "react";
import { useTranslation } from "react-i18next";

import NotesIcon from "@mui/icons-material/Notes";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { FullWidthButton } from "../../Common/FullWidthButton";
import { LogPaper } from "../../Top/LogPaper";

import { Log } from "../../../lib/Logging";

/**
 * logを表示するメニュー
 * @param props {@link ShowLogMenuProps}
 */
export const ShowLogMenu: React.FC<ShowLogMenuProps> = (props) => {
  /** ダイアログ表示設定 */
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  /**
   * メニューをクリックした際の処理。ダイアログを開く
   */
  const OnMenuClick = () => {
    Log.log(`ログ表示`, "ShowLogMenu");
    setDialogOpen(true);
  };

  const OnLogDownload = () => {
    const text = Log.datas.join("\r\n");
    const logFile = new File([text], `log_${new Date().toJSON()}.txt`, {
      type: "text/plane;charset=utf-8",
    });
    const url = URL.createObjectURL(logFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = logFile.name;
    a.click();
    props.setMenuAnchor(null);
    setDialogOpen(false);
  };

  const { t } = useTranslation();
  return (
    <>
      <MenuItem onClick={OnMenuClick}>
        <ListItemIcon>
          <NotesIcon />
        </ListItemIcon>
        <ListItemText>{t("menu.showLog")}</ListItemText>
      </MenuItem>
      <Dialog
        onClose={() => {
          props.setMenuAnchor(null);
          setDialogOpen(false);
        }}
        open={dialogOpen}
        fullScreen
      >
        {" "}
        <DialogTitle>
          <Box sx={{ m: 1, p: 1 }}>
            <Typography variant="body1" color="error">
              {t("menu.logAttention")}
            </Typography>
            <FullWidthButton onClick={OnLogDownload}>
              {t("error.download")}
            </FullWidthButton>
          </Box>
          <Divider />
        </DialogTitle>
        <IconButton
          onClick={() => {
            setDialogOpen(false);
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <LogPaper />
        </DialogContent>
      </Dialog>
    </>
  );
};

export interface ShowLogMenuProps {
  /**親メニューを閉じるために使用 */
  setMenuAnchor: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
}