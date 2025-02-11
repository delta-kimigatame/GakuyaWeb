import * as React from "react";
import JSZip from "jszip";
import yaml from "js-yaml";
import * as iconv from "iconv-lite";
import { useTranslation } from "react-i18next";

import { PaletteMode } from "@mui/material";

import TabContext from "@mui/lab/TabContext";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

import { BasePaper } from "../Common/BasePaper";
import { setting } from "../../settings/setting";
import { ReadMePanel } from "./ReadMePanel";
import { InstallTextPanel } from "./InstallTxtPanel";

import { InstallTxt } from "../../Lib/InstallTxt";
import { CharacterTxt } from "../../Lib/CharacterTxt";
import { PrefixMap } from "../../Lib/PrefixMap";
import { Log } from "../../Lib/Logging";
import { FileReadAsync } from "../../Lib/FileReadAsync";
import { CharacterTxtPanel } from "./CharacterTxtPanel";
import { Divider } from "@mui/material";
import { CharacterYamlPanel } from "./CharacterYamlPanel";
import { PrefixMapPanel } from "./PrefixMapPanel";
import { FileCheckPanel } from "./FileCheckPanel";
import { FullWidthButton } from "../Common/FullWidthButton";
import { Wave } from "utauwav";
import { GenerateFrq } from "../../Lib/GenerateFrq";
import { World } from "tsworld";

