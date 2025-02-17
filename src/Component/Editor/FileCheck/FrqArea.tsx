import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { CommonCheckBox } from "../../Common/CommonCheckBox";

import { FileCheckFlags, IsDelete } from "../EditorView";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const FrqArea: React.FC<FrqAreaProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      {" "}
      <Typography variant="h6">{t("editor.file_check.frq.title")}</Typography>
      <Typography variant="caption">
        {t("editor.file_check.frq.description")}
      </Typography>
      <FullWidthButton
        color="inherit"
        onClick={() => {
          props.OnAllClick("frq");
        }}
      >
        <Typography variant="caption">{t("editor.file_check.all")}</Typography>
      </FullWidthButton>
      <CommonCheckBox
        checked={
          props.flags.frq.frq === undefined ? false : props.flags.frq.frq
        }
        setChecked={() => {
          props.OnCheckBoxChange("frq", "frq");
        }}
        label={t("editor.file_check.frq.frq")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.pmk === undefined ? false : props.flags.frq.pmk
        }
        setChecked={() => {
          props.OnCheckBoxChange("frq", "pmk");
        }}
        label={t("editor.file_check.frq.pmk")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.frc === undefined ? false : props.flags.frq.frc
        }
        setChecked={() => {
          props.OnCheckBoxChange("frq", "frc");
        }}
        label={t("editor.file_check.frq.frc")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.vs4ufrq === undefined
            ? false
            : props.flags.frq.vs4ufrq
        }
        setChecked={() => {
          props.OnCheckBoxChange("frq", "vs4ufrq");
        }}
        label={t("editor.file_check.frq.vs4ufrq")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.world === undefined ? false : props.flags.frq.world
        }
        setChecked={() => {
          props.OnCheckBoxChange("frq", "world");
        }}
        label={t("editor.file_check.frq.world")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.llsm === undefined ? false : props.flags.frq.llsm
        }
        setChecked={() => {
          props.OnCheckBoxChange("frq", "llsm");
        }}
        label={t("editor.file_check.frq.llsm")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.mrq === undefined ? false : props.flags.frq.mrq
        }
        setChecked={() => {
          props.OnCheckBoxChange("frq", "mrq");
        }}
        label={t("editor.file_check.frq.mrq")}
      />
      <br />
      <br />
    </>
  );
};

export interface FrqAreaProps {
  /** 書出し設定 */
  flags: FileCheckFlags;
  /** checkboxを変更する処理 */
  OnCheckBoxChange: (key1: string, key2: string) => void;
  /** checkboxを一括で */
  OnAllClick: (key1: string) => void;
}
