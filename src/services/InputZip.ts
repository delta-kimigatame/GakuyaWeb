import JSZip from "jszip";
import yaml from "js-yaml";
import * as iconv from "iconv-lite";
import { Log } from "../lib/Logging";
import { InstallTxt } from "../lib/InstallTxt";
import { FileReadAsync } from "./FileReadAsync";
import { PrefixMap } from "../lib/PrefixMap";
import { CharacterTxt } from "../lib/CharacterTxt";

export const GetInstallTxtPath = (rootDir: string): string => {
  const split_root = rootDir.split("/");
  let installTextTemp = split_root.slice(0, -1).join("/") + "/install.txt";
  if (installTextTemp === "/install.txt") {
    installTextTemp = "install.txt";
  }
  return installTextTemp;
};

/**
 * install.txtがあれば読込、なければ初期化して返す
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFileName zipのファイル名
 * @param zipFiles zipデータ
 * @returns install.txtの値
 */
export const GetInstallTxt = async (
  rootDir: string,
  zipFileName: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  }
): Promise<InstallTxt> => {
  let installTextTemp = GetInstallTxtPath(rootDir);
  if (installTextTemp === "/install.txt") {
    installTextTemp = "install.txt";
  }
  return new Promise((resolve, reject) => {
    if (Object.keys(zipFiles).includes(installTextTemp)) {
      Log.info(`install.txtが見つかりました。${installTextTemp}`, "EditorView");
      zipFiles[installTextTemp].async("arraybuffer").then(async (buf) => {
        const txt = await FileReadAsync(buf);
        const value = new InstallTxt({ txt: txt });
        Log.info(`install.txtの読込完了 folder=${value.folder}`, "EditorView");
        resolve(value);
      });
    } else {
      Log.info(`rootDirの変更に伴うinstall.txtの変更。`, "EditorView");
      const install = new InstallTxt({
        folder: rootDir === "" ? zipFileName.replace(".zip", "") : rootDir,
        contentsDir: rootDir === "" ? zipFileName.replace(".zip", "") : rootDir,
        description: "",
      });
      resolve(install);
    }
  });
};

/**
 * rootDirにcharacter.txtがあれば読込、なければ初期化して返す
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFileName zipのファイル名
 * @param zipFiles zipデータ
 * @param encoding 文字コード（デフォルト: "SJIS"）
 * @param targetPath 読み込むcharacter.txtのパス（省略時はrootDir/character.txt）
 * @returns Character.txtの値と更新要否のタプル
 */
export const GetCharacterTxt = async (
  rootDir: string,
  zipFileName: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  },
  encoding: string = "SJIS",
  targetPath?: string
): Promise<{ value: CharacterTxt; update: boolean }> => {
  const characterTxtPath = targetPath
    ? targetPath
    : rootDir === ""
    ? "character.txt"
    : rootDir + "/character.txt";
  return new Promise((resolve, reject) => {
    if (Object.keys(zipFiles).includes(characterTxtPath)) {
      Log.info(`character.txtがみつかりました。${characterTxtPath}`, "EditorView");
      zipFiles[characterTxtPath]
        .async("arraybuffer")
        .then(async (buf) => {
          const txt = await FileReadAsync(buf, encoding);
          const value = new CharacterTxt({ txt: txt });
          Log.info(`character.txtの読込完了 name=${value.name}`, "EditorView");
          resolve({ value: value, update: false });
        })
        .catch((error) => {
          Log.warn(
            `character.txtが存在しますが、読み込みに失敗したため自動生成。name=${
              rootDir ? rootDir : zipFileName.slice(0, -4)
            }`,
            "EditorView"
          );
          resolve({
            value: new CharacterTxt({
              name: rootDir ? rootDir : zipFileName.slice(0, -4),
              image: "",
              sample: "",
              author: "",
              web: "",
              version: "",
            }),
            update: true,
          });
        });
    } else {
      Log.info(
        `character.txtが存在しないため自動生成。name=${
          rootDir ? rootDir : zipFileName.slice(0, -4)
        }`,
        "EditorView"
      );
      resolve({
        value: new CharacterTxt({
          name: rootDir ? rootDir : zipFileName.slice(0, -4),
          image: "",
          sample: "",
          author: "",
          web: "",
          version: "",
        }),
        update: true,
      });
    }
  });
};

/**
 * zipファイル内のcharacter.txtファイルのパスリストを取得
 * @param zipFiles zipデータ
 * @returns character.txtファイルのパスの配列
 */
export const GetCharacterTxtFilePaths = (
  zipFiles: { [key: string]: JSZip.JSZipObject }
): string[] => {
  return Object.keys(zipFiles).filter((f) =>
    f.toLowerCase().endsWith("character.txt")
  );
};

/**
 * rootDirにreadme.txtがあれば読込、なければ初期化して返す
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFiles zipデータ
 * @param encoding 文字コード（デフォルト: "SJIS"）
 * @param targetPath 読み込むreadme.txtのパス（省略時はrootDir配下のreadme.txt）
 * @returns readmeの値
 */
export const GetReadme = async (
  rootDir: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  },
  encoding: string = "SJIS",
  targetPath?: string
): Promise<string> => {
  const path = targetPath || (rootDir === "" ? "readme.txt" : rootDir + "/readme.txt");
  return new Promise((resolve, reject) => {
    if (Object.keys(zipFiles).includes(path)) {
      Log.info(`readme.txtがみつかりました。${path}`, "EditorView");
      zipFiles[path].async("arraybuffer").then(async (buf) => {
        const txt = await FileReadAsync(buf, encoding);
        Log.info(`readme.txtの読込完了 ${txt}`, "EditorView");
        resolve(txt);
      });
    } else {
      resolve("");
    }
  });
};

