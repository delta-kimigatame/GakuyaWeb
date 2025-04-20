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

import { InstallTxt } from "../../lib/InstallTxt";
import { CharacterTxt } from "../../lib/CharacterTxt";
import { PrefixMap } from "../../lib/PrefixMap";
import { Log } from "../../lib/Logging";
import { FileReadAsync } from "../../services/FileReadAsync";
import { CharacterTxtPanel } from "./CharacterTxtPanel";
import { Divider } from "@mui/material";
import { CharacterYamlPanel } from "./CharacterYamlPanel";
import { PrefixMapPanel } from "./PrefixMapPanel";
import { FileCheckPanel } from "./FileCheckPanel";
import { FullWidthButton } from "../Common/FullWidthButton";
import { Wave } from "utauwav";
import { GenerateFrq } from "../../lib/GenerateFrq";
import { World } from "tsworld";
import {
  ExtractCharacterTxt,
  ExtractCharacterYaml,
  ExtractInstallTxt,
  ExtractPrefixMap,
  ExtractReadme,
  ExtractRootOto,
  GetNewFileName,
} from "../../services/OutputZip";
import {
  GetCharacterTxt,
  GetCharacterYaml,
  GetInstallTxt,
  GetPrefixMap,
  GetReadme,
} from "../../services/InputZip";
import { FileList } from "./FileCheck/FileList";

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
  /** 現在処理中のファイル */
  const [outputIndex, setOutputIndex] = React.useState<number>(0);
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

  const InputZip = async () => {
    const install = await GetInstallTxt(
      rootDir,
      props.zipFileName,
      props.zipFiles
    );
    setInstall(install);
    const gcr = await GetCharacterTxt(
      rootDir,
      props.zipFileName,
      props.zipFiles
    );
    setCharacter(gcr.value);
    setCharacterUpdate(gcr.update);
    const readme = await GetReadme(rootDir, props.zipFiles);
    setReadme(readme);
    const maps = await GetPrefixMap(rootDir, props.zipFiles);
    const gcyr = await GetCharacterYaml(rootDir, props.zipFiles, maps);
    setCharacterYaml(gcyr.yaml);
    setPrefixMaps(gcyr.maps);
  };

  React.useEffect(() => {
    if (rootDir === null) {
      Log.log(`rootDir初期化`, "EditorView");
      setInstall(null);
      setCharacter(null);
      setCharacterYaml(null);
      setReadme("");
      setPrefixMaps({});
    } else {
      InputZip();
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
    setOutputIndex(index);
    if (index >= filelist.length) {
      ZipExtractMake(newRootDir, newZip);
    } else if (IsDelete(f, flags)) {
      Log.log(`${f}は設定に従い削除されました。`, "EditorView");
      ZipExtractBase(newRootDir, filelist, index + 1, newZip, world);
    } else if (f.endsWith("character.txt") && characterUpdate) {
      Log.log(`${f}は設定項目から別途作成されます。`, "EditorView");
      ZipExtractBase(newRootDir, filelist, index + 1, newZip, world);
    } else if (
      f.endsWith("character.yaml") &&
      (characterYamlUpdate ||
        (prefixMapsUpdate && Object.keys(prefixMaps).length >= 2))
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
      const newFileName = GetNewFileName(rootDir, newRootDir, f);
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
    const newZip7 = ExtractRootOto(newRootDir, newZip, flags.oto.root);
    const newZip6 = ExtractCharacterTxt(
      newRootDir,
      characterUpdate,
      character,
      newZip7,
      iconBuf,
      sampleBuf
    );
    const newZip5 = ExtractCharacterYaml(
      newRootDir,
      characterYamlUpdate,
      characterYaml,
      prefixMapsUpdate,
      prefixMaps,
      newZip6,
      portraitBuf
    );
    const newZip4 = ExtractReadme(newRootDir, readmeUpdate, readme, newZip5);
    const newZip3 = ExtractPrefixMap(
      newRootDir,
      prefixMapsUpdate,
      prefixMaps,
      newZip4
    );
    const newZip2 = ExtractInstallTxt(installUpdate, install, newZip3);
    newZip2
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
          <FullWidthButton
            color="primary"
            onClick={OnOutputClick}
            disabled={progress}
          >
            {progress ? (
              <>
                <CircularProgress />({outputIndex}/
                {
                  Object.keys(props.zipFiles).filter((f) =>
                    f.startsWith(rootDir)
                  ).length
                }
                )
              </>
            ) : (
              t("editor.output")
            )}
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
                label={t("editor.file_check.file_list")}
                style={{ textTransform: "none" }}
                value={1}
              />
              <Tab
                label={t("editor.character.title")}
                style={{ textTransform: "none" }}
                value={2}
              />
              <Tab
                label={t("editor.readme.title")}
                style={{ textTransform: "none" }}
                value={3}
              />
              <Tab
                label={t("editor.install.title")}
                style={{ textTransform: "none" }}
                value={4}
              />
              <Tab
                label={t("editor.prefixmap.title")}
                style={{ textTransform: "none" }}
                value={5}
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
              <FileList rootDir={rootDir} files={files} flags={flags} />
            </TabPanel>
            <TabPanel value={2} sx={{ p: 1 }}>
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
            <TabPanel value={3} sx={{ p: 1 }}>
              <ReadMePanel
                readme={readme}
                setReadme={setReadme}
                update={readmeUpdate}
                setUpdate={setReadmeUpdate}
              />
            </TabPanel>
            <TabPanel value={4} sx={{ p: 1 }}>
              <InstallTextPanel
                rootDir={rootDir}
                install={install}
                zipFileName={props.zipFileName}
                setInstall={setInstall}
                update={installUpdate}
                setUpdate={setInstallUpdate}
              />
            </TabPanel>
            <TabPanel value={5} sx={{ p: 1 }}>
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