export const EditorView: React.FC<EditorViewProps> = (props) => {
  const { t } = useTranslation();
  /** tabの選択状態 */
  const [selectTab, setSelectTab] = React.useState(0);
  /** 実行設定 */
  const [flags, setFlags] = React.useState<FileCheckFlags>({
    remove: {},
    frq: {},
    oto: {},
    wav: {},
  });
  /** install.txt */
  const [install, setInstall] = React.useState<InstallTxt | null>(null);
  const [installUpdate, setInstallUpdate] = React.useState<boolean>(false);
  /** character.txt */
  const [character, setCharacter] = React.useState<CharacterTxt | null>(null);
  const [characterUpdate, setCharacterUpdate] = React.useState<boolean>(false);
  /** icon画像 */
  const [iconBuf, setIconBuf] = React.useState<ArrayBuffer>();
  /** sample音声 */
  const [sampleBuf, setSampleBuf] = React.useState<ArrayBuffer>();
  /** character.yaml */
  const [characterYaml, setCharacterYaml] = React.useState<{} | null>(null);
  const [characterYamlUpdate, setCharacterYamlUpdate] =
    React.useState<boolean>(false);
  /** portrait */
  const [portraitBuf, setPortraitBuf] = React.useState<ArrayBuffer>();
  /** readme.txt */
  const [readme, setReadme] = React.useState<string>("");
  const [readmeUpdate, setReadmeUpdate] = React.useState<boolean>(false);
  /** prefix.map */
  const [prefixMaps, setPrefixMaps] = React.useState<{ string?: PrefixMap }>(
    {}
  );
  const [prefixMapsUpdate, setPrefixMapsUpdate] =
    React.useState<boolean>(false);
  /** 音源ルート */
  const [rootDir, setRootDir] = React.useState<string | null>(null);
  /** ファイル一覧 */
  const [files, setFiles] = React.useState<string[]>([]);
  /** フォルダ名一覧 */
  const [directories, setDirectories] = React.useState<Array<string>>([]);

  /** zipの書き出し中 */
  const [progress, setProgress] = React.useState<boolean>(false);
  /** download zip */
  const [zipUrl, setZipUrl] = React.useState<string>("");
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
      Log.log(`zipFilesからファイル一覧の取得`, "EditorView");
      const files_ =
        props.zipFiles !== null
          ? Object.keys(props.zipFiles)
          : new Array<string>();
      setFiles(files_);
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
      } else {
        setInstall(null);
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
      } else {
        setCharacter(null);
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
      } else {
        setReadme("");
      }
      let maps = {};
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
            maps[""] = value;
            setPrefixMaps(maps);
          });
      } else {
        setPrefixMaps({});
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
              setPrefixMaps(maps);
            }
          });
      } else {
        setCharacterYaml(null);
      }
    }
  }, [rootDir]);

  const ZipExtractBase = (
    newRootDir: string,
    filelist: string[],
    index: number,
    newZip: JSZip,
    world: World
  ) => {
    const f = filelist[index];
    const reg = new RegExp("^" + rootDir);
    if (index >= filelist.length ) {
      ZipExtractMake(newRootDir, newZip);
    } else if (IsDelete(f, flags)) {
      Log.log(`${f}は設定に従い削除されました。`, "EditorView");
      ZipExtractBase(newRootDir, filelist, index + 1, newZip, world);
    } else if (f.endsWith("character.txt") && characterUpdate) {
      Log.log(`${f}は設定項目から別途作成されます。`, "EditorView");
      ZipExtractBase(newRootDir, filelist, index + 1, newZip, world);
    } else if (
      (f.endsWith("character.yaml") && characterYamlUpdate) ||
      (prefixMapsUpdate && Object.keys(prefixMaps).length >= 2)
    ) {
      Log.log(`${f}は設定項目から別途作成されます。`, "EditorView");
      ZipExtractBase(newRootDir, filelist, index + 1, newZip, world);
    } else if (f.endsWith("readme.txt") && readmeUpdate) {
      Log.log(`${f}は設定項目から別途作成されます。`, "EditorView");
      ZipExtractBase(newRootDir, filelist, index + 1, newZip, world);
    } else if (f.endsWith("prefix.map") && prefixMapsUpdate) {
      Log.log(`${f}は設定項目から別途作成されます。`, "EditorView");
      ZipExtractBase(newRootDir, filelist, index + 1, newZip, world);
    } else {
      const newFileName = f.replace(
        reg,
        newRootDir + rootDir === "" ? "/" : ""
      );
      props.zipFiles[f].async("arraybuffer").then((buf) => {
        if (f.endsWith(".wav")) {
          const wav = new Wave(buf);
          Log.log(`${f}をwavとして読み込みました。`, "EditorView");
          if (flags.wav.stereo) {
            wav.channels = 1;
            Log.log(`${f}をモノラルに変換しました。`, "EditorView");
          }
          if (flags.wav.sampleRate) {
            wav.sampleRate = 44100;
            Log.log(`${f}を44,100Hzに変換しました`, "EditorView");
          }
          if (flags.wav.depth) {
            wav.bitDepth = 16;
            Log.log(`${f}のbit深度を16bitに設定しました`, "EditorView");
          }
          if (flags.wav.dcoffset) {
            wav.RemoveDCOffset();
            Log.log(`${f}のDCoffsetを除去しました`, "EditorView");
          }
          newZip.file(newFileName, wav.Output());
          Log.log(
            `${f}を${newFileName}としてzipに格納しました。`,
            "EditorView"
          );
          const frqPath = f.replace(".wav", "_wav.frq");
          if (flags.frq.frq && !(frqPath in props.zipFiles)) {
            Log.log(`${frqPath}が存在しないため生成します。`, "EditorView");
            const ndata = Float64Array.from(wav.LogicalNormalize(1));
            const frq = GenerateFrq(world, ndata, 44100, 256);
            newZip.file(frqPath, frq.Output());
            Log.log(`${frqPath}をzipに格納しました。`, "EditorView");
          }
        } else {
          newZip.file(newFileName, buf);
          Log.log(
            `${f}を${newFileName}としてzipに格納しました。`,
            "EditorView"
          );
        }
        ZipExtractBase(newRootDir, filelist, index + 1, newZip, world);
      });
    }
  };
  const ZipExtractMake = (newRootDir: string, newZip: JSZip) => {
    if (flags.oto.root && newRootDir + "/oto.ini" in newZip.files) {
      const o_output = new File([""], "character.txt", {
        type: "text/plane;charset=shift-jis",
      });
      newZip.file(newRootDir + "//oto.ini", o_output);
      Log.log(
        `空のoto.iniを作成し、${newRootDir + "/oto.ini"}に格納しました。`,
        "EditorView"
      );
    }
    if (characterUpdate) {
      const c = {
        name: character.name,
        image: character.image,
        sample: character.sample,
        author: character.author,
        web: character.web,
        version: character.web,
      };
      if (character.image === "upload") {
        let i = 0;
        while (
          newRootDir + "/icon" + (i === 0 ? "" : i.toString()) + ".bmp" in
          newZip.files
        ) {
          i++;
        }
        const iconPath = "icon" + (i === 0 ? "" : i.toString()) + ".bmp";
        c.image = iconPath;
        newZip.file(iconPath, iconBuf);
        Log.log(
          `${newRootDir + "/" + iconPath}をzipに格納しました。`,
          "EditorView"
        );
      }
      if (character.sample === "upload") {
        let i = 0;
        while (
          newRootDir + "/sample" + (i === 0 ? "" : i.toString()) + ".wav" in
          newZip.files
        ) {
          i++;
        }
        const samplePath = "sample" + (i === 0 ? "" : i.toString()) + ".wav";
        c.sample = samplePath;
        newZip.file(samplePath, sampleBuf);
        Log.log(
          `${newRootDir + "/" + samplePath}をzipに格納しました。`,
          "EditorView"
        );
      }
      const c_output = new File(
        [iconv.encode(new CharacterTxt(c).OutputTxt(), "Windows-31j")],
        "character.txt",
        { type: "text/plane;charset=shift-jis" }
      );
      newZip.file(newRootDir + "/character.txt", c_output);
      Log.log(
        `${newRootDir + "/character.txt"}をzipに格納しました。`,
        "EditorView"
      );
    }
    if (
      characterYamlUpdate ||
      (prefixMapsUpdate && Object.keys(prefixMaps).length >= 2)
    ) {
      const subbanks = [];
      Object.keys(prefixMaps).forEach((color) => {
        const temp_subbanks = prefixMaps[color].OutputSubbanks();
        temp_subbanks.forEach((t) => {
          t.color = color;
          subbanks.push(t);
        });
      });
      if (subbanks.length !== 0) {
        characterYaml["subbanks"] = subbanks;
      }
      const c = yaml.dump(characterYaml);
      const c_output = new File([iconv.encode(c, "utf-8")], "character.yaml", {
        type: "text/plane;charset=utf-8",
      });
      newZip.file(newRootDir + "/character.yaml", c_output);
      Log.log(
        `${newRootDir + "/character.yaml"}をzipに格納しました。`,
        "EditorView"
      );
    }
    if (readmeUpdate) {
      const r_output = new File(
        [iconv.encode(readme, "Windows-31j")],
        "readme.txt",
        { type: "text/plane;charset=shift-jis" }
      );
      newZip.file(newRootDir + "/readme.txt", r_output);
      Log.log(
        `${newRootDir + "/readme.txt"}をzipに格納しました。`,
        "EditorView"
      );
    }
    if (prefixMapsUpdate) {
      const p_output = new File(
        [iconv.encode(prefixMaps[""].OutputMap(), "Windows-31j")],
        "prefix.map",
        { type: "text/plane;charset=shift-jis" }
      );
      newZip.file(newRootDir + "/prefix.map", p_output);
      Log.log(
        `${newRootDir + "/prefix.map"}をzipに格納しました。`,
        "EditorView"
      );
    }
    if (installUpdate) {
      const i_output = new File(
        [iconv.encode(install.OutputTxt(), "Windows-31j")],
        "install.txt",
        { type: "text/plane;charset=shift-jis" }
      );
      newZip.file("install.txt", i_output);
      Log.log(`${"install.txt"}をzipに格納しました。`, "EditorView");
    }
    newZip
      .generateAsync({
        type: "uint8array",
        // @ts-expect-error 型の方がおかしい
        encodeFileName: (fileName) => iconv.encode(fileName, "CP932"),
      })
      .then((result) => {
        const zipFile = new Blob([result], {
          type: "application/zip",
        });
        setProgress(false);
        setZipUrl(URL.createObjectURL(zipFile));
      });
  };

  const OnOutputClick = async () => {
    setProgress(true);
    const newZip = new JSZip();
    const newRootDir =
      rootDir === ""
        ? props.zipFileName.replace(".zip", "")
        : rootDir.split("/").slice(-1)[0];
    const world = new World();
    await world.Initialize();
    Log.log(`zipの生成。${rootDir}以下を${newRootDir}に配置`, "EditorView");
    ZipExtractBase(
      newRootDir,
      Object.keys(props.zipFiles)
        .filter((f) => f.startsWith(rootDir))
        .sort(),
      0,
      newZip,
      world
    );
  };

  return (
    <BasePaper
      title={setting.productName}
      body={
        <>
          <FullWidthButton color="primary" onClick={OnOutputClick}>
            {progress ? <CircularProgress /> : t("editor.output")}
          </FullWidthButton>
          {zipUrl !== "" && (
            <Button
              fullWidth
              color="primary"
              variant="contained"
              sx={{ textTransform: "none", m: 1 }}
              href={zipUrl === null ? "" : zipUrl}
              size="large"
              download={props.zipFileName.replace(
                ".zip",
                new Date().toJSON() + ".zip"
              )}
            >
              {t("editor.download")}
            </Button>
          )}
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
            <TabPanel value={0} sx={{ p: 1 }}>
              <FileCheckPanel
                rootDir={rootDir}
                setRootDir={setRootDir}
                files={files}
                directories={directories}
                flags={flags}
                setFlags={setFlags}
              />
            </TabPanel>
            <TabPanel value={1} sx={{ p: 1 }}>
              <CharacterTxtPanel
                rootDir={rootDir}
                files={files}
                zipFileName={props.zipFileName}
                zipFiles={props.zipFiles}
                characterTxt={character}
                setCharacterTxt={setCharacter}
                characterTxtUpdate={characterUpdate}
                setCharacterTxtUpdate={setCharacterUpdate}
                setIconBuf={setIconBuf}
                setSampleBuf={setSampleBuf}
              />
              <Divider />
              <CharacterYamlPanel
                rootDir={rootDir}
                files={files}
                zipFiles={props.zipFiles}
                characterYaml={characterYaml}
                setCharacterYaml={setCharacterYaml}
                update={characterYamlUpdate}
                setUpdate={setCharacterYamlUpdate}
                setPortraitBuf={setPortraitBuf}
              />
            </TabPanel>
            <TabPanel value={2} sx={{ p: 1 }}>
              <ReadMePanel
                readme={readme}
                setReadme={setReadme}
                update={readmeUpdate}
                setUpdate={setReadmeUpdate}
              />
            </TabPanel>
            <TabPanel value={3} sx={{ p: 1 }}>
              <InstallTextPanel
                rootDir={rootDir}
                install={install}
                zipFileName={props.zipFileName}
                setInstall={setInstall}
                update={installUpdate}
                setUpdate={setInstallUpdate}
              />
            </TabPanel>
            <TabPanel value={4} sx={{ p: 1 }}>
              <PrefixMapPanel
                prefixMaps={prefixMaps}
                setPrefixMaps={setPrefixMaps}
                update={prefixMapsUpdate}
                setUpdate={setPrefixMapsUpdate}
                mode={props.mode}
              />
            </TabPanel>
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
  /**zipファイル名 */
  zipFileName: string;
  /**ダークモードかライトモードか */
  mode: PaletteMode;
}

interface RemoveFlags {
  read?: boolean;
  uspec?: boolean;
  setparam?: boolean;
  vlabeler?: boolean;
}

interface FrqFlags {
  frq?: boolean;
  pmk?: boolean;
  frc?: boolean;
  vs4ufrq?: boolean;
  world?: boolean;
  llsm?: boolean;
  mrq?: boolean;
}

interface OtoFlags {
  root?: boolean;
}

interface WavFlags {
  stereo?: boolean;
  sampleRate?: boolean;
  depth?: boolean;
  dcoffset?: boolean;
}

export interface FileCheckFlags {
  remove: RemoveFlags;
  frq: FrqFlags;
  oto: OtoFlags;
  wav: WavFlags;
}

export const IsDelete = (f: string, flags: FileCheckFlags): boolean => {
  if (flags.remove.read && f.endsWith("$read")) {
    return true;
  }
  if (flags.remove.uspec && f.endsWith(".uspec")) {
    return true;
  }
  if (flags.remove.setparam && f.endsWith("oto.setParam-Scache")) {
    return true;
  }
  if (flags.remove.vlabeler && f.includes(".lbp.caches/")) {
    return true;
  }
  if (flags.remove.vlabeler && f.endsWith(".lbp")) {
    return true;
  }
  if (flags.frq.pmk && f.endsWith(".pmk")) {
    return true;
  }
  if (flags.frq.frc && f.endsWith(".frc")) {
    return true;
  }
  if (flags.frq.vs4ufrq && f.endsWith(".vs4ufrq")) {
    return true;
  }
  if (
    flags.frq.world &&
    (f.endsWith(".dio") || f.endsWith(".stac") || f.endsWith(".platinum"))
  ) {
    return true;
  }
  if (flags.frq.llsm && f.endsWith(".llsm")) {
    return true;
  }
  if (flags.frq.mrq && f.endsWith(".mrq")) {
    return true;
  }
  return false;
};
