import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { CommonCheckBox } from "../../Common/CommonCheckBox";

import { FileCheckFlags, IsDelete } from "../EditorView";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const WavArea: React.FC<WavAreaProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h6">{t("editor.file_check.wav.title")}</Typography>
      <Typography variant="caption">
        {t("editor.file_check.wav.description")}
      </Typography>
      <FullWidthButton
        color="inherit"
        onClick={() => {
          props.OnAllClick("wav");
        }}
      >
        <Typography variant="caption">{t("editor.file_check.all")}</Typography>
      </FullWidthButton>
      <CommonCheckBox
        checked={
          props.flags.wav.stereo === undefined ? false : props.flags.wav.stereo
        }
        setChecked={() => {
          props.OnCheckBoxChange("wav", "stereo");
        }}
        label={t("editor.file_check.wav.stereo")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.wav.sampleRate === undefined
            ? false
            : props.flags.wav.sampleRate
        }
        setChecked={() => {
          props.OnCheckBoxChange("wav", "sampleRate");
        }}
        label={t("editor.file_check.wav.sampleRate")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.wav.depth === undefined ? false : props.flags.wav.depth
        }
        setChecked={() => {
          props.OnCheckBoxChange("wav", "depth");
        }}
        label={t("editor.file_check.wav.depth")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.wav.dcoffset === undefined
            ? false
            : props.flags.wav.dcoffset
        }
        setChecked={() => {
          props.OnCheckBoxChange("wav", "dcoffset");
        }}
        label={t("editor.file_check.wav.dcoffset")}
      />
      <br />
      <br />
    </>
  );
};

export interface WavAreaProps {
  /** 書出し設定 */
  flags: FileCheckFlags;
  /** checkboxを変更する処理 */
  OnCheckBoxChange: (key1: string, key2: string) => void;
  /** checkboxを一括で */
  OnAllClick: (key1: string) => void;
}