/**
 * zip内のすべてのreadme.txtファイルのパスを取得
 * @param zipFiles zipデータ
 * @returns readme.txtファイルのパス配列
 */
export const GetReadmeFilePaths = (
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  }
): string[] => {
  return Object.keys(zipFiles)
    .filter((path) => path.toLowerCase().endsWith("readme.txt"))
    .sort();
};

/**
 * rootDirにprefix.mapがあれば読込、なければ初期化して返す
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFiles zipデータ
 * @param encoding 文字コード（デフォルト: "SJIS"）
 * @param targetPath 読み込むprefix.mapのパス（省略時はrootDir配下のprefix.map）
 * @returns prefix.map
 */
export const GetPrefixMap = async (
  rootDir: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  },
  encoding: string = "SJIS",
  targetPath?: string
): Promise<{ string?: PrefixMap }> => {
  const path = targetPath || (rootDir === "" ? "prefix.map" : rootDir + "/prefix.map");
  return new Promise((resolve, reject) => {
    let maps = {};
    if (Object.keys(zipFiles).includes(path)) {
      Log.info(`prefix.mapがみつかりました。${path}`, "EditorView");
      zipFiles[path].async("arraybuffer").then(async (buf) => {
        const txt = await FileReadAsync(buf, encoding);
        const value = new PrefixMap(txt);
        Log.info(`prefix.mapの読込完了 ${txt}`, "EditorView");
        maps[""] = value;
        resolve(maps);
      });
    } else {
      resolve({});
    }
  });
};

/**
 * zip内のすべてのprefix.mapファイルのパスを取得
 * @param zipFiles zipデータ
 * @returns prefix.mapファイルのパス配列
 */
export const GetPrefixMapFilePaths = (
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  }
): string[] => {
  return Object.keys(zipFiles)
    .filter((path) => path.toLowerCase().endsWith("prefix.map"))
    .sort();
};

/**
 * rootDirにcharacter.yamlがあれば読込、なければnullを返す
 * なお、character.yamlのうち、subbanksについてはprefix.mapとして扱う
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFiles zipデータ
 * @param maps prefix.mapの値
 * @param targetPath 読み込むcharacter.yamlのパス（省略時はrootDir配下のcharacter.yaml）
 * @returns character.yamlとprefix.mapのtuple
 */
export const GetCharacterYaml = async (
  rootDir: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  },
  maps: { string?: PrefixMap },
  targetPath?: string
): Promise<{ yaml: {} | null; maps: { string?: PrefixMap } }> => {
  const path = targetPath || (rootDir === "" ? "character.yaml" : rootDir + "/character.yaml");
  return new Promise((resolve, reject) => {
    if (Object.keys(zipFiles).includes(path)) {
      Log.info(`character.yamlがみつかりました。${path}`, "EditorView");
      zipFiles[path].async("arraybuffer").then(async (buf) => {
        const txt = await FileReadAsync(buf, "UTF8");
        const value = yaml.load(txt);
        Log.info(`character.yamlの読込完了 name=${txt}`, "EditorView");
        if (value.subbanks) {
          Log.info(`character.yamlにsubbanksが見つかりました`, "EditorView");
          for (let i = 0; i < value.subbanks.length; i++) {
            if (
              value.subbanks[i].color === "" &&
              Object.keys(zipFiles).includes(rootDir + "/prefix.map")
            ) {
              Log.info(
                `subbanks.color=""はprefix.mapと競合するため無視されました`,
                "EditorView"
              );
            } else {
              for (let j = 0; j < value.subbanks[i].tone_ranges.length; j++) {
                if (Object.keys(maps).includes(value.subbanks[i].color)) {
                  maps[value.subbanks[i].color].SetRangeValues(
                    value.subbanks[i].tone_ranges[j],
                    value.subbanks[i].prefix,
                    value.subbanks[i].suffix
                  );
                  Log.info(
                    `subbanks.color=${value.subbanks[i].color}にprefix=${value.subbanks[i].prefix}、suffix=${value.subbanks[i].suffix}、range=${value.subbanks[i].tone_ranges[j]}を設定しました`,
                    "EditorView"
                  );
                } else {
                  maps[value.subbanks[i].color] = new PrefixMap();
                  Log.info(
                    `subbanks.color=${value.subbanks[i].color}を追加しました`,
                    "EditorView"
                  );
                  maps[value.subbanks[i].color].SetRangeValues(
                    value.subbanks[i].tone_ranges[j],
                    value.subbanks[i].prefix,
                    value.subbanks[i].suffix
                  );
                  Log.info(
                    `subbanks.color=${value.subbanks[i].color}にprefix=${value.subbanks[i].prefix}、suffix=${value.subbanks[i].suffix}、range=${value.subbanks[i].tone_ranges[j]}を設定しました`,
                    "EditorView"
                  );
                }
              }
            }
          }
        }
        resolve({ yaml: value, maps: maps });
      });
    } else {
      resolve({ yaml: null, maps: maps });
    }
  });
};

/**
 * zip内のすべてのcharacter.yamlファイルのパスを取得
 * @param zipFiles zipデータ
 * @returns character.yamlファイルのパス配列
 */
export const GetCharacterYamlFilePaths = (
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  }
): string[] => {
  return Object.keys(zipFiles)
    .filter((path) => path.toLowerCase().endsWith("character.yaml"))
    .sort();
};
