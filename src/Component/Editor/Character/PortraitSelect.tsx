import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { Log } from "../../../Lib/Logging";
import { FullWidthSelect } from "../../Common/FullWidthSelect";
import { SampleWavUploadButton } from "./SampleWavUploadButton";
import { PortraitUploadButton } from "./PortraitUploadButton";

export const PortraitSelect: React.FC<PortraitSelectProps> = (props) => {
  const { t } = useTranslation();
  /** zip内の立ち絵をdataurlに変換したもの */
  const [portraitUrl, setPortaitUrl] = React.useState<string>("");
  const loadPotrait = (value: string) => {
    const samplePath =
      props.rootDir + (props.rootDir !== "" ? "/" : "") + value;
    Log.log(
      `character.yamlに基づき立ち絵load ${samplePath}`,
      "CharacterYamlPanel"
    );
    if (samplePath in props.zipFiles) {
      props.zipFiles[samplePath].async("arraybuffer").then((result) => {
        setPortaitUrl(URL.createObjectURL(new File([result], samplePath)));
      });
    }
  };
  /**
   * ファイル一覧とhasCharacterYamlが更新された際の処理
   */
  React.useEffect(() => {
    if (props.files.length === 0) {
      return;
    }
    if (props.hasCharacterYaml) {
      if (props.characterYaml.portrait) {
        loadPotrait(props.characterYaml.portrait);
      } else {
        setPortaitUrl("");
      }
    }
  }, [props.files, props.hasCharacterYaml]);

  /** サンプル音声が変更された際の処理 */
  const OnChangePortait = (e: SelectChangeEvent) => {
    Log.log(
      `character.yamlの変更。key=Portrait,value=${e.target.value}`,
      "CharacterYamlPanel"
    );
    const c = { ...props.characterYaml };
    c.portrait = e.target.value;
    props.setCharacterYaml(c);
    if (e.target.value === "upload") {
      setPortaitUrl("");
    } else {
      loadPotrait(e.target.value);
    }
  };

  return (
    <>
      <FullWidthSelect
        label={t("editor.characterYaml.Portrait")}
        value={props.characterYaml.portrait}
        onChange={OnChangePortait}
        disabled={!props.update}
      >
        {props.characterYaml.portrait !== "upload" && (
          <MenuItem value={props.characterYaml.portrait}>
            {props.characterYaml.portrait}
          </MenuItem>
        )}
        <MenuItem value={"upload"}>
          {t("editor.characterYaml.PortraitUpload")}
        </MenuItem>
        {props.files
          .filter((f) => f.startsWith(props.rootDir) && f.endsWith(".png"))
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
      {props.characterYaml.portrait !== "upload" &&
        props.characterYaml.portrait !== "" &&
        portraitUrl !== "" && (
          <>
            <img
              src={portraitUrl}
              style={{
                margin: 8,
                maxWidth: "100%",
                opacity:
                  props.characterYaml.portrait_opacity !== undefined
                    ? props.characterYaml.portrait_opacity
                    : 0.67,
              }}
            />
            <br />
          </>
        )}
      {props.characterYaml.portrait === "upload" && (
        <>
          <PortraitUploadButton
            setPortraitBuf={props.setPortraitBuf}
            opacity={
              props.characterYaml.portrait_opacity !== undefined
                ? props.characterYaml.portrait_opacity
                : 0.67
            }
          />
        </>
      )}
    </>
  );
};

export interface PortraitSelectProps {
  /** 音源ルート */
  rootDir: string;
  /** zip内のファイル一覧 */
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  } | null;
  /** ファイル名一覧 */
  files: string[];
  /** character.yamlの有無 */
  hasCharacterYaml: boolean;
  /** character.yamlファイルの中身 */
  characterYaml: CharacterYaml | null;
  /** character.yamlファイルの変更処理 */
  setCharacterYaml: React.Dispatch<React.SetStateAction<CharacterYaml | null>>;
  /** character.yamlファイル更新の要否 */
  update: boolean;
  /** 立ち絵のアップロード */
  setPortraitBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
}

interface CharacterYaml {
  portrait?: string;
  portrait_opacity?: number;
  portrait_height?: number;
}
