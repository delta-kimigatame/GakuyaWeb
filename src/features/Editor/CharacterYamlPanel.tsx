import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { SelectChangeEvent } from "@mui/material/Select";

import { CommonCheckBox } from "../../components/Common/CommonCheckBox";
import { FullWidthTextField } from "../../components/Common/FullWidthTextField";
import { FullWidthSelect } from "../../components/Common/FullWidthSelect";

import { Log } from "../../lib/Logging";
import { Slider } from "@mui/material";
import { PortraitSelect } from "./Character/PortraitSelect";
export const CharacterYamlPanel: React.FC<CharacterYamlPanelProps> = (
  props
) => {
  const { t } = useTranslation();
  /** rootフォルダにおけるcharacter.txtの有無 */
  const [hasCharacterYaml, setHasCharacterYaml] = React.useState<boolean>(true);

  /**
   * ファイルパス変更時の処理
   */
  const onFilePathChange = (e: SelectChangeEvent) => {
    props.setCharacterYamlPath(e.target.value);
    if (props.onReload) {
      props.onReload(e.target.value);
    }
  };

  // zip内の全character.yamlファイルを取得
  const characterYamlFiles = React.useMemo(() => {
    if (!props.files) return [];
    return props.files
      .filter((f) => f.toLowerCase().endsWith("character.yaml"))
      .sort();
  }, [props.files]);

  /**
   * rootDir変更時の処理
   */
  React.useEffect(() => {
    const characterYamlPath =
      props.rootDir === ""
        ? "character.yaml"
        : props.rootDir + "/character.yaml";
    if (props.files.length === 0) {
      return;
    }
    const hasCharacterYaml_ = props.files.includes(characterYamlPath);
    Log.info(
      `rootDirの変更に伴うcharacter.yaml有無の確認。${hasCharacterYaml_}`,
      "CharacterYamlPanel"
    );
    setHasCharacterYaml(hasCharacterYaml_);
  }, [props.rootDir, props.files]);

  /** character.yamlの更新要否の変更 */
  const OnChangeUpdate = () => {
    const newValue = !props.update;
    props.setUpdate(newValue);
    if (newValue && props.characterYaml === null) {
      Log.info(`character.yamlが存在しないため自動生成。`, "CharacterYamlPanel");
      props.setCharacterYaml({});
    }
  };
  /** TextFileEncodingの要否*/
  const OnChangeTextFileEncoding = () => {
    if (props.characterYaml.text_file_encoding === "shift_jis") {
      const c = { ...props.characterYaml };
      c.text_file_encoding = "";
      props.setCharacterYaml(c);
      Log.info(
        `character.yamlの変更。key=TextFileEncoding,value=""`,
        "CharacterYamlPanel"
      );
    } else {
      const c = { ...props.characterYaml };
      c.text_file_encoding = "shift_jis";
      props.setCharacterYaml(c);
      Log.info(
        `character.yamlの変更。key=TextFileEncoding,value="shift_jis"`,
        "CharacterYamlPanel"
      );
    }
  };

  const OnChangeDefaultPhonemizer=()=>{
    if (props.characterYaml.default_phonemizer === "OpenUtau.Plugin.Builtin.JapanesePresampPhonemizer") {
      const c = { ...props.characterYaml };
      c.default_phonemizer = "";
      props.setCharacterYaml(c);
      Log.info(
        `character.yamlの変更。key=DefaultPhonemizer,value=""`,
        "CharacterYamlPanel"
      );
    } else {
      const c = { ...props.characterYaml };
      c.default_phonemizer = "OpenUtau.Plugin.Builtin.JapanesePresampPhonemizer";
      props.setCharacterYaml(c);
      Log.info(
        `character.yamlの変更。key=DefaultPhonemizer,value="OpenUtau.Plugin.Builtin.JapanesePresampPhonemizer"`,
        "CharacterYamlPanel"
      );
    }
  }

  /** Voiceの変更 */
  const OnVoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = { ...props.characterYaml };
    c.voice = e.target.value;
    props.setCharacterYaml(c);
    Log.info(
      `character.yamlの変更。key=Voice,value=${e.target.value}`,
      "CharacterYamlPanel"
    );
  };

  const OnPortraitOpacityChange = (e: Event, newValue: number) => {
    const c = { ...props.characterYaml };
    c.portrait_opacity = newValue;
    props.setCharacterYaml(c);
    Log.info(
      `character.yamlの変更。key=PortraitOpacity,value=${newValue}`,
      "CharacterYamlPanel"
    );
  };

  const OnPortraitHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = { ...props.characterYaml };
    c.portrait_height = parseInt(e.target.value);
    props.setCharacterYaml(c);
    Log.info(
      `character.yamlの変更。key=PortraitHeight,value=${e.target.value}`,
      "CharacterYamlPanel"
    );
  };
  return (
    <Box>
      <CommonCheckBox
        checked={props.update}
        setChecked={OnChangeUpdate}
        label={t("editor.characterYaml.check")}
      />
      <br />
      <Typography variant="caption">
        {t("editor.characterYaml.description")}
      </Typography>
      <br />

      {/* ファイル選択セレクトボックス */}
      {characterYamlFiles.length > 0 && (
        <>
          <FullWidthSelect
            label={t("editor.characterYaml.selectFile")}
            value={props.characterYamlPath}
            onChange={onFilePathChange}
            disabled={!props.update}
          >
            {characterYamlFiles.map((path) => (
              <MenuItem key={path} value={path}>
                {path}
              </MenuItem>
            ))}
          </FullWidthSelect>
          <br />
        </>
      )}

      {props.characterYaml !== null && (
        <>
          <Box sx={{ m: 1 }}>
            <CommonCheckBox
              checked={props.characterYaml.text_file_encoding === "shift_jis"}
              setChecked={OnChangeTextFileEncoding}
              label={t("editor.characterYaml.TextFileEncoding")}
              disabled={!props.update}
            />
          </Box>
          <Box sx={{ m: 1 }}>
            <CommonCheckBox
              checked={props.characterYaml.default_phonemizer === "OpenUtau.Plugin.Builtin.JapanesePresampPhonemizer"}
              setChecked={OnChangeDefaultPhonemizer}
              label={t("editor.characterYaml.DefaultPhonemizer")}
              disabled={!props.update}
            />
          </Box>
          <FullWidthTextField
            type="text"
            label={t("editor.characterYaml.Voice")}
            value={props.characterYaml.voice ? props.characterYaml.voice : ""}
            disabled={!props.update}
            onChange={OnVoiceChange}
          />
          <PortraitSelect
            rootDir={props.rootDir}
            zipFiles={props.zipFiles}
            files={props.files}
            hasCharacterYaml={hasCharacterYaml}
            characterYaml={props.characterYaml}
            setCharacterYaml={props.setCharacterYaml}
            update={props.update}
            setPortraitBuf={props.setPortraitBuf}
            characterYamlPath={props.characterYamlPath}
          />
          {props.characterYaml.portrait && (
            <>
              <Box sx={{ m: 1 }}>
                <Typography variant="caption">
                  {t("editor.characterYaml.PortraitOpacity")}
                </Typography>
                <Slider
                  value={
                    props.characterYaml.portrait_opacity !== undefined
                      ? props.characterYaml.portrait_opacity
                      : 0.67
                  }
                  onChange={OnPortraitOpacityChange}
                  disabled={!props.update}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </Box>
              <FullWidthTextField
                type="number"
                label={t("editor.characterYaml.PortraitHeight")}
                value={
                  props.characterYaml.portrait_height !== undefined
                    ? props.characterYaml.portrait_height
                    : 0
                }
                disabled={!props.update}
                onChange={OnPortraitHeightChange}
              />
            </>
          )}
        </>
      )}
    </Box>
  );
};
export interface CharacterYamlPanelProps {
  /** 音源ルート */
  rootDir: string;
  /** zip内のファイル一覧 */
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  } | null;
  /** ファイル一覧 */
  files: string[];
  /** character.yamlファイルの中身 */
  characterYaml: CharacterYaml | null;
  /** character.yamlファイルの変更処理 */
  setCharacterYaml: React.Dispatch<React.SetStateAction<CharacterYaml | null>>;
  /** character.yamlファイル更新の要否 */
  update: boolean;
  /** character.yamlファイル更新要否の変更処理 */
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  /** 立ち絵アップロード */
  setPortraitBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
  /** 読み込むcharacter.yamlのパス */
  characterYamlPath: string;
  /** 読み込むcharacter.yamlのパス変更処理 */
  setCharacterYamlPath: React.Dispatch<React.SetStateAction<string>>;
  /** character.yaml再読み込み時のコールバック */
  onReload?: (path: string) => void;
}

interface CharacterYaml {
  portrait?: string;
  portrait_opacity?: number;
  portrait_height?: number;
  voice?: string;
  text_file_encoding?: string;
  default_phonemizer?:string;
}
