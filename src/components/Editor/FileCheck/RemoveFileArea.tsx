import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { CommonCheckBox } from "../../Common/CommonCheckBox";

import { FileCheckFlags, IsDelete } from "../../../features/Editor/EditorView";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const RemoveFileArea: React.FC<RemoveFileAreaProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h6">
        {t("editor.file_check.remove.title")}
      </Typography>
      <FullWidthButton
        color="inherit"
        onClick={() => {
          props.OnAllClick("remove");
        }}
      >
        <Typography variant="caption">{t("editor.file_check.all")}</Typography>
      </FullWidthButton>
      <CommonCheckBox
        checked={
          props.flags.remove.read === undefined
            ? false
            : props.flags.remove.read
        }
        setChecked={() => {
          props.OnCheckBoxChange("remove", "read");
        }}
        label={t("editor.file_check.remove.read")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.remove.uspec === undefined
            ? false
            : props.flags.remove.uspec
        }
        setChecked={() => {
          props.OnCheckBoxChange("remove", "uspec");
        }}
        label={t("editor.file_check.remove.uspec")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.remove.setparam === undefined
            ? false
            : props.flags.remove.setparam
        }
        setChecked={() => {
          props.OnCheckBoxChange("remove", "setparam");
        }}
        label={t("editor.file_check.remove.setparam")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.remove.vlabeler === undefined
            ? false
            : props.flags.remove.vlabeler
        }
        setChecked={() => {
          props.OnCheckBoxChange("remove", "vlabeler");
        }}
        label={t("editor.file_check.remove.vlabeler")}
      />
      <br />
      <br />
    </>
  );
};

export interface RemoveFileAreaProps {
  /** 書出し設定 */
  flags: FileCheckFlags;
  /** checkboxを変更する処理 */
  OnCheckBoxChange: (key1: string, key2: string) => void;
  /** checkboxを一括で */
  OnAllClick: (key1: string) => void;
}
