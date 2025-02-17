import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { CommonCheckBox } from "../../Common/CommonCheckBox";

import { FileCheckFlags, IsDelete } from "../EditorView";

export const OtoArea: React.FC<OtoAreaProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h6">{t("editor.file_check.oto.title")}</Typography>
      <CommonCheckBox
        checked={props.flags.oto.root}
        setChecked={() => {
          props.OnCheckBoxChange("oto", "root");
        }}
        label={t("editor.file_check.oto.root")}
      />
      <br />
      <br />
    </>
  );
};

export interface OtoAreaProps {
  /** 書出し設定 */
  flags: FileCheckFlags;
  /** checkboxを変更する処理 */
  OnCheckBoxChange: (key1: string, key2: string) => void;
}
