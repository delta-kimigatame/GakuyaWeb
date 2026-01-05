import JSZip from "jszip";
import yaml from "js-yaml";
import * as iconv from "iconv-lite";
import { Log } from "../lib/Logging";
import { InstallTxt } from "../lib/InstallTxt";
import { PrefixMap } from "../lib/PrefixMap";
import { CharacterTxt } from "../lib/CharacterTxt";
import { FileReadAsync } from "./FileReadAsync";

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
 * @param selectedPath 選択されているprefix.mapのパス（参考情報、出力先は常にnewRootDir/prefix.map）
 * @returns 生成先のzip
 */
export const ExtractPrefixMap = (
  newRootDir: string,
  prefixMapsUpdate: boolean,
  prefixMaps: { string?: PrefixMap },
  newZip: JSZip,
  selectedPath?: string
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
 * @param selectedPath 選択されているreadme.txtのパス（参考情報、出力先は常にnewRootDir/readme.txt）
 * @returns 生成先のzip
 */
export const ExtractReadme = (
  newRootDir: string,
  readmeUpdate: boolean,
  readme: string,
  newZip: JSZip,
  selectedPath?: string
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
 * @param selectedPath 選択されているcharacter.yamlのパス（参考情報）
 * @param zipFiles 元のzipファイル（portraitコピー用）
 * @returns 生成先のzip
 */
export const ExtractCharacterYaml = (
  newRootDir: string,
  characterYamlUpdate: boolean,
  characterYaml: {} | null,
  prefixMapsUpdate: boolean,
  prefixMaps: { string?: PrefixMap },
  newZip: JSZip,
  portraitBuf: ArrayBuffer,
  selectedPath?: string,
  zipFiles?: { [key: string]: JSZip.JSZipObject }
): JSZip => {
  if (
    characterYamlUpdate ||
    (prefixMapsUpdate && Object.keys(prefixMaps).length >= 2)
  ) {
    const characterYaml_ = characterYaml === null ? {} : { ...characterYaml };
    
    // portraitの処理
    if (characterYaml_["portrait"] === "upload" && portraitBuf !== undefined) {
      // アップロードされた画像を使用
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
    } else if (
      characterYaml_["portrait"] &&
      characterYaml_["portrait"] !== "upload" &&
      selectedPath &&
      zipFiles
    ) {
      // 既存のportraitがある場合、パスを新しいrootDirからの相対パスに変換
      const selectedDir = selectedPath.substring(0, selectedPath.lastIndexOf("/"));
      const portraitRelativePath = characterYaml_["portrait"];
      
      // selectedDir相対のportraitの絶対パスを構築
      let portraitAbsolutePath: string;
      if (portraitRelativePath.startsWith("/") || portraitRelativePath.includes(":")) {
        // 絶対パスの場合はそのまま
        portraitAbsolutePath = portraitRelativePath;
      } else {
        // 相対パスの場合はselectedDirからの相対パス
        portraitAbsolutePath = selectedDir ? selectedDir + "/" + portraitRelativePath : portraitRelativePath;
      }
      
      // portraitの絶対パスからnewRootDirへの相対パスを計算
      if (Object.keys(zipFiles).includes(portraitAbsolutePath)) {
        // newRootDirからportraitへの相対パスを計算
        const newPortraitPath = GetRelativePath(newRootDir, portraitAbsolutePath);
        characterYaml_["portrait"] = newPortraitPath;
        Log.info(
          `portrait参照を${portraitRelativePath}から${newPortraitPath}に変更しました。`,
          "OutputZip"
        );
      } else {
        Log.warn(
          `portrait画像が見つかりません: ${portraitAbsolutePath}`,
          "OutputZip"
        );
      }
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
 * @param selectedPath 選択されているcharacter.txtのパス
 * @param zipFiles 元のzipファイル（icon/sample参照用）
 * @returns 生成先のzip
 */
export const ExtractCharacterTxt = (
  newRootDir: string,
  characterUpdate: boolean,
  character: CharacterTxt,
  newZip: JSZip,
  iconBuf: ArrayBuffer,
  sampleBuf: ArrayBuffer,
  selectedPath?: string,
  zipFiles?: { [key: string]: JSZip.JSZipObject }
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
    } else if (
      character.image &&
      character.image !== "upload" &&
      selectedPath &&
      zipFiles
    ) {
      // 既存のiconがある場合、パスを新しいrootDirからの相対パスに変換
      const selectedDir = selectedPath.substring(0, selectedPath.lastIndexOf("/"));
      const iconRelativePath = character.image;
      
      // selectedDir相対のiconの絶対パスを構築
      let iconAbsolutePath: string;
      if (iconRelativePath.startsWith("/") || iconRelativePath.includes(":")) {
        // 絶対パスの場合はそのまま
        iconAbsolutePath = iconRelativePath;
      } else {
        // 相対パスの場合はselectedDirからの相対パス
        iconAbsolutePath = selectedDir ? selectedDir + "/" + iconRelativePath : iconRelativePath;
      }
      
      // iconの絶対パスからnewRootDirへの相対パスを計算
      if (Object.keys(zipFiles).includes(iconAbsolutePath)) {
        const newIconPath = GetRelativePath(newRootDir, iconAbsolutePath);
        c.image = newIconPath;
        Log.info(
          `icon参照を${iconRelativePath}から${newIconPath}に変更しました。`,
          "OutputZip"
        );
      } else {
        Log.warn(
          `icon画像が見つかりません: ${iconAbsolutePath}`,
          "OutputZip"
        );
      }
    }
    if (character.sample === "upload") {
      const samplePath = GetAddFilePath(newRootDir, newZip, "sample", "wav");
      c.sample = samplePath;
      newZip.file(newRootDir + "/" + samplePath, sampleBuf);
      Log.info(
        `${newRootDir + "/" + samplePath}をzipに格納しました。`,
        "OutputZip"
      );
    } else if (
      character.sample &&
      character.sample !== "upload" &&
      selectedPath &&
      zipFiles
    ) {
      // 既存のsampleがある場合、パスを新しいrootDirからの相対パスに変換
      const selectedDir = selectedPath.substring(0, selectedPath.lastIndexOf("/"));
      const sampleRelativePath = character.sample;
      
      // selectedDir相対のsampleの絶対パスを構築
      let sampleAbsolutePath: string;
      if (sampleRelativePath.startsWith("/") || sampleRelativePath.includes(":")) {
        // 絶対パスの場合はそのまま
        sampleAbsolutePath = sampleRelativePath;
      } else {
        // 相対パスの場合はselectedDirからの相対パス
        sampleAbsolutePath = selectedDir ? selectedDir + "/" + sampleRelativePath : sampleRelativePath;
      }
      
      // sampleの絶対パスからnewRootDirへの相対パスを計算
      if (Object.keys(zipFiles).includes(sampleAbsolutePath)) {
        const newSamplePath = GetRelativePath(newRootDir, sampleAbsolutePath);
        c.sample = newSamplePath;
        Log.info(
          `sample参照を${sampleRelativePath}から${newSamplePath}に変更しました。`,
          "OutputZip"
        );
      } else {
        Log.warn(
          `sample音声が見つかりません: ${sampleAbsolutePath}`,
          "OutputZip"
        );
      }
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
  
  // rootDir以外のcharacter.txtを削除
  const rootCharacterTxtPath = newRootDir + "/character.txt";
  Object.keys(newZip.files).forEach((filePath) => {
    if (filePath.toLowerCase().endsWith("character.txt") && filePath !== rootCharacterTxtPath) {
      newZip.remove(filePath);
      Log.info(
        `rootDir以外のcharacter.txtを削除しました: ${filePath}`,
        "OutputZip"
      );
    }
  });
  
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
 * 複数のoto.iniをzip内に生成する処理（文字コード変換）
 * @param oldRootDir 元のzip内における音源ルートへの相対パス
 * @param newRootDir 新しいzip内における音源ルートへの相対パス
 * @param otoEncodings 各oto.iniのパスとエンコーディングのマップ
 * @param zipFiles 元のzipファイル
 * @param newZip 生成先のzip
 * @returns 生成先のzip
 */
export const ExtractAllOtoIni = async (
  oldRootDir: string,
  newRootDir: string,
  otoEncodings: Map<string, string>,
  zipFiles: { [key: string]: JSZip.JSZipObject },
  newZip: JSZip
): Promise<JSZip> => {
  for (const [oldPath, encoding] of otoEncodings.entries()) {
    if (Object.keys(zipFiles).includes(oldPath)) {
      // 元のパスから新しいパスを計算
      const newPath = oldPath.replace(oldRootDir, newRootDir);
      
      // oto.iniを指定エンコーディングで読み込み
      const buf = await zipFiles[oldPath].async("arraybuffer");
      const txt = await FileReadAsync(buf, encoding);
      
      // Shift-JIS（Windows-31j）で書き出し
      const encodingName = encoding === "SJIS" ? "Windows-31j" : encoding;
      const o_output = new File(
        [iconv.encode(txt.replace(/\n/g, "\r\n"), "Windows-31j")],
        "oto.ini",
        { type: "text/plane;charset=shift-jis" }
      );
      
      newZip.file(newPath, o_output);
      Log.info(
        `${newPath}をzipに格納しました（encoding: ${encoding} -> SJIS）`,
        "OutputZip"
      );
    }
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

/**
 * fromパスからtoパスへの相対パスを計算
 * @param from 基準パス（ディレクトリ）
 * @param to 対象パス（ファイル）
 * @returns fromからtoへの相対パス
 */
const GetRelativePath = (from: string, to: string): string => {
  const fromParts = from.split("/").filter(p => p);
  const toParts = to.split("/").filter(p => p);
  
  // 共通部分を見つける
  let commonLength = 0;
  while (
    commonLength < fromParts.length &&
    commonLength < toParts.length &&
    fromParts[commonLength] === toParts[commonLength]
  ) {
    commonLength++;
  }
  
  // fromから上に戻る回数
  const upCount = fromParts.length - commonLength;
  
  // 相対パスを構築
  const upPath = Array(upCount).fill("..").join("/");
  const downPath = toParts.slice(commonLength).join("/");
  
  if (upPath && downPath) {
    return upPath + "/" + downPath;
  } else if (upPath) {
    return upPath;
  } else {
    return downPath;
  }
};

export const GetNewFileName = (
  rootDir: string,
  newRootDir: string,
  f
): string => {
  const reg = new RegExp("^" + rootDir);
  return f.replace(reg, newRootDir + (rootDir === "" ? "/" : ""));
};
