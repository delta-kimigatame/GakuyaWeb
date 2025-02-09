import * as React from "react";
import JSZip from "jszip";
import yaml from "js-yaml";
import { useTranslation } from "react-i18next";

import TabContext from "@mui/lab/TabContext";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";

import { BasePaper } from "../Common/BasePaper";
import { setting } from "../../settings/setting";

import { InstallTxt } from "../../Lib/InstallTxt";
import { CharacterTxt } from "../../Lib/CharacterTxt";
import { PrefixMap } from "../../Lib/PrefixMap";
import { Log } from "../../Lib/Logging";
import { FileReadAsync } from "../../Lib/FileReadAsync";

export const EditorView: React.FC<EditorViewProps> = (props) => {
  const { t } = useTranslation();
  /** tabの選択状態 */
  const [selectTab, setSelectTab] = React.useState(0);
  /** install.txt */
  const [install, setInstall] = React.useState<InstallTxt | null>(null);
  /** character.txt */
  const [character, setCharacter] = React.useState<CharacterTxt | null>(null);
  /** character.yaml */
  const [characterYaml, setCharacterYaml] = React.useState<{} | null>(null);
  /** readme.txt */
  const [readme, setReadme] = React.useState<string>("");
  /** prefix.map */
  const [prefixMaps, setPrefixMaps] = React.useState<{ string?: PrefixMap }>(
    {}
  );
  /** 音源ルート */
  const [rootDir, setRootDir] = React.useState<string | null>(null);
  /** フォルダ名一覧 */
  const [directories, setDirectories] = React.useState<Array<string>>([]);

  /**
   * zipが読み込まれた際の処理
   */
  React.useEffect(() => {
    if (props.zipFiles === null) {
      Log.log(`初期化`, "EditorView");
    } else {
      Log.log(`zipファイル読み込み、フォルダ構造探索`, "EditorView");
      const dirs: Array<string> = new Array("");
      let rootDir_ = "";
      Object.keys(props.zipFiles).forEach((f) => {
        const tmps = f.split("/").slice(0, -1).join("/");
        if (!dirs.includes(tmps)) {
          dirs.push(tmps);
        }
        if (f.endsWith("character.txt")) {
          Log.log(`character.txtがみつかりました。${f}`, "EditorView");
          rootDir_ = tmps;
        }
      });
      Log.log(`フォルダ読込完了。[${dirs}]`, "EditorView");
      Log.log(`音源ルート。${rootDir_}`, "EditorView");
      setDirectories(dirs);
      setRootDir(rootDir_);
    }
  }, [props.zipFiles]);

  React.useEffect(() => {
    if (rootDir === null) {
      Log.log(`rootDir初期化`, "EditorView");
      setInstall(null);
      setCharacter(null);
      setCharacterYaml(null);
      setReadme("");
      setPrefixMaps({});
    } else {
      let installTextTemp =
        rootDir.split("/").slice(0, -1).join("/") + "/install.txt";
      if (installTextTemp === "/install.txt") {
        installTextTemp = "install.txt";
      }
      if (Object.keys(props.zipFiles).includes(installTextTemp)) {
        Log.log(
          `install.txtが見つかりました。${installTextTemp}`,
          "EditorView"
        );
        props.zipFiles[installTextTemp]
          .async("arraybuffer")
          .then(async (buf) => {
            const txt = await FileReadAsync(buf);
            const value = new InstallTxt({ txt: txt });
            Log.log(
              `install.txtの読込完了 folder=${value.folder}`,
              "EditorView"
            );
            setInstall(value);
          });
      }
      if (Object.keys(props.zipFiles).includes(rootDir + "/character.txt")) {
        Log.log(
          `character.txtがみつかりました。${rootDir + "/character.txt"}`,
          "EditorView"
        );
        props.zipFiles[rootDir + "/character.txt"]
          .async("arraybuffer")
          .then(async (buf) => {
            const txt = await FileReadAsync(buf);
            const value = new CharacterTxt({ txt: txt });
            Log.log(`character.txtの読込完了 name=${value.name}`, "EditorView");
            setCharacter(value);
          });
      }
      if (Object.keys(props.zipFiles).includes(rootDir + "/readme.txt")) {
        Log.log(
          `readme.txtがみつかりました。${rootDir + "/readme.txt"}`,
          "EditorView"
        );
        props.zipFiles[rootDir + "/readme.txt"]
          .async("arraybuffer")
          .then(async (buf) => {
            const txt = await FileReadAsync(buf);
            Log.log(`readme.txtの読込完了 ${txt}`, "EditorView");
            setReadme(txt);
          });
      }
      if (Object.keys(props.zipFiles).includes(rootDir + "/prefix.map")) {
        Log.log(
          `prefix.mapがみつかりました。${rootDir + "/prefix.map"}`,
          "EditorView"
        );
        props.zipFiles[rootDir + "/prefix.map"]
          .async("arraybuffer")
          .then(async (buf) => {
            const txt = await FileReadAsync(buf);
            const value = new PrefixMap(txt);
            Log.log(`prefix.mapの読込完了 ${txt}`, "EditorView");
            const prefixMaps_ = { ...prefixMaps };
            prefixMaps_[""] = value;
            setPrefixMaps(prefixMaps_);
          });
      }
      if (Object.keys(props.zipFiles).includes(rootDir + "/character.yaml")) {
        Log.log(
          `character.yamlがみつかりました。${rootDir + "/character.yaml"}`,
          "EditorView"
        );
        props.zipFiles[rootDir + "/character.yaml"]
          .async("arraybuffer")
          .then(async (buf) => {
            const txt = await FileReadAsync(buf, "UTF8");
            const value = yaml.load(txt);
            Log.log(`character.yamlの読込完了 name=${txt}`, "EditorView");
            setCharacterYaml(value);
            if (value.subbanks) {
              Log.log(`character.yamlにsubbanksが見つかりました`, "EditorView");
              const maps = { ...prefixMaps };
              for (let i = 0; i < value.subbanks.length; i++) {
                if (
                  value.subbanks[i].color === "" &&
                  Object.keys(props.zipFiles).includes(rootDir + "/prefix.map")
                ) {
                  Log.log(
                    `subbanks.color=""はprefix.mapと競合するため無視されました`,
                    "EditorView"
                  );
                } else {
                  for (
                    let j = 0;
                    j < value.subbanks[i].tone_ranges.length;
                    j++
                  ) {
                    if (Object.keys(maps).includes(value.subbanks[i].color)) {
                      maps[value.subbanks[i].color].SetRangeValues(
                        value.subbanks[i].tone_ranges[j],
                        value.subbanks[i].prefix,
                        value.subbanks[i].suffix
                      );
                      Log.log(
                        `subbanks.color=${value.subbanks[i].color}にprefix=${value.subbanks[i].prefix}、suffix=${value.subbanks[i].suffix}、range=${value.subbanks[i].tone_ranges[j]}を設定しました`,
                        "EditorView"
                      );
                    } else {
                      maps[value.subbanks[i].color] = new PrefixMap();
                      Log.log(
                        `subbanks.color=${value.subbanks[i].color}を追加しました`,
                        "EditorView"
                      );
                      maps[value.subbanks[i].color].SetRangeValues(
                        value.subbanks[i].tone_ranges[j],
                        value.subbanks[i].prefix,
                        value.subbanks[i].suffix
                      );
                      Log.log(
                        `subbanks.color=${value.subbanks[i].color}にprefix=${value.subbanks[i].prefix}、suffix=${value.subbanks[i].suffix}、range=${value.subbanks[i].tone_ranges[j]}を設定しました`,
                        "EditorView"
                      );
                    }
                  }
                }
              }
            }
          });
      }
    }
  }, [rootDir]);

  return (
    <BasePaper
      title={setting.productName}
      body={
        <>
          <TabContext value={selectTab}>
            <Tabs
              value={selectTab}
              onChange={(e, newValue: number) => {
                setSelectTab(newValue);
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                label={t("editor.file_check.title")}
                style={{ textTransform: "none" }}
                value={0}
              />
              <Tab
                label={t("editor.character.title")}
                style={{ textTransform: "none" }}
                value={1}
              />
              <Tab
                label={t("editor.readme.title")}
                style={{ textTransform: "none" }}
                value={2}
              />
              <Tab
                label={t("editor.install.title")}
                style={{ textTransform: "none" }}
                value={3}
              />
              <Tab
                label={t("editor.prefixmap.title")}
                style={{ textTransform: "none" }}
                value={4}
              />
            </Tabs>
            <TabPanel value={0}>0</TabPanel>
            <TabPanel value={1}>1</TabPanel>
            <TabPanel value={2}>2</TabPanel>
            <TabPanel value={3}>3</TabPanel>
            <TabPanel value={4}>4</TabPanel>
          </TabContext>
        </>
      }
    ></BasePaper>
  );
};

export interface EditorViewProps {
  /** zipファイル。 */
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  } | null;
}
