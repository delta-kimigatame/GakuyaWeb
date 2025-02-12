import JSZip from "jszip";
import yaml from "js-yaml";
import * as iconv from "iconv-lite";
import { Log } from "./Logging";
import { InstallTxt } from "./InstallTxt";
import { FileReadAsync } from "./FileReadAsync";
import { PrefixMap } from "./PrefixMap";
import { CharacterTxt } from "./CharacterTxt";

/**
 * install.txtがあれば読込、なければ初期化して返す
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFileName zipのファイル名
 * @param zipFiles zipデータ
 * @returns install.txtの値
 */
export const GetInstallTxt = (
  rootDir: string,
  zipFileName: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  }
): InstallTxt => {
  let installTextTemp =
    rootDir.split("/").slice(0, -1).join("/") + "/install.txt";
  if (installTextTemp === "/install.txt") {
    installTextTemp = "install.txt";
  }
  if (Object.keys(zipFiles).includes(installTextTemp)) {
    Log.log(`install.txtが見つかりました。${installTextTemp}`, "EditorView");
    zipFiles[installTextTemp].async("arraybuffer").then(async (buf) => {
      const txt = await FileReadAsync(buf);
      const value = new InstallTxt({ txt: txt });
      Log.log(`install.txtの読込完了 folder=${value.folder}`, "EditorView");
      return value;
    });
  } else {
    Log.log(`rootDirの変更に伴うinstall.txtの変更。`, "EditorView");
    const install = new InstallTxt({
      folder: rootDir === "" ? zipFileName.replace(".zip", "") : rootDir,
      contentsDir: rootDir === "" ? zipFileName.replace(".zip", "") : rootDir,
      description: "",
    });
    return install;
  }
};

/**
 * rootDirにcharacter.txtがあれば読込、なければ初期化して返す
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFileName zipのファイル名
 * @param zipFiles zipデータ
 * @returns Character.txtの値と更新要否のタプル
 */
export const GetCharacterTxt = (
  rootDir: string,
  zipFileName: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  }
): {value:CharacterTxt, update:boolean} => {
  if (Object.keys(zipFiles).includes(rootDir + "/character.txt")) {
    Log.log(
      `character.txtがみつかりました。${rootDir + "/character.txt"}`,
      "EditorView"
    );
    zipFiles[rootDir + "/character.txt"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf);
        const value = new CharacterTxt({ txt: txt });
        Log.log(`character.txtの読込完了 name=${value.name}`, "EditorView");
        return {value:value, update:false};
      });
  } else {
    Log.log(
      `character.txtが存在しないため自動生成。name=${
        rootDir ? rootDir : zipFileName.slice(0, -4)
      }`,
      "EditorView"
    );
    return {value:
      new CharacterTxt({
        name: rootDir ? rootDir : zipFileName.slice(0, -4),
        image: "",
        sample: "",
        author: "",
        web: "",
        version: "",
      }),
      update:true,
    };
  }
};

/**
 * rootDirにreadme.txtがあれば読込、なければ初期化して返す
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFiles zipデータ
 * @returns readmeの値
 */
export const GetReadme = (
  rootDir: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  }
): string => {
  if (Object.keys(zipFiles).includes(rootDir + "/readme.txt")) {
    Log.log(
      `readme.txtがみつかりました。${rootDir + "/readme.txt"}`,
      "EditorView"
    );
    zipFiles[rootDir + "/readme.txt"].async("arraybuffer").then(async (buf) => {
      const txt = await FileReadAsync(buf);
      Log.log(`readme.txtの読込完了 ${txt}`, "EditorView");
      return txt;
    });
  } else {
    return "";
  }
};

/**
 * rootDirにprefix.mapがあれば読込、なければ初期化して返す
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFiles zipデータ
 * @returns prefix.map
 */
export const GetPrefixMap = (
  rootDir: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  }
): { string?: PrefixMap } => {
  let maps = {};
  if (Object.keys(zipFiles).includes(rootDir + "/prefix.map")) {
    Log.log(
      `prefix.mapがみつかりました。${rootDir + "/prefix.map"}`,
      "EditorView"
    );
    zipFiles[rootDir + "/prefix.map"].async("arraybuffer").then(async (buf) => {
      const txt = await FileReadAsync(buf);
      const value = new PrefixMap(txt);
      Log.log(`prefix.mapの読込完了 ${txt}`, "EditorView");
      maps[""] = value;
      return maps;
    });
  } else {
    return {};
  }
};

/**
 * rootDirにcharacter.yamlがあれば読込、なければnullを返す
 * なお、character.yamlのうち、subbanksについてはprefix.mapとして扱う
 * @param rootDir zip内における音源ルートへの相対パス
 * @param zipFiles zipデータ
 * @param maps prefix.mapの値
 * @returns character.yamlとprefix.mapのtuple
 */
export const GetCharacterYaml = (
  rootDir: string,
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  },
  maps: { string?: PrefixMap }
): {yaml:{} | null, maps:{ string?: PrefixMap }} => {
  if (Object.keys(zipFiles).includes(rootDir + "/character.yaml")) {
    Log.log(
      `character.yamlがみつかりました。${rootDir + "/character.yaml"}`,
      "EditorView"
    );
    zipFiles[rootDir + "/character.yaml"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf, "UTF8");
        const value = yaml.load(txt);
        Log.log(`character.yamlの読込完了 name=${txt}`, "EditorView");
        if (value.subbanks) {
          Log.log(`character.yamlにsubbanksが見つかりました`, "EditorView");
          for (let i = 0; i < value.subbanks.length; i++) {
            if (
              value.subbanks[i].color === "" &&
              Object.keys(zipFiles).includes(rootDir + "/prefix.map")
            ) {
              Log.log(
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
        return {yaml:value, maps:maps};
      });
  } else {
    return {yaml:null, maps:maps};
  }
};
