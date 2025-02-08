import * as React from "react";
import { useTranslation } from "react-i18next";

import IconButton from "@mui/material/IconButton";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";

/**
 * zip読込待ちダイアログのタイトル部分
 * @param props {@link LoadZipDialogTitle}
 * @returns zip読込待ちダイアログのタイトル部分
 */
export const LoadZipDialogTitle: React.FC<LoadZipDialogTitleProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <DialogTitle>
        {t("loadZipDialog.title")} {t("loadZipDialog.encodeCheck")}
      </DialogTitle>
      <IconButton
        onClick={() => {
          props.setDialogOpen(false);
        }}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
    </>
  );
};

export interface LoadZipDialogTitleProps {
  /** ダイアログを表示するか否かを設定する。閉じる際に使用 */
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
