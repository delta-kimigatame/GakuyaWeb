import * as React from "react";
import { useTranslation } from "react-i18next";

import { InstallTxt } from "../../Lib/InstallTxt";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { CommonCheckBox } from "../Common/CommonCheckBox";
import { FullWidthTextField } from "../Common/FullWidthTextField";

import { Log } from "../../Lib/Logging";

/**
 * install.txtを編集する画面
 * @param props {@link InstallTxtPanelProps}
 * @returns install.txtを編集する画面
 */
export const InstallTextPanel: React.FC<InstallTxtPanelProps> = (props) => {
  const { t } = useTranslation();
  /**
   * rootDir変更時の処理
   */
  React.useEffect(() => {
    if (props.update) {
      Log.log(`rootDirの変更に伴うinstall.txtの変更。`, "InstallTextPanel");
      const install = new InstallTxt({
        folder: props.rootDir,
        contentsDir: props.rootDir,
        description: props.install ? props.install.description : "",
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
    Log.log(`Install.folderの変更。${e.target.value}`, "InstallTextPanel");
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
    Log.log(`Install.descriptionの変更。${e.target.value}`, "InstallTextPanel");
    props.setInstall(install);
  };

  const OnChangeUpdate = () => {
    const newValue = !props.update;
    Log.log(`Install.txt出力設定の変更。${newValue}`, "InstallTextPanel");
    props.setUpdate(newValue);
    if (newValue && props.install === null) {
      Log.log(`Install.txtが存在しないため生成しました。`, "InstallTextPanel");
      const install = new InstallTxt({
        folder: props.rootDir === "" ? props.zipFileName.replace(".zip","") : props.rootDir,
        contentsDir: props.rootDir === "" ? props.zipFileName.replace(".zip","") : props.rootDir,
        description: "",
      });
      props.setInstall(install);
    }
  };

  return (
    <Box>
      <CommonCheckBox
        checked={props.update}
        setChecked={OnChangeUpdate}
        label={t("editor.install.check")}
      />
      <br />
      <Typography variant="caption">
        {t("editor.install.description")}
      </Typography>
      <br />
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

export interface InstallTxtPanelProps {
  rootDir: string;
  /** install.txtファイルの中身 */
  install: InstallTxt | null;
  /** install.txtファイルの変更処理 */
  setInstall: React.Dispatch<React.SetStateAction<InstallTxt | null>>;
  /**zipファイル名 */
  zipFileName: string;
  /** ファイル更新の要否 */
  update: boolean;
  /** ファイル更新要否の変更処理 */
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}
