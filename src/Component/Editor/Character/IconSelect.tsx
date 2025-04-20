import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import { CharacterTxt } from "../../../lib/CharacterTxt";

import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { Log } from "../../../lib/Logging";
import { FullWidthSelect } from "../../Common/FullWidthSelect";
import { Png2BmpCanvas } from "./Png2BmpCanvas";

export const IconSelect: React.FC<IconSelectProps> = (props) => {
  const { t } = useTranslation();
  /** zip内のアイコン画像をdataurlに変換したもの */
  const [iconUrl, setIconUrl] = React.useState<string>("");
  const loadIcon = (value: string) => {
    const imagePath = props.rootDir + (props.rootDir !== "" ? "/" : "") + value;
    Log.log(
      `character.txtに基づきアイコン画像load ${imagePath}`,
      "CharacterPanel"
    );
    if(imagePath in props.zipFiles){
      props.zipFiles[imagePath].async("arraybuffer").then((result) => {
        setIconUrl(URL.createObjectURL(new File([result], imagePath)));
      });
    }
  };
  /**
   * ファイル一覧とhasCharacterTxtが更新された際の処理
   */
  React.useEffect(() => {
    if (props.hasCharacterTxt) {
      if (props.characterTxt.image) {
        loadIcon(props.characterTxt.image);
      } else {
        setIconUrl("");
      }
    }
  }, [props.files, props.hasCharacterTxt]);

  /** アイコン画像が変更された際の処理 */
  const OnChangeImage = (e: SelectChangeEvent) => {
    Log.log(
      `character.txtの変更。key=image,value=${e.target.value}`,
      "CharacterPanel"
    );
    props.setCharacterTxt(
      new CharacterTxt({
        name: props.characterTxt.name,
        image: e.target.value,
        sample: props.characterTxt.sample,
        author: props.characterTxt.author,
        web: props.characterTxt.web,
        version: props.characterTxt.version,
      })
    );
    if (e.target.value === "upload") {
      setIconUrl("");
    } else {
      loadIcon(e.target.value);
    }
  };

  return (
    <>
      <FullWidthSelect
        label={t("editor.character.field.image")}
        value={props.characterTxt.image}
        onChange={OnChangeImage}
        disabled={!props.characterTxtUpdate}
      >
        {props.characterTxt.image !== "upload" && (
          <MenuItem value={props.characterTxt.image}>
            {props.characterTxt.image}
          </MenuItem>
        )}
        <MenuItem value={"upload"}>
          {t("editor.character.field.convertBmp")}
        </MenuItem>
        {props.files
          .filter(
            (f) =>
              f.startsWith(props.rootDir) &&
              (f.endsWith(".bmp") ||
                f.endsWith(".gif") ||
                f.endsWith(".jpg") ||
                f.endsWith(".jpeg"))
          )
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
      {props.characterTxt.image !== "upload" &&
        props.characterTxt.image !== "" &&
        iconUrl !== "" && (
          <>
            <img src={iconUrl} width={100} height={100} style={{ margin: 8 }} />
            <br />
          </>
        )}
      {props.characterTxt.image === "upload" && (
        <>
          <Png2BmpCanvas setImgBuf={props.setIconBuf} />
        </>
      )}
    </>
  );
};

export interface IconSelectProps {
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
  /** アイコンアップロード */
  setIconBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
}
