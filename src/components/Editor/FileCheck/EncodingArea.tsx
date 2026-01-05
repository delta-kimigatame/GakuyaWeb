import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

import { CommonCheckBox } from "../../Common/CommonCheckBox";
import { FileCheckFlags } from "../../../features/Editor/EditorView";

export const EncodingArea: React.FC<EncodingAreaProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h6">
        {t("editor.file_check.encoding.title")}
      </Typography>
      <CommonCheckBox
        checked={
          props.flags.encoding.utf8 === undefined
            ? false
            : props.flags.encoding.utf8
        }
        setChecked={() => {
          props.OnCheckBoxChange("encoding", "utf8");
        }}
        label={t("editor.file_check.encoding.utf8")}
      />
      <br />
      <Alert severity="warning" sx={{ mt: 1 }}>
        {t("editor.file_check.encoding.warning")}
      </Alert>
    </>
  );
};

interface EncodingAreaProps {
  flags: FileCheckFlags;
  OnCheckBoxChange: (key1: string, key2: string) => void;
}
