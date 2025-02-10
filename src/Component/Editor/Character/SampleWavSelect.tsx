import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import { CharacterTxt } from "../../../Lib/CharacterTxt";

import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { Log } from "../../../Lib/Logging";
import { FullWidthSelect } from "../../Common/FullWidthSelect";
import { SampleWavUploadButton } from "./SampleWavUploadButton";

export const SampleWavSelect: React.FC<SampleWavSelectProps> = (props) => {
  const { t } = useTranslation();
  /** zip内のサンプル音声をdataurlに変換したもの */
  const [sampleUrl, setSampleUrl] = React.useState<string>("");
  const loadWav = (value: string) => {
    const samplePath =
      props.rootDir + (props.rootDir !== "" ? "/" : "") + value;
    Log.log(
      `character.txtに基づきサンプル音声load ${samplePath}`,
      "CharacterPanel"
    );
    props.zipFiles[samplePath].async("arraybuffer").then((result) => {
      setSampleUrl(URL.createObjectURL(new File([result], samplePath)));
    });
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
  }, [props.files, props.hasCharacterTxt]);

  /** サンプル音声が変更された際の処理 */
  const OnChangeSample = (e: SelectChangeEvent) => {
    Log.log(
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
        {props.characterTxt.image !== "upload" && (
          <MenuItem value={props.characterTxt.sample}>
            {props.characterTxt.sample}
          </MenuItem>
        )}
        <MenuItem value={"upload"}>
          {t("editor.character.field.uploadSample")}
        </MenuItem>
        {props.files
          .filter((f) => f.startsWith(props.rootDir) && f.endsWith(".wav"))
          .map((f) => (
            <MenuItem
              value={
                props.rootDir === "" ? f : f.replace(props.rootDir + "/", "")
              }
            >
              {props.rootDir === "" ? f : f.replace(props.rootDir + "/", "")}
            </MenuItem>
          ))}
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
}
