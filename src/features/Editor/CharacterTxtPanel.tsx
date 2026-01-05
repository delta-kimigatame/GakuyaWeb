import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import { CharacterTxt } from "../../lib/CharacterTxt";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import { CommonCheckBox } from "../../components/Common/CommonCheckBox";
import { FullWidthSelect } from "../../components/Common/FullWidthSelect";
import { FullWidthTextField } from "../../components/Common/FullWidthTextField";
import { EncodeSelect } from "../Common/EncodeSelect";
import { SampleWavSelect } from "./Character/SampleWavSelect";
import { IconSelect } from "./Character/IconSelect";

import { Log } from "../../lib/Logging";

export const CharacterTxtPanel: React.FC<CharacterTxtPanelProps> = (props) => {
  const { t } = useTranslation();
  /** rootフォルダにおけるcharacter.txtの有無 */
  const [hasCharacterTxt, setHasCharacterTxt] = React.useState<boolean>(true);

  /** character.txtファイルのリスト */
  const characterTxtFiles = React.useMemo(() => {
    return props.files.filter((f) => f.toLowerCase().endsWith("character.txt"));
  }, [props.files]);

  /** エンコーディング変更時の処理 */
  const onEncodingChange = (newEncoding: string) => {
    props.setCharacterTxtEncoding(newEncoding);
    if (props.onReload) {
      props.onReload(props.characterTxtPath, newEncoding);
    }
  };

  /** ファイルパス変更時の処理 */
  const onFilePathChange = (event: SelectChangeEvent<string>) => {
    const newPath = event.target.value;
    props.setCharacterTxtPath(newPath);
    if (props.onReload) {
      props.onReload(newPath, props.characterTxtEncoding);
    }
  };

  /**
   * rootDir変更時の処理
   */
  React.useEffect(() => {
    const characterTxtPath =
      props.rootDir === "" ? "character.txt" : props.rootDir + "/character.txt";
    if (props.files.length === 0) {
      return;
    }
    const hasCharacterTxt_ = props.files.includes(characterTxtPath);
    Log.info(
      `rootDirの変更に伴うcharacter.txt有無の確認。${hasCharacterTxt_}`,
      "CharacterPanel"
    );
    setHasCharacterTxt(hasCharacterTxt_);
  }, [props.rootDir, props.files]);

  /**
   * チェックボックスを強制的に有効にするかどうか
   * rootにcharacter.txtがなく、かつ他のファイルも選択していない場合のみ強制
   */
  const shouldForceUpdate = !hasCharacterTxt && props.characterTxtPath === "";

  /**
   * 現在選択されているcharacter.txtが存在するかどうか
   * IconSelectやSampleWavSelectに渡す用
   */
  const hasSelectedCharacterTxt = props.characterTxtPath !== "" || hasCharacterTxt;

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
    Log.info(
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
        disabled={shouldForceUpdate}
      />
      <br />
      <Typography variant="caption">
        {t("editor.character.description")}
      </Typography>
      <br />
      {props.characterTxt !== null && (
        <>
          <FullWidthSelect
            value={props.characterTxtPath}
            onChange={onFilePathChange}
            label={t("editor.characterTxt.selectFile")}
          >
            {characterTxtFiles.map((file) => (
              <MenuItem key={file} value={file}>
                {file}
              </MenuItem>
            ))}
          </FullWidthSelect>
          <br />
          <EncodeSelect
            value={props.characterTxtEncoding}
            onChange={onEncodingChange}
          />
          <br />
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
            files={props.files}
            hasCharacterTxt={hasSelectedCharacterTxt}
            characterTxt={props.characterTxt}
            setCharacterTxt={props.setCharacterTxt}
            characterTxtUpdate={props.characterTxtUpdate}
            setIconBuf={props.setIconBuf}
            characterTxtPath={props.characterTxtPath}
          />
          <SampleWavSelect
            rootDir={props.rootDir}
            zipFiles={props.zipFiles}
            files={props.files}
            hasCharacterTxt={hasSelectedCharacterTxt}
            characterTxt={props.characterTxt}
            setCharacterTxt={props.setCharacterTxt}
            characterTxtUpdate={props.characterTxtUpdate}
            setSampleBuf={props.setSampleBuf}
            characterTxtPath={props.characterTxtPath}
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
  /** ファイル一覧 */
  files: string[];
  /**zipファイル名 */
  zipFileName: string;
  /** character.txtファイルの中身 */
  characterTxt: CharacterTxt | null;
  /** character.txtファイルの変更処理 */
  setCharacterTxt: React.Dispatch<React.SetStateAction<CharacterTxt | null>>;
  /** character.txtファイル更新の要否 */
  characterTxtUpdate: boolean;
  /** character.txtファイル強制更新の要否 */
  characterForceUpdate: boolean;
  /** character.txtファイル更新要否の変更処理 */
  setCharacterTxtUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  /** アイコンアップロード */
  setIconBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
  /** サンプル音声のアップロード */
  setSampleBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
  /** 選択されているcharacter.txtのパス */
  characterTxtPath: string;
  /** character.txtのパス変更 */
  setCharacterTxtPath: React.Dispatch<React.SetStateAction<string>>;
  /** character.txtの文字コード */
  characterTxtEncoding: string;
  /** character.txtの文字コード変更 */
  setCharacterTxtEncoding: React.Dispatch<React.SetStateAction<string>>;
  /** 再読み込みコールバック */
  onReload?: (path?: string, encoding?: string) => void;
}
