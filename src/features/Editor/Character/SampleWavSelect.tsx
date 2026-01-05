import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import { CharacterTxt } from "../../../lib/CharacterTxt";

import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { Log } from "../../../lib/Logging";
import { FullWidthSelect } from "../../../components/Common/FullWidthSelect";
import { SampleWavUploadButton } from "./SampleWavUploadButton";

export const SampleWavSelect: React.FC<SampleWavSelectProps> = (props) => {
  const { t } = useTranslation();
  /** zip内のサンプル音声をdataurlに変換したもの */
  const [sampleUrl, setSampleUrl] = React.useState<string>("");
  
  // character.txtが置かれているディレクトリを取得
  const characterTxtDir = React.useMemo(() => {
    return props.characterTxtPath 
      ? props.characterTxtPath.substring(0, props.characterTxtPath.lastIndexOf("/"))
      : props.rootDir;
  }, [props.characterTxtPath, props.rootDir]);
  
  const loadWav = (value: string) => {
    const samplePath =
      characterTxtDir + (characterTxtDir !== "" ? "/" : "") + value;
    Log.info(
      `character.txtに基づきサンプル音声load ${samplePath}`,
      "CharacterPanel"
    );
    if (samplePath in props.zipFiles) {
      props.zipFiles[samplePath].async("arraybuffer").then((result) => {
        setSampleUrl(URL.createObjectURL(new File([result], samplePath)));
      });
    }
  };
  /**
   * ファイル一覧とhasCharacterTxtが更新された際の処理
   */
  React.useEffect(() => {
    if (props.files.length === 0) {
      return;
    }
    if (props.hasCharacterTxt) {
      if (props.characterTxt.sample) {
        loadWav(props.characterTxt.sample);
      } else {
        setSampleUrl("");
      }
    }
  }, [props.files, props.hasCharacterTxt, props.characterTxtPath, props.characterTxt.sample]);

  /** サンプル音声が変更された際の処理 */
  const OnChangeSample = (e: SelectChangeEvent) => {
    Log.info(
      `character.txtの変更。key=sample,value=${e.target.value}`,
      "CharacterPanel"
    );
    props.setCharacterTxt(
      new CharacterTxt({
        name: props.characterTxt.name,
        image: props.characterTxt.image,
        sample: e.target.value,
        author: props.characterTxt.author,
        web: props.characterTxt.web,
        version: props.characterTxt.version,
      })
    );
    if (e.target.value === "upload") {
      setSampleUrl("");
    } else {
      loadWav(e.target.value);
    }
  };

  return (
    <>
      <FullWidthSelect
        label={t("editor.character.field.sample")}
        value={props.characterTxt.sample}
        onChange={OnChangeSample}
        disabled={!props.characterTxtUpdate}
      >
        {props.characterTxt.sample !== "upload" && (
          <MenuItem value={props.characterTxt.sample}>
            {props.characterTxt.sample}
          </MenuItem>
        )}
        <MenuItem value={"upload"}>
          {t("editor.character.field.uploadSample")}
        </MenuItem>
        {props.files
          .filter((f) => f.startsWith(characterTxtDir) && f.endsWith(".wav"))
          .map((f) => {
            const relativePath = characterTxtDir === "" ? f : f.replace(characterTxtDir + "/", "");
            return (
              <MenuItem key={f} value={relativePath}>
                {relativePath}
              </MenuItem>
            );
          })}
      </FullWidthSelect>
      {props.characterTxt.sample !== "upload" &&
        props.characterTxt.sample !== "" &&
        sampleUrl !== "" && (
          <>
            <audio src={sampleUrl} controls style={{ margin: 8 }}></audio>
            <br />
          </>
        )}
      {props.characterTxt.sample === "upload" && (
        <>
          <SampleWavUploadButton setSampleBuf={props.setSampleBuf} />
        </>
      )}
    </>
  );
};

export interface SampleWavSelectProps {
  /** 音源ルート */
  rootDir: string;
  /** zip内のファイル一覧 */
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  } | null;
  /** ファイル名一覧 */
  files: string[];
  /** rootフォルダにcharacter.txtがあるか否か */
  hasCharacterTxt: boolean;
  /** character.txtファイルの中身 */
  characterTxt: CharacterTxt | null;
  /** character.txtファイルの変更処理 */
  setCharacterTxt: React.Dispatch<React.SetStateAction<CharacterTxt | null>>;
  /** character.txtファイル更新の要否 */
  characterTxtUpdate: boolean;
  /** サンプル音声のアップロード */
  setSampleBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
  /** 選択されているcharacter.txtのパス */
  characterTxtPath: string;
}
