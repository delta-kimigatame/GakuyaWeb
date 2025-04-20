import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { CommonCheckBox } from "../Common/CommonCheckBox";

/**
 * readmeを編集する画面
 * @param props {@link ReadMePanelProps}
 * @returns readmeを編集する画面
 */
export const ReadMePanel: React.FC<ReadMePanelProps> = (props) => {
  const { t } = useTranslation();
  return (
    <Box>
      <CommonCheckBox
        checked={props.update}
        setChecked={props.setUpdate}
        label={t("editor.readme.check")}
      /><br />
      <Typography variant="caption">
        {t("editor.readme.description")}
      </Typography>
      <br />
      <TextField
        fullWidth
        multiline
        minRows={20}
        value={props.readme}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          props.setReadme(e.target.value);
        }}
        disabled={!props.update}
      />
    </Box>
  );
};

export interface ReadMePanelProps {
  /** readmeファイルの中身 */
  readme: string;
  /** readmeファイルの変更処理 */
  setReadme: React.Dispatch<React.SetStateAction<string>>;
  /** ファイル更新の要否 */
  update: boolean;
  /** ファイル更新要否の変更処理 */
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}
