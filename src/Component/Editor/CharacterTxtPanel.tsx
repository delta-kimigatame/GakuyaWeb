import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import { CharacterTxt } from "../../Lib/CharacterTxt";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { CommonCheckBox } from "../Common/CommonCheckBox";
import { FullWidthTextField } from "../Common/FullWidthTextField";

import { Log } from "../../Lib/Logging";
import { FullWidthSelect } from "../Common/FullWidthSelect";
import { Png2BmpCanvas } from "./Character/Png2BmpCanvas";
import { SampleWavSelect } from "./Character/SampleWavSelect";

export const CharacterTxtPanel: React.FC<CharacterTxtPanelProps> = (props) => {
  const { t } = useTranslation();
  /** zip内のファイル一覧 */
  const [files, setFiles] = React.useState<string[]>([]);
  /** rootフォルダにおけるcharacter.txtの有無 */
  const [hasCharacterTxt, setHasCharacterTxt] = React.useState<boolean>(true);
  /** zip内のアイコン画像をdataurlに変換したもの */
  const [iconUrl, setIconUrl] = React.useState<string>("");
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
      setIconUrl("");
    } else {
      if (props.characterTxt.image) {
        const imagePath =
          props.rootDir +
          (props.rootDir !== "" ? "/" : "") +
          props.characterTxt.image;
        Log.log(
          `character.txtに基づきアイコン画像load ${imagePath}`,
          "CharacterPanel"
        );
        props.zipFiles[imagePath].async("arraybuffer").then((result) => {
          setIconUrl(URL.createObjectURL(new File([result], imagePath)));
        });
      } else {
        setIconUrl("");
      }
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
      const imagePath =
        props.rootDir + (props.rootDir !== "" ? "/" : "") + e.target.value;
      Log.log(
        `character.txtに基づきアイコン画像load ${imagePath}`,
        "CharacterPanel"
      );
      props.zipFiles[imagePath].async("arraybuffer").then((result) => {
        setIconUrl(URL.createObjectURL(new File([result], imagePath)));
      });
    }
  };

  return (
    <Box>
      <Typography variant="caption">
        {t("editor.character.description")}
      </Typography>
      <br />
      <CommonCheckBox
        checked={props.characterTxtUpdate}
        setChecked={OnChangeCharacterTxtUpdate}
        label={t("editor.character.check")}
        disabled={!hasCharacterTxt}
      />
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
            {files
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
                    props.rootDir === ""
                      ? f
                      : f.replace(props.rootDir + "/", "")
                  }
                >
                  {props.rootDir === ""
                    ? f
                    : f.replace(props.rootDir + "/", "")}
                </MenuItem>
              ))}
          </FullWidthSelect>
          {props.characterTxt.image !== "upload" &&
            props.characterTxt.image !== "" &&
            iconUrl !== "" && (
              <>
                <img
                  src={iconUrl}
                  width={100}
                  height={100}
                  style={{ margin: 8 }}
                />
                <br />
              </>
            )}
          {props.characterTxt.image === "upload" && (
            <>
              <Png2BmpCanvas setImgBuf={props.setIconBuf} />
            </>
          )}
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
