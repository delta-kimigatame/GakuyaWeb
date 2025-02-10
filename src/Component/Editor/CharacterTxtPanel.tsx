import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import { CharacterTxt } from "../../Lib/CharacterTxt";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { CommonCheckBox } from "../Common/CommonCheckBox";
import { FullWidthTextField } from "../Common/FullWidthTextField";
import { SampleWavSelect } from "./Character/SampleWavSelect";
import { IconSelect } from "./Character/IconSelect";

import { Log } from "../../Lib/Logging";

export const CharacterTxtPanel: React.FC<CharacterTxtPanelProps> = (props) => {
  const { t } = useTranslation();
  /** zip内のファイル一覧 */
  const [files, setFiles] = React.useState<string[]>([]);
  /** rootフォルダにおけるcharacter.txtの有無 */
  const [hasCharacterTxt, setHasCharacterTxt] = React.useState<boolean>(true);
  /**
   * rootDir変更時の処理
   */
  React.useEffect(() => {
    const characterTxtPath =
      props.rootDir === "" ? "character.txt" : props.rootDir + "/character.txt";
    if (files.length === 0) {
      return;
    }
    const hasCharacterTxt_ = files.includes(characterTxtPath);
    Log.log(
      `rootDirの変更に伴うcharacter.txt有無の確認。${hasCharacterTxt_}`,
      "CharacterPanel"
    );
    setHasCharacterTxt(hasCharacterTxt_);
    if (!hasCharacterTxt_) {
      Log.log(
        `character.txtが存在しないため自動生成。name=${
          props.rootDir ? props.rootDir : props.zipFileName.slice(0, -4)
        }`,
        "CharacterPanel"
      );
      props.setCharacterTxtUpdate(true);
      props.setCharacterTxt(
        new CharacterTxt({
          name: props.rootDir ? props.rootDir : props.zipFileName.slice(0, -4),
          image: "",
          sample: "",
          author: "",
          web: "",
          version: "",
        })
      );
    } 
  }, [props.rootDir, files]);

  React.useEffect(() => {
    Log.log(`zipFilesからファイル一覧の取得`, "CharacterPanel");
    const files_ =
      props.zipFiles !== null
        ? Object.keys(props.zipFiles)
        : new Array<string>();
    setFiles(files_);
  }, [props.zipFiles]);

  /** character.txtの更新要否の変更 */
  const OnChangeCharacterTxtUpdate = () => {
    const newValue = !props.characterTxtUpdate;
    props.setCharacterTxtUpdate(newValue);
  };

  /** character.txtの各要素の更新 */
  const OnChangeCharacterTxtValue = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    Log.log(
      `character.txtの変更。key=${key},value=${e.target.value}`,
      "CharacterPanel"
    );
    props.setCharacterTxt(
      new CharacterTxt({
        name: key === "name" ? e.target.value : props.characterTxt.name,
        image: props.characterTxt.image,
        sample: props.characterTxt.sample,
        author: key === "author" ? e.target.value : props.characterTxt.author,
        web: key === "web" ? e.target.value : props.characterTxt.web,
        version:
          key === "version" ? e.target.value : props.characterTxt.version,
      })
    );
  };

  return (
    <Box>
      <CommonCheckBox
        checked={props.characterTxtUpdate}
        setChecked={OnChangeCharacterTxtUpdate}
        label={t("editor.character.check")}
        disabled={!hasCharacterTxt}
      />
      <br />
      <Typography variant="caption">
        {t("editor.character.description")}
      </Typography>
      <br />
      {props.characterTxt !== null && (
        <>
          <FullWidthTextField
            type="text"
            label={t("editor.character.field.name")}
            value={props.characterTxt.name}
            onChange={(e) => {
              OnChangeCharacterTxtValue(e, "name");
            }}
            disabled={!props.characterTxtUpdate}
          />
          <IconSelect
            rootDir={props.rootDir}
            zipFiles={props.zipFiles}
            files={files}
            hasCharacterTxt={hasCharacterTxt}
            characterTxt={props.characterTxt}
            setCharacterTxt={props.setCharacterTxt}
            characterTxtUpdate={props.characterTxtUpdate}
            setIconBuf={props.setIconBuf}
          />
          <SampleWavSelect 
            rootDir={props.rootDir}
            zipFiles={props.zipFiles}
            files={files}
            hasCharacterTxt={hasCharacterTxt}
            characterTxt={props.characterTxt}
            setCharacterTxt={props.setCharacterTxt}
            characterTxtUpdate={props.characterTxtUpdate}
            setSampleBuf={props.setSampleBuf}
          />
          <FullWidthTextField
            type="text"
            label={t("editor.character.field.author")}
            value={props.characterTxt.author}
            onChange={(e) => {
              OnChangeCharacterTxtValue(e, "author");
            }}
            disabled={!props.characterTxtUpdate}
          />
          <FullWidthTextField
            type="text"
            label={t("editor.character.field.web")}
            value={props.characterTxt.web}
            onChange={(e) => {
              OnChangeCharacterTxtValue(e, "web");
            }}
            disabled={!props.characterTxtUpdate}
          />
          <FullWidthTextField
            type="text"
            label={t("editor.character.field.version")}
            value={props.characterTxt.version}
            onChange={(e) => {
              OnChangeCharacterTxtValue(e, "version");
            }}
            disabled={!props.characterTxtUpdate}
          />
        </>
      )}
    </Box>
  );
};

export interface CharacterTxtPanelProps {
  /** 音源ルート */
  rootDir: string;
  /** zip内のファイル一覧 */
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  } | null;
  /**zipファイル名 */
  zipFileName: string;
  /** character.txtファイルの中身 */
  characterTxt: CharacterTxt | null;
  /** character.txtファイルの変更処理 */
  setCharacterTxt: React.Dispatch<React.SetStateAction<CharacterTxt | null>>;
  /** character.txtファイル更新の要否 */
  characterTxtUpdate: boolean;
  /** character.txtファイル更新要否の変更処理 */
  setCharacterTxtUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  /** アイコンアップロード */
  setIconBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
  /** サンプル音声のアップロード */
  setSampleBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
}
