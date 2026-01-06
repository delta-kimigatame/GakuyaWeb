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

import { BasePaper } from "../../components/Common/BasePaper";
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
import { OtoIniPanel } from "./OtoIniPanel";
import { FullWidthButton } from "../../components/Common/FullWidthButton";
import { Wave } from "utauwav";
import { GenerateFrq } from "../../lib/GenerateFrq";
import { GenerateFrqWorkerPool } from "../../services/workerPool";
import { World } from "tsworld";
import { FrqListView } from "../FrqEditor/FrqListView";
import { Frq } from "../../lib/UtauFrq";
import {
  ExtractCharacterTxt,
  ExtractCharacterYaml,
  ExtractInstallTxt,
  ExtractPrefixMap,
  ExtractReadme,
  ExtractRootOto,
  ExtractAllOtoIni,
  GetNewFileName,
} from "../../services/OutputZip";
import {
  GetCharacterTxt,
  GetCharacterYaml,
  GetInstallTxt,
  GetPrefixMap,
  GetReadme,
  GetOtoIni,
  GetOtoIniFilePaths,
} from "../../services/InputZip";
import { FileList } from "../../components/Editor/FileCheck/FileList";

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
    encoding: {},
  });
  /** install.txt */
  const [install, setInstall] = React.useState<InstallTxt | null>(null);
  const [installUpdate, setInstallUpdate] = React.useState<boolean>(false);
  /** character.txt */
  const [character, setCharacter] = React.useState<CharacterTxt | null>(null);
  const [characterUpdate, setCharacterUpdate] = React.useState<boolean>(false);
  const [characterForceUpdate, setCharacterForceUpdate] = React.useState<boolean>(false);
  const [characterTxtEncoding, setCharacterTxtEncoding] = React.useState<string>("SJIS");
  const [characterTxtPath, setCharacterTxtPath] = React.useState<string>("");
  /** icon画像 */
  const [iconBuf, setIconBuf] = React.useState<ArrayBuffer>();
  /** sample音声 */
  const [sampleBuf, setSampleBuf] = React.useState<ArrayBuffer>();
  /** character.yaml */
  const [characterYaml, setCharacterYaml] = React.useState<{} | null>(null);
  const [characterYamlUpdate, setCharacterYamlUpdate] =
    React.useState<boolean>(false);
  const [characterYamlPath, setCharacterYamlPath] = React.useState<string>("");
  /** portrait */
  const [portraitBuf, setPortraitBuf] = React.useState<ArrayBuffer>();
  /** readme.txt */
  const [readme, setReadme] = React.useState<string>("");
  const [readmeUpdate, setReadmeUpdate] = React.useState<boolean>(false);
  const [readmeEncoding, setReadmeEncoding] = React.useState<string>("SJIS");
  const [readmePath, setReadmePath] = React.useState<string>("");
  /** prefix.map */
  const [prefixMaps, setPrefixMaps] = React.useState<{ string?: PrefixMap }>(
    {}
  );
  const [prefixMapsUpdate, setPrefixMapsUpdate] =
    React.useState<boolean>(false);
  const [prefixMapEncoding, setPrefixMapEncoding] = React.useState<string>("SJIS");
  const [prefixMapPath, setPrefixMapPath] = React.useState<string>("");
  /** oto.ini */
  const [otoEncodings, setOtoEncodings] = React.useState<Map<string, string>>(new Map());
  const [selectedOtoPath, setSelectedOtoPath] = React.useState<string>("");
  const [otoContent, setOtoContent] = React.useState<string>("");
  const [otoUpdate, setOtoUpdate] = React.useState<boolean>(false);
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
  /** Worker Pool for FRQ generation */
  const [workerPool, setWorkerPool] =
    React.useState<GenerateFrqWorkerPool | null>(null);
  /** 生成するfrqの数を管理する状態。デフォルトは0 */
  const [frqCount, setFrqCount] = React.useState<number>(0);
  /** 生成したfrqの数を管理する状態。デフォルトは0 */
  const [generatedFrqCount, setGeneratedFrqCount] = React.useState<number>(0);
  
  /** Frqエディタで更新されたfrqを保持 */
  const [updatedFrqs, setUpdatedFrqs] = React.useState<Map<string, Frq>>(new Map());
  
  /**
   * EditorViewがロードされたときにWorkerPoolを初期化
   */
  React.useEffect(() => {
    Log.info(
      `WorkerPool初期化開始。ワーカー数: ${props.workersCount}`,
      "EditorView"
    );
    const pool = new GenerateFrqWorkerPool(props.workersCount);
    setWorkerPool(pool);

    return () => {
      // クリーンアップ: 不要なタスクをクリア
      if (pool) {
        pool.clearTasks();
      }
    };
  }, [props.workersCount]);

  /**
   * zipが読み込まれた際の処理
   */
  React.useEffect(() => {
    if (props.zipFiles === null) {
      Log.info(`初期化`, "EditorView");
    } else {
      Log.info(`zipファイル読み込み、フォルダ構造探索`, "EditorView");
      const dirs: Array<string> = new Array("");
      let rootDir_ = "";
      Object.keys(props.zipFiles).forEach((f) => {
        const tmps = f.split("/").slice(0, -1).join("/");
        if (!dirs.includes(tmps)) {
          dirs.push(tmps);
        }
        if (f.endsWith("character.txt")) {
          Log.info(`character.txtがみつかりました。${f}`, "EditorView");
          rootDir_ = tmps;
        }
      });
      Log.info(`フォルダ読込完了。[${dirs}]`, "EditorView");
      Log.info(`音源ルート。${rootDir_}`, "EditorView");
      Log.info(`zipFilesからファイル一覧の取得`, "EditorView");
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
    
    // character.txtの自動選択
    const defaultCharacterTxtPath = rootDir === "" ? "character.txt" : rootDir + "/character.txt";
    if (Object.keys(props.zipFiles).includes(defaultCharacterTxtPath)) {
      setCharacterTxtPath(defaultCharacterTxtPath);
      const gcr = await GetCharacterTxt(
        rootDir,
        props.zipFileName,
        props.zipFiles,
        characterTxtEncoding,
        defaultCharacterTxtPath
      );
      setCharacter(gcr.value);
      setCharacterUpdate(gcr.update);
      setCharacterForceUpdate(gcr.update);
    } else {
      setCharacterTxtPath("");
      const gcr = await GetCharacterTxt(
        rootDir,
        props.zipFileName,
        props.zipFiles,
        characterTxtEncoding
      );
      setCharacter(gcr.value);
      setCharacterUpdate(gcr.update);
      setCharacterForceUpdate(gcr.update);
    }
    
    // rootDirが変更されるたびにreadme.txtの選択を再評価
    const defaultReadmePath = rootDir === "" ? "readme.txt" : rootDir + "/readme.txt";
    
    // デフォルトパスにreadme.txtが存在するかチェック
    if (Object.keys(props.zipFiles).includes(defaultReadmePath)) {
      // 存在する場合は自動選択
      setReadmePath(defaultReadmePath);
      const readme = await GetReadme(rootDir, props.zipFiles, readmeEncoding, defaultReadmePath);
      setReadme(readme);
    } else {
      // 存在しない場合は何も選択しない
      setReadmePath("");
      setReadme("");
    }
    
    // rootDirが変更されるたびにprefix.mapの選択を再評価
    const defaultPrefixMapPath = rootDir === "" ? "prefix.map" : rootDir + "/prefix.map";
    
    // デフォルトパスにprefix.mapが存在するかチェック
    if (Object.keys(props.zipFiles).includes(defaultPrefixMapPath)) {
      // 存在する場合は自動選択
      setPrefixMapPath(defaultPrefixMapPath);
      const maps = await GetPrefixMap(rootDir, props.zipFiles, prefixMapEncoding, defaultPrefixMapPath);
      
      // rootDirが変更されるたびにcharacter.yamlの選択を再評価
      const defaultCharacterYamlPath = rootDir === "" ? "character.yaml" : rootDir + "/character.yaml";
      
      if (Object.keys(props.zipFiles).includes(defaultCharacterYamlPath)) {
        // 存在する場合は自動選択
        setCharacterYamlPath(defaultCharacterYamlPath);
        const gcyr = await GetCharacterYaml(rootDir, props.zipFiles, maps, defaultCharacterYamlPath);
        setCharacterYaml(gcyr.yaml);
        setPrefixMaps(gcyr.maps);
      } else {
        // 存在しない場合は何も選択しない
        setCharacterYamlPath("");
        const gcyr = await GetCharacterYaml(rootDir, props.zipFiles, maps, "");
        setCharacterYaml(gcyr.yaml);
        setPrefixMaps(gcyr.maps);
      }
    } else {
      // 存在しない場合は何も選択しない
      setPrefixMapPath("");
      const maps = await GetPrefixMap(rootDir, props.zipFiles, prefixMapEncoding, "");
      
      // rootDirが変更されるたびにcharacter.yamlの選択を再評価
      const defaultCharacterYamlPath = rootDir === "" ? "character.yaml" : rootDir + "/character.yaml";
      
      if (Object.keys(props.zipFiles).includes(defaultCharacterYamlPath)) {
        // 存在する場合は自動選択
        setCharacterYamlPath(defaultCharacterYamlPath);
        const gcyr = await GetCharacterYaml(rootDir, props.zipFiles, maps, defaultCharacterYamlPath);
        setCharacterYaml(gcyr.yaml);
        setPrefixMaps(gcyr.maps);
      } else {
        // 存在しない場合は何も選択しない
        setCharacterYamlPath("");
        const gcyr = await GetCharacterYaml(rootDir, props.zipFiles, maps, "");
        setCharacterYaml(gcyr.yaml);
        setPrefixMaps(gcyr.maps);
      }
    }
    
    // oto.iniファイルの検出と初期化
    const otoFiles = GetOtoIniFilePaths(props.zipFiles);
    const newOtoEncodings = new Map<string, string>();
    
    for (const otoPath of otoFiles) {
      // デフォルトエンコーディングはSJIS
      newOtoEncodings.set(otoPath, "SJIS");
    }
    
    setOtoEncodings(newOtoEncodings);
    
    // rootDir直下のoto.iniを自動選択
    const defaultOtoPath = rootDir === "" ? "oto.ini" : rootDir + "/oto.ini";
    if (otoFiles.includes(defaultOtoPath)) {
      setSelectedOtoPath(defaultOtoPath);
      const otoText = await GetOtoIni(props.zipFiles, "SJIS", defaultOtoPath);
      setOtoContent(otoText);
    } else if (otoFiles.length > 0) {
      // rootDirにoto.iniがない場合、最初のファイルを選択
      setSelectedOtoPath(otoFiles[0]);
      const otoText = await GetOtoIni(props.zipFiles, "SJIS", otoFiles[0]);
      setOtoContent(otoText);
    } else {
      setSelectedOtoPath("");
      setOtoContent("");
    }
  };

  React.useEffect(() => {
    if (rootDir === null) {
      Log.info(`rootDir初期化`, "EditorView");
      setInstall(null);
      setCharacter(null);
      setCharacterYaml(null);
      setCharacterYamlPath("");
      setCharacterTxtPath("");
      setReadme("");
      setReadmePath("");
      setPrefixMaps({});
      setPrefixMapPath("");
      setOtoEncodings(new Map());
      setSelectedOtoPath("");
      setOtoContent("");
    } else {
      InputZip();
    }
  }, [rootDir]);

  const ZipExtractBase = (
    newRootDir: string,
    filelist: string[],
    index: number,
    newZip: JSZip,
    world: World,
    frqPromises: Promise<void>[] = []
  ) => {
    const f = filelist[index];
    setOutputIndex(index);
    if (index >= filelist.length) {
      // すべてのファイル処理完了後、FRQ生成の完了を待つ
      if (frqPromises.length > 0) {
        Log.info(
          `FRQ生成完了待機中... (${frqPromises.length}件)`,
          "EditorView"
        );
        Promise.all(frqPromises)
          .then(() => {
            Log.info(`すべてのFRQ生成が完了しました`, "EditorView");
            ZipExtractMake(newRootDir, newZip);
          })
          .catch((error) => {
            Log.error(
              `FRQ生成中にエラーが発生しました: ${error}`,
              "EditorView"
            );
            ZipExtractMake(newRootDir, newZip);
          });
      } else {
        ZipExtractMake(newRootDir, newZip);
      }
    } else if (IsDelete(f, flags)) {
      Log.info(`${f}は設定に従い削除されました。`, "EditorView");
      ZipExtractBase(
        newRootDir,
        filelist,
        index + 1,
        newZip,
        world,
        frqPromises
      );
    } else if (f.endsWith("character.txt") && characterUpdate) {
      Log.info(`${f}は設定項目から別途作成されます。`, "EditorView");
      Log.gtag("UpdateCharacterTxt");
      ZipExtractBase(
        newRootDir,
        filelist,
        index + 1,
        newZip,
        world,
        frqPromises
      );
    } else if (
      f.endsWith("character.yaml") &&
      (characterYamlUpdate ||
        (prefixMapsUpdate && Object.keys(prefixMaps).length >= 2))
    ) {
      Log.info(`${f}は設定項目から別途作成されます。`, "EditorView");
      Log.gtag("UpdateCharacterYaml");
      ZipExtractBase(
        newRootDir,
        filelist,
        index + 1,
        newZip,
        world,
        frqPromises
      );
    } else if (f.endsWith("readme.txt") && readmeUpdate) {
      Log.info(`${f}は設定項目から別途作成されます。`, "EditorView");
      Log.gtag("UpdateReadmeTxt");
      ZipExtractBase(
        newRootDir,
        filelist,
        index + 1,
        newZip,
        world,
        frqPromises
      );
    } else if (f.endsWith("prefix.map") && prefixMapsUpdate) {
      Log.info(`${f}は設定項目から別途作成されます。`, "EditorView");
      Log.gtag("UpdatePrefixMap");
      ZipExtractBase(
        newRootDir,
        filelist,
        index + 1,
        newZip,
        world,
        frqPromises
      );
    } else {
      const newFileName = GetNewFileName(rootDir, newRootDir, f);
      
      // .frqファイルで、FrqEditorで更新されたものがあればそれを使用
      if (f.endsWith(".frq")) {
        const wavFileName = f.replace(/_wav\.frq$/, ".wav");
        const updatedFrq = updatedFrqs.get(wavFileName);
        
        if (updatedFrq) {
          // 更新されたfrqを使用
          newZip.file(newFileName, updatedFrq.Output());
          Log.info(
            `${f}を更新されたデータから${newFileName}としてzipに格納しました。`,
            "EditorView"
          );
          ZipExtractBase(
            newRootDir,
            filelist,
            index + 1,
            newZip,
            world,
            frqPromises
          );
          return;
        }
      }
      
      props.zipFiles[f].async("arraybuffer").then((buf) => {
        if (f.endsWith(".wav")) {
          const wav = new Wave(buf);
          Log.info(`${f}をwavとして読み込みました。`, "EditorView");
          if (flags.wav.stereo) {
            wav.channels = 1;
            Log.info(`${f}をモノラルに変換しました。`, "EditorView");
          }
          if (flags.wav.sampleRate) {
            wav.sampleRate = 44100;
            Log.info(`${f}を44,100Hzに変換しました`, "EditorView");
          }
          if (flags.wav.depth) {
            wav.bitDepth = 16;
            Log.info(`${f}のbit深度を16bitに設定しました`, "EditorView");
          }
          if (flags.wav.dcoffset) {
            wav.RemoveDCOffset();
            Log.info(`${f}のDCoffsetを除去しました`, "EditorView");
          }
          const wavOutput = wav.Output();
          newZip.file(newFileName, wavOutput);
          Log.info(
            `${f}を${newFileName}としてzipに格納しました。`,
            "EditorView"
          );
          
          // frq処理: 優先順位は updatedFrqs > 元のzip > 新規生成
          const frqPath = f.replace(".wav", "_wav.frq");
          const newFrqPath = frqPath.replace(rootDir, newRootDir);
          // updatedFrqsのキーはフルパス（f）を使用
          const updatedFrq = updatedFrqs.get(f);
          
          if (updatedFrq) {
            // 1. updatedFrqsにあれば問答無用でzip
            newZip.file(newFrqPath, updatedFrq.Output());
            Log.info(
              `${frqPath}を更新されたデータから${newFrqPath}としてzipに格納しました。`,
              "EditorView"
            );
          } else if (frqPath in props.zipFiles) {
            // 2. 元のzipにfrqがあればそれをzip（既に別のブロックで処理されるのでスキップ）
            // この分岐は実際には到達しない（frqファイルは別途処理される）
          } else if (flags.frq.frq) {
            // 3. 生成設定が有効で、updatedFrqsにも元のzipにもない場合は生成
            Log.info(`${frqPath}が存在しないため生成します。`, "EditorView");
            Log.gtag("GenerateFrq");
            setFrqCount(prev => prev + 1);

            if (workerPool) {
              // WorkerPoolを使用した非同期FRQ生成（完了は待たない）
              const ndata = Float64Array.from(wav.LogicalNormalize(1));
              const request = {
                data: ndata,
                sample_rate: 44100,
                perSamples: 256,
              };

              const frqPromise = workerPool
                .runGenerateFrq(request, index)
                .then((frq) => {
                  if (frq) {
                    newZip.file(newFrqPath, frq.Output());
                    setGeneratedFrqCount(prev => prev + 1);
                    Log.info(`${frqPath}をzipに格納しました。`, "EditorView");
                  } else {
                    Log.warn(`${frqPath}の生成に失敗しました。`, "EditorView");
                  }
                })
                .catch((error) => {
                  Log.error(
                    `${frqPath}生成中にエラーが発生しました: ${error}`,
                    "EditorView"
                  );
                });

              frqPromises.push(frqPromise);
            } else {
              // Fallback: 従来の同期処理
              const ndata = Float64Array.from(wav.LogicalNormalize(1));
              const frq = GenerateFrq(world, ndata, 44100, 256);
              if (frq) {
                newZip.file(newFrqPath, frq.Output());
                setGeneratedFrqCount(prev => prev + 1);
                Log.info(`${frqPath}をzipに格納しました。`, "EditorView");
              }
            }
          }
        } else {
          newZip.file(newFileName, buf);
          Log.info(
            `${f}を${newFileName}としてzipに格納しました。`,
            "EditorView"
          );
        }
        ZipExtractBase(
          newRootDir,
          filelist,
          index + 1,
          newZip,
          world,
          frqPromises
        );
      });
    }
  };
  const ZipExtractMake = async (newRootDir: string, newZip: JSZip) => {
    // 出力エンコーディングを決定
    const encoding = flags.encoding.utf8 ? "utf-8" : "Windows-31j";
    // UTF-8エンコードが有効な場合は、エンコード変更のため強制的に再出力
    const forceUpdate = flags.encoding.utf8 === true;
    
    // oto.iniの文字コード変換（ExtractRootOtoより前に実行）
    const newZip8 = (otoUpdate || forceUpdate)
      ? await ExtractAllOtoIni(rootDir, newRootDir, otoEncodings, props.zipFiles, newZip, encoding)
      : newZip;
    const newZip7 = ExtractRootOto(newRootDir, newZip8, flags.oto.root);
    const newZip6 = ExtractCharacterTxt(
      newRootDir,
      characterUpdate || forceUpdate,
      character,
      newZip7,
      iconBuf,
      sampleBuf,
      characterTxtPath,
      props.zipFiles,
      encoding
    );
    const newZip5 = ExtractCharacterYaml(
      newRootDir,
      characterYamlUpdate,
      characterYaml,
      prefixMapsUpdate,
      prefixMaps,
      newZip6,
      portraitBuf,
      characterYamlPath,
      props.zipFiles
    );
    const newZip4 = ExtractReadme(newRootDir, readmeUpdate || forceUpdate, readme, newZip5, readmePath, encoding);
    const newZip3 = ExtractPrefixMap(
      newRootDir,
      prefixMapsUpdate || forceUpdate,
      prefixMaps,
      newZip4,
      prefixMapPath,
      encoding
    );
    const newZip2 = ExtractInstallTxt(installUpdate || forceUpdate, install, newZip3, encoding);
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
    // FRQカウンターをリセット
    setFrqCount(0);
    setGeneratedFrqCount(0);
    
    // 前回のzipUrlを解放
    if (zipUrl !== "") {
      URL.revokeObjectURL(zipUrl);
      setZipUrl("");
    }
    
    const newZip = new JSZip();
    const newRootDir =
      rootDir === ""
        ? props.zipFileName.replace(".zip", "")
        : rootDir.split("/").slice(-1)[0];
    const world = new World();
    await world.Initialize();
    
    // filelist を一度だけ作成して共有
    const filelist = Object.keys(props.zipFiles)
      .filter((f) => f.startsWith(rootDir))
      .sort();
    
    Log.info(`zipの生成。${rootDir}以下を${newRootDir}に配置`, "EditorView");
    Log.gtag("OutputZip",{characterName: character ? character.name : "unknown"});
    ZipExtractBase(newRootDir, filelist, 0, newZip, world);
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
                <CircularProgress />({outputIndex+generatedFrqCount}/
                {Object.keys(props.zipFiles).filter((f) =>
                  f.startsWith(rootDir)
                ).length + frqCount}
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
              <Tab
                label={t("editor.otoini.title")}
                style={{ textTransform: "none" }}
                value={6}
              />
              <Tab
                label={t("editor.frq_editor.title")}
                style={{ textTransform: "none" }}
                value={7}
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
                characterForceUpdate={characterForceUpdate}
                setCharacterTxtUpdate={setCharacterUpdate}
                setIconBuf={setIconBuf}
                setSampleBuf={setSampleBuf}
                characterTxtPath={characterTxtPath}
                setCharacterTxtPath={setCharacterTxtPath}
                characterTxtEncoding={characterTxtEncoding}
                setCharacterTxtEncoding={setCharacterTxtEncoding}
                onReload={async (path?: string, encoding?: string) => {
                  const actualPath = path || characterTxtPath;
                  const actualEncoding = encoding || characterTxtEncoding;
                  setCharacterTxtPath(actualPath);
                  setCharacterTxtEncoding(actualEncoding);
                  const gcr = await GetCharacterTxt(
                    rootDir,
                    props.zipFileName,
                    props.zipFiles,
                    actualEncoding,
                    actualPath
                  );
                  setCharacter(gcr.value);
                  setCharacterUpdate(gcr.update);
                  setCharacterForceUpdate(gcr.update);
                }}
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
                characterYamlPath={characterYamlPath}
                setCharacterYamlPath={setCharacterYamlPath}
                onReload={async (path: string) => {
                  Log.info(`character.yaml再読み込み: path=${path}`, "EditorView");
                  setCharacterYamlPath(path);
                  const maps = await GetPrefixMap(rootDir, props.zipFiles, prefixMapEncoding, prefixMapPath);
                  const gcyr = await GetCharacterYaml(rootDir, props.zipFiles, maps, path);
                  setCharacterYaml(gcyr.yaml);
                  setPrefixMaps(gcyr.maps);
                }}
              />
            </TabPanel>
            <TabPanel value={3} sx={{ p: 1 }}>
              <ReadMePanel
                readme={readme}
                setReadme={setReadme}
                update={readmeUpdate}
                setUpdate={setReadmeUpdate}
                readmeEncoding={readmeEncoding}
                setReadmeEncoding={setReadmeEncoding}
                readmePath={readmePath}
                setReadmePath={setReadmePath}
                files={files}
                onReload={async (path: string, encoding: string) => {
                  Log.info(`readme.txt再読み込み: path=${path}, encoding=${encoding}`, "EditorView");
                  const newReadme = await GetReadme(rootDir, props.zipFiles, encoding, path);
                  setReadme(newReadme);
                }}
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
                prefixMapEncoding={prefixMapEncoding}
                setPrefixMapEncoding={setPrefixMapEncoding}
                prefixMapPath={prefixMapPath}
                setPrefixMapPath={setPrefixMapPath}
                files={files}
                onReload={async (path: string, encoding: string) => {
                  Log.info(`prefix.map再読み込み: path=${path}, encoding=${encoding}`, "EditorView");
                  const newMaps = await GetPrefixMap(rootDir, props.zipFiles, encoding, path);
                  setPrefixMaps(newMaps);
                }}
              />
            </TabPanel>
            <TabPanel value={6} sx={{ p: 1 }}>
              <OtoIniPanel
                files={files}
                otoEncodings={otoEncodings}
                setOtoEncodings={setOtoEncodings}
                selectedOtoPath={selectedOtoPath}
                setSelectedOtoPath={setSelectedOtoPath}
                otoContent={otoContent}
                setOtoContent={setOtoContent}
                update={otoUpdate}
                setUpdate={setOtoUpdate}
                onReload={async (path: string, encoding: string) => {
                  Log.info(`oto.ini再読み込み: path=${path}, encoding=${encoding}`, "EditorView");
                  const otoText = await GetOtoIni(props.zipFiles, encoding, path);
                  setOtoContent(otoText);
                }}
              />
            </TabPanel>
            <TabPanel value={7} sx={{ p: 0 }}>
              {props.zipFiles && workerPool && rootDir && (
                <FrqListView
                  zipFiles={props.zipFiles}
                  rootDir={rootDir}
                  workerPool={workerPool}
                  mode={props.mode}
                  onFrqUpdate={(wavFileName: string, frq: Frq) => {
                    setUpdatedFrqs((prev) => {
                      const updated = new Map(prev);
                      updated.set(wavFileName, frq);
                      return updated;
                    });
                  }}
                />
              )}
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
  /**ワーカー数 */
  workersCount: number;
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
  encoding: EncodingFlags;
}

interface EncodingFlags {
  utf8?: boolean;
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
