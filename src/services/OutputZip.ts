import JSZip from "jszip";
import yaml from "js-yaml";
import * as iconv from "iconv-lite";
import { Log } from "../lib/Logging";
import { InstallTxt } from "../lib/InstallTxt";
import { PrefixMap } from "../lib/PrefixMap";
import { CharacterTxt } from "../lib/CharacterTxt";

/**
 * Install.txtをzip内に生成する処理
 * @param installUpdate 生成の要否
 * @param install 値
 * @param newZip 生成先のzip
 * @returns 生成先のzip
 */
export const ExtractInstallTxt = (
  installUpdate: boolean,
  install: InstallTxt,
  newZip: JSZip
): JSZip => {
  if (installUpdate) {
    const i_output = new File(
      [iconv.encode(install.OutputTxt(), "Windows-31j")],
      "install.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    newZip.file("install.txt", i_output);
    Log.info(`${"install.txt"}をzipに格納しました。`, "OutputZip");
  }
  return newZip;
};

/**
 * prefix.mapをzip内に生成する処理
 * @param newRootDir zip内における音源ルートへの相対パス
 * @param prefixMapsUpdate 生成の要否
 * @param prefixMaps 値
 * @param newZip 生成先のzip
 * @returns 生成先のzip
 */
export const ExtractPrefixMap = (
  newRootDir: string,
  prefixMapsUpdate: boolean,
  prefixMaps: { string?: PrefixMap },
  newZip: JSZip
): JSZip => {
  if (prefixMapsUpdate) {
    const p_output = new File(
      [iconv.encode(prefixMaps[""].OutputMap(), "Windows-31j")],
      "prefix.map",
      { type: "text/plane;charset=shift-jis" }
    );
    newZip.file(newRootDir + "/prefix.map", p_output);
    Log.info(`${newRootDir + "/prefix.map"}をzipに格納しました。`, "OutputZip");
  }
  return newZip;
};

/**
 * readmeをzip内に生成する処理
 * @param newRootDir zip内における音源ルートへの相対パス
 * @param readmeUpdate 生成の要否
 * @param readme 値
 * @param newZip 生成先のzip
 * @returns 生成先のzip
 */
export const ExtractReadme = (
  newRootDir: string,
  readmeUpdate: boolean,
  readme: string,
  newZip: JSZip
): JSZip => {
  if (readmeUpdate) {
    const r_output = new File(
      [iconv.encode(readme.replace(/\n/g,"\r\n"), "Windows-31j")],
      "readme.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    newZip.file(newRootDir + "/readme.txt", r_output);
    Log.info(`${newRootDir + "/readme.txt"}をzipに格納しました。`, "OutputZip");
  }
  return newZip;
};

/**
 * prefix.mapsをcharacter.yamlのsubbanks形式に変換する
 * @param prefixMaps prefix.map
 * @returns character.yamlにおけるsubbanks
 */
export const GetSubbanks = (prefixMaps: {
  string?: PrefixMap;
}): Array<string> => {
  const subbanks = [];
  Object.keys(prefixMaps).forEach((color) => {
    const temp_subbanks = prefixMaps[color].OutputSubbanks();
    temp_subbanks.forEach((t) => {
      t.color = color;
      subbanks.push(t);
    });
  });
  return subbanks;
};

/**
 * character.yamlをzip内に生成する処理
 * @param newRootDir zip内における音源ルートへの相対パス
 * @param characterYamlUpdate 生成の要否
 * @param characterYaml 値
 * @param prefixMapsUpdate prefix.map生成の要否
 * @param prefixMaps prefix.mapの値
 * @param newZip 生成先のzip
 * @param portraitBuf 立ち絵をアップロードした際のデータ
 * @returns 生成先のzip
 */
export const ExtractCharacterYaml = (
  newRootDir: string,
  characterYamlUpdate: boolean,
  characterYaml: {} | null,
  prefixMapsUpdate: boolean,
  prefixMaps: { string?: PrefixMap },
  newZip: JSZip,
  portraitBuf: ArrayBuffer
): JSZip => {
  if (
    characterYamlUpdate ||
    (prefixMapsUpdate && Object.keys(prefixMaps).length >= 2)
  ) {
    const characterYaml_ = characterYaml === null ? {} : characterYaml;
    if (characterYaml_["portrait"] === "upload" && portraitBuf!==undefined) {
      const portraitPath = GetAddFilePath(
        newRootDir,
        newZip,
        "portrait",
        "png"
      );
      characterYaml_["portrait"] = portraitPath;
      newZip.file(newRootDir + "/" + portraitPath, portraitBuf);
      Log.info(
        `${newRootDir + "/" + portraitPath}をzipに格納しました。`,
        "OutputZip"
      );
    }
    const subbanks = GetSubbanks(prefixMaps);
    if (subbanks.length !== 0) {
      characterYaml_["subbanks"] = subbanks;
    }
    characterYaml_["singer_type"]="utau"
    const c = yaml.dump(characterYaml_);
    const c_output = new File([iconv.encode(c, "utf-8")], "character.yaml", {
      type: "text/plane;charset=utf-8",
    });
    newZip.file(newRootDir + "/character.yaml", c_output);
    Log.info(
      `${newRootDir + "/character.yaml"}をzipに格納しました。`,
      "OutputZip"
    );
  }
  return newZip;
};

/**
 * character.txtをzip内に生成する処理
 * @param newRootDir zip内における音源ルートへの相対パス
 * @param characterUpdate 生成要否。音源ルートパスにcharacter.txtが存在しない場合無視して生成される。
 * @param character 値
 * @param newZip 生成先のzip
 * @param iconBuf アイコンをアップロードした際のデータ
 * @param sampleBuf サンプル音声をアップロードした際のデータ
 * @returns 生成先のzip
 */
export const ExtractCharacterTxt = (
  newRootDir: string,
  characterUpdate: boolean,
  character: CharacterTxt,
  newZip: JSZip,
  iconBuf: ArrayBuffer,
  sampleBuf: ArrayBuffer
): JSZip => {
  if (characterUpdate || !(newRootDir + "/character.txt" in newZip.files)) {
    const c = {
      name: character.name,
      image: character.image,
      sample: character.sample,
      author: character.author,
      web: character.web,
      version: character.version,
    };
    if (character.image === "upload") {
      const iconPath = GetAddFilePath(newRootDir, newZip, "icon", "bmp");
      c.image = iconPath;
      newZip.file(newRootDir + "/" + iconPath, iconBuf);
      Log.info(
        `${newRootDir + "/" + iconPath}をzipに格納しました。`,
        "OutputZip"
      );
    }
    if (character.sample === "upload") {
      const samplePath = GetAddFilePath(newRootDir, newZip, "sample", "wav");
      c.sample = samplePath;
      newZip.file(newRootDir + "/" + samplePath, sampleBuf);
      Log.info(
        `${newRootDir + "/" + samplePath}をzipに格納しました。`,
        "OutputZip"
      );
    }
    const c_output = new File(
      [iconv.encode(new CharacterTxt(c).OutputTxt(), "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    newZip.file(newRootDir + "/character.txt", c_output);
    Log.info(
      `${newRootDir + "/character.txt"}をzipに格納しました。`,
      "OutputZip"
    );
  }
  return newZip;
};

/**
 * 設定に基づき、音源ルートに空のzipを作成する
 * @param newRootDir zip内における音源ルートへの相対パス
 * @param newZip 生成先のzip
 * @param flag oto.ini生成要否
 * @returns 生成先のzip
 */
export const ExtractRootOto = (
  newRootDir: string,
  newZip: JSZip,
  flag: boolean
): JSZip => {
  if (flag && !(newRootDir + "/oto.ini" in newZip.files)) {
    const o_output = new File([""], "character.txt", {
      type: "text/plane;charset=shift-jis",
    });
    newZip.file(newRootDir + "/oto.ini", o_output);
    Log.info(
      `空のoto.iniを作成し、${newRootDir + "/oto.ini"}に格納しました。`,
      "OutputZip"
    );
  }
  return newZip;
};

/**
 * zip内に立ち絵画像を追加する際のパスを求める
 * @param newRootDir zip内における音源ルートへの相対パス
 * @param newZip 生成先のzip
 * @param filename 出力するファイル名
 * @param extension 出力するファイル拡張子
 * @returns 音源ルートから立ち絵までの相対パス
 */
export const GetAddFilePath = (
  newRootDir: string,
  newZip: JSZip,
  filename: string,
  extension: string
): string => {
  let i = 0;
  while (
    newRootDir +
      "/" +
      filename +
      (i === 0 ? "" : i.toString()) +
      "." +
      extension in
    newZip.files
  ) {
    i++;
  }
  return filename + (i === 0 ? "" : i.toString()) + "." + extension;
};

export const GetNewFileName = (
  rootDir: string,
  newRootDir: string,
  f
): string => {
  const reg = new RegExp("^" + rootDir);
  return f.replace(reg, newRootDir + (rootDir === "" ? "/" : ""));
};
