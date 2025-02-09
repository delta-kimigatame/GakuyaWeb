import * as React from "react";
import { useTranslation } from "react-i18next";

import { InstallTxt } from "../../Lib/InstallTxt";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";

import { CommonCheckBox } from "../Common/CommonCheckBox";
import { FullWidthTextField } from "../Common/FullWidthTextField";
import { FullWidthSelect } from "../Common/FullWidthSelect";

/**
 * install.txtを編集する画面
 * @param props {@link ReadMePanelProps}
 * @returns install.txtを編集する画面
 */
export const InstallTextPanel: React.FC<ReadMePanelProps> = (props) => {
  const { t } = useTranslation();
  /**
   * rootDir変更時の処理
   */
  React.useEffect(() => {
    if (props.update) {
      const install = new InstallTxt({
        folder: props.rootDir,
        contentsDir: props.rootDir,
        description: props.install.description,
      });
      props.setInstall(install);
    }
  }, [props.rootDir]);

  /**
   * folder変更時の処理
   * @param e
   */
  const OnChangeFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
    const install = new InstallTxt({
      folder: e.target.value,
      contentsDir: props.install.contentsDir,
      description: props.install.description,
    });
    props.setInstall(install);
  };
  /**
   * description変更時の処理
   * @param e
   */
  const OnChangeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const install = new InstallTxt({
      folder: props.install.folder,
      contentsDir: props.install.contentsDir,
      description: e.target.value,
    });
    props.setInstall(install);
  };

  const OnChangeUpdate = ()=>{
    const newValue = !props.update
    props.setUpdate(newValue)
    if(newValue){
      const install = new InstallTxt({
        folder: props.rootDir,
        contentsDir: props.rootDir,
        description: props.install.description,
      });
      props.setInstall(install);
    }
  }

  return (
    <Box>
      <Typography variant="caption">
        {t("editor.install.description")}
      </Typography>
      <br />
      <CommonCheckBox
        checked={props.update}
        setChecked={OnChangeUpdate}
        label={t("editor.install.check")}
      />
      {props.install !== null && (
        <>
          <FullWidthTextField
            type="text"
            label={t("editor.install.field.folder")}
            value={props.install.folder}
            onChange={OnChangeFolder}
            disabled={!props.update}
          />
          <FullWidthTextField
            type="text"
            label={t("editor.install.field.description")}
            value={props.install.description}
            onChange={OnChangeDescription}
            disabled={!props.update}
          />
        </>
      )}
    </Box>
  );
};

export interface ReadMePanelProps {
  rootDir: string;
  /** readmeファイルの中身 */
  install: InstallTxt | null;
  /** readmeファイルの変更処理 */
  setInstall: React.Dispatch<React.SetStateAction<InstallTxt | null>>;
  /** ファイル更新の要否 */
  update: boolean;
  /** ファイル更新要否の変更処理 */
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}
