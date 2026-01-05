import JSZip from "jszip";
import * as iconv from "iconv-lite";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import { InstallTxt, InstallTxtValue } from "../../src/lib/InstallTxt";
import { PrefixMap } from "../../src/lib/PrefixMap";
import { FileReadAsync } from "../../src/services/FileReadAsync";
import { CharacterTxt } from "../../src/lib/CharacterTxt";

import {
  ExtractInstallTxt,
  ExtractPrefixMap,
  ExtractReadme,
  GetSubbanks,
  ExtractCharacterYaml,
  GetAddFilePath,
  ExtractCharacterTxt,
  ExtractRootOto,
  GetNewFileName,
} from "../../src/services/OutputZip";
import {
  GetInstallTxtPath,
  GetInstallTxt,
  GetCharacterTxt,
  GetReadme,
  GetPrefixMap,
  GetCharacterYaml,
  GetOtoIni,
  GetOtoIniFilePaths,
  GetCharacterYamlFilePaths,
  GetReadmeFilePaths,
  GetPrefixMapFilePaths,
  GetCharacterTxtFilePaths,
} from "../../src/services/InputZip";

describe("InputZip", () => {
  it("GetInstallTxtPath", () => {
    expect(GetInstallTxtPath("")).toBe("install.txt");
    expect(GetInstallTxtPath("root")).toBe("install.txt");
    expect(GetInstallTxtPath("root/hoge")).toBe("root/install.txt");
  });
  it("GetInstallTxt_found", async () => {
    const i = new InstallTxt({ folder: "hoge" });
    const z = new JSZip();
    const newZip = ExtractInstallTxt(true, i, z);
    const geti = await GetInstallTxt("root", "test.zip", newZip.files);
    expect(geti.folder).toBe("hoge");
  });
  it("GetInstallTxt_not_found", async () => {
    const i = new InstallTxt({ folder: "hoge" });
    const z = new JSZip();
    const geti = await GetInstallTxt("root", "test.zip", z.files);
    expect(geti.folder).toBe("root");
  });
  it("GetInstallTxt_not_found_root_empty", async () => {
    const i = new InstallTxt({ folder: "hoge" });
    const z = new JSZip();
    const geti = await GetInstallTxt("", "test.zip", z.files);
    expect(geti.folder).toBe("test");
  });
  it("GetCharacterTxt_found", async () => {
    const c = new CharacterTxt({ name: "hoge" });
    const z = new JSZip();
    const newZip = ExtractCharacterTxt(
      "root",
      true,
      c,
      z,
      new ArrayBuffer(0),
      new ArrayBuffer(0)
    );
    const getc = await GetCharacterTxt("root", "test.zip", newZip.files);
    expect(getc.value.name).toBe("hoge");
    expect(getc.update).toBeFalsy();
  });
  it("GetCharacterTxt_not_found", async () => {
    const z = new JSZip();
    const getc = await GetCharacterTxt("root", "test.zip", z.files);
    expect(getc.value.name).toBe("root");
    expect(getc.update).toBeTruthy();
  });
  it("GetCharacterTxt_not_found_and_root_empty", async () => {
    const z = new JSZip();
    const getc = await GetCharacterTxt("", "test.zip", z.files);
    expect(getc.value.name).toBe("test");
    expect(getc.update).toBeTruthy();
  });
  it("GetReadmeTxt_found", async () => {
    const z = new JSZip();
    const newZip = ExtractReadme("root", true, "test", z);
    const getr = await GetReadme("root", newZip.files);
    expect(getr).toBe("test");
  });
  it("GetReadmeTxt_not_found", async () => {
    const z = new JSZip();
    const getr = await GetReadme("root", z.files);
    expect(getr).toBe("");
  });
  it("GetPrefixMap_found", async () => {
    const p = new PrefixMap();
    p.SetValue({ tone: "B7", prefix: "", suffix: "B4" });
    const ps = {};
    ps[""] = p;
    const z = new JSZip();
    const newZip = ExtractPrefixMap("root", true, ps, z);
    const getp = await GetPrefixMap("root", newZip.files);
    expect(getp[""].GetValue("B7").tone).toBe("B7");
    expect(getp[""].GetValue("B7").suffix).toBe("B4");
  });
  it("GetPrefixMap_not_found", async () => {
    const z = new JSZip();
    const getp = await GetPrefixMap("root", z.files);
    expect(Object.keys(getp).length).toBe(0);
  });
  it("GetCharacterYaml_not_found", async () => {
    const z = new JSZip();
    const ps = {};
    const getcy = await GetCharacterYaml("root", z.files, ps);
    expect(getcy.yaml).toBeNull();
    expect(Object.keys(getcy.maps).length).toBe(0);
  });
  it("GetCharacterYaml_found", async () => {
    const z = new JSZip();
    const p = new PrefixMap();
    p.SetValue({ tone: "B7", prefix: "", suffix: "B4" });
    const ps = {};
    const newZip = ExtractCharacterYaml(
      "root",
      true,
      {
        voice: "hoge",
        subbanks: [
          { color: "a", prefix: "", suffix: "_A", tone_ranges: ["C1-B4","C6-B7"] },
          { color: "b", prefix: "", suffix: "_B", tone_ranges: ["C1-B7"] },
        ],
      },
      false,
      ps,
      z,
      new ArrayBuffer(0)
    );
    ps[""] = p;
    const getcy = await GetCharacterYaml("root", newZip.files, ps);
    expect(getcy.yaml).toBeTruthy();
    if (getcy.yaml !== null) {
      expect(getcy.yaml["voice"]).toBe("hoge");
      expect(getcy.maps[""].GetValue("B7").suffix).toBe("B4");
      expect(getcy.maps["a"].GetValue("B7").suffix).toBe("_A");
      expect(getcy.maps["a"].GetValue("B4").suffix).toBe("_A");
      expect(getcy.maps["a"].GetValue("C5").suffix).toBe("");
      expect(getcy.maps["b"].GetValue("C5").suffix).toBe("_B");
    }
  });

  // 新規追加された関数のテスト
  describe("GetOtoIniFilePaths", () => {
    it("zip内のoto.iniファイルを全て取得", () => {
      const z = new JSZip();
      z.file("root/oto.ini", "dummy");
      z.file("root/subdir/oto.ini", "dummy");
      z.file("root/readme.txt", "dummy");

      const paths = GetOtoIniFilePaths(z.files);

      expect(paths).toHaveLength(2);
      expect(paths).toContain("root/oto.ini");
      expect(paths).toContain("root/subdir/oto.ini");
    });

    it("大文字小文字を区別しない", () => {
      const z = new JSZip();
      z.file("root/OTO.INI", "dummy");
      z.file("root/Oto.Ini", "dummy");

      const paths = GetOtoIniFilePaths(z.files);

      expect(paths).toHaveLength(2);
      expect(paths).toContain("root/OTO.INI");
      expect(paths).toContain("root/Oto.Ini");
    });

    it("ソートされた結果を返す", () => {
      const z = new JSZip();
      z.file("c/oto.ini", "dummy");
      z.file("a/oto.ini", "dummy");
      z.file("b/oto.ini", "dummy");

      const paths = GetOtoIniFilePaths(z.files);

      expect(paths).toEqual(["a/oto.ini", "b/oto.ini", "c/oto.ini"]);
    });

    it("oto.iniが存在しない場合は空配列", () => {
      const z = new JSZip();
      z.file("root/readme.txt", "dummy");

      const paths = GetOtoIniFilePaths(z.files);

      expect(paths).toHaveLength(0);
    });
  });

  describe("GetOtoIni", () => {
    it("指定パスのoto.iniを読み込む_SJIS", async () => {
      const z = new JSZip();
      const content = "a.wav=a,0,100,50,0,0";
      z.file("root/oto.ini", iconv.encode(content, "Windows-31j"));

      const result = await GetOtoIni(z.files, "SJIS", "root/oto.ini");

      expect(result).toBe(content);
    });

    it("UTF-8エンコーディングで読み込む", async () => {
      const z = new JSZip();
      const content = "あ.wav=あ,0,100,50,0,0";
      z.file("root/oto.ini", iconv.encode(content, "utf-8"));

      const result = await GetOtoIni(z.files, "utf-8", "root/oto.ini");

      expect(result).toBe(content);
    });

    it("存在しないパスの場合は空文字列を返す", async () => {
      const z = new JSZip();

      const result = await GetOtoIni(z.files, "SJIS", "notfound/oto.ini");

      expect(result).toBe("");
    });

    it("GB18030エンコーディングで読み込む", async () => {
      const z = new JSZip();
      const content = "测试.wav=测试,0,100,50,0,0";
      z.file("root/oto.ini", iconv.encode(content, "gb18030"));

      const result = await GetOtoIni(z.files, "gb18030", "root/oto.ini");

      expect(result).toBe(content);
    });
  });

  describe("GetCharacterYamlFilePaths", () => {
    it("zip内のcharacter.yamlファイルを全て取得", () => {
      const z = new JSZip();
      z.file("root/character.yaml", "dummy");
      z.file("root/subdir/character.yaml", "dummy");
      z.file("root/readme.txt", "dummy");

      const paths = GetCharacterYamlFilePaths(z.files);

      expect(paths).toHaveLength(2);
      expect(paths).toContain("root/character.yaml");
      expect(paths).toContain("root/subdir/character.yaml");
    });

    it("大文字小文字を区別しない", () => {
      const z = new JSZip();
      z.file("root/CHARACTER.YAML", "dummy");
      z.file("root/Character.Yaml", "dummy");

      const paths = GetCharacterYamlFilePaths(z.files);

      expect(paths).toHaveLength(2);
    });

    it("ソートされた結果を返す", () => {
      const z = new JSZip();
      z.file("c/character.yaml", "dummy");
      z.file("a/character.yaml", "dummy");
      z.file("b/character.yaml", "dummy");

      const paths = GetCharacterYamlFilePaths(z.files);

      expect(paths).toEqual([
        "a/character.yaml",
        "b/character.yaml",
        "c/character.yaml",
      ]);
    });
  });

  describe("GetReadmeFilePaths", () => {
    it("zip内のreadmeファイルを全て取得", () => {
      const z = new JSZip();
      z.file("root/readme.txt", "dummy");
      z.file("root/README.txt", "dummy");
      z.file("root/character.txt", "dummy");

      const paths = GetReadmeFilePaths(z.files);

      expect(paths).toHaveLength(2);
      expect(paths).toContain("root/readme.txt");
      expect(paths).toContain("root/README.txt");
    });

    it("ソートされた結果を返す", () => {
      const z = new JSZip();
      z.file("c/readme.txt", "dummy");
      z.file("a/readme.txt", "dummy");
      z.file("b/readme.txt", "dummy");

      const paths = GetReadmeFilePaths(z.files);

      expect(paths).toEqual(["a/readme.txt", "b/readme.txt", "c/readme.txt"]);
    });
  });

  describe("GetPrefixMapFilePaths", () => {
    it("zip内のprefix.mapファイルを全て取得", () => {
      const z = new JSZip();
      z.file("root/prefix.map", "dummy");
      z.file("root/subdir/prefix.map", "dummy");
      z.file("root/character.txt", "dummy");

      const paths = GetPrefixMapFilePaths(z.files);

      expect(paths).toHaveLength(2);
      expect(paths).toContain("root/prefix.map");
      expect(paths).toContain("root/subdir/prefix.map");
    });

    it("大文字小文字を区別しない", () => {
      const z = new JSZip();
      z.file("root/PREFIX.MAP", "dummy");
      z.file("root/Prefix.Map", "dummy");

      const paths = GetPrefixMapFilePaths(z.files);

      expect(paths).toHaveLength(2);
    });

    it("ソートされた結果を返す", () => {
      const z = new JSZip();
      z.file("c/prefix.map", "dummy");
      z.file("a/prefix.map", "dummy");
      z.file("b/prefix.map", "dummy");

      const paths = GetPrefixMapFilePaths(z.files);

      expect(paths).toEqual(["a/prefix.map", "b/prefix.map", "c/prefix.map"]);
    });
  });

  describe("GetCharacterTxtFilePaths", () => {
    it("zip内のcharacter.txtファイルを全て取得", () => {
      const z = new JSZip();
      z.file("root/character.txt", "dummy");
      z.file("root/subdir/character.txt", "dummy");
      z.file("root/readme.txt", "dummy");

      const paths = GetCharacterTxtFilePaths(z.files);

      expect(paths).toHaveLength(2);
      expect(paths).toContain("root/character.txt");
      expect(paths).toContain("root/subdir/character.txt");
    });

    it("大文字小文字を区別しない", () => {
      const z = new JSZip();
      z.file("root/CHARACTER.TXT", "dummy");
      z.file("root/Character.Txt", "dummy");

      const paths = GetCharacterTxtFilePaths(z.files);

      expect(paths).toHaveLength(2);
    });

    it("ソートされた結果を返す", () => {
      const z = new JSZip();
      z.file("c/character.txt", "dummy");
      z.file("a/character.txt", "dummy");
      z.file("b/character.txt", "dummy");

      const paths = GetCharacterTxtFilePaths(z.files);

      expect(paths).toEqual([
        "a/character.txt",
        "b/character.txt",
        "c/character.txt",
      ]);
    });
  });

  // targetPathパラメータ対応のテスト
  describe("GetCharacterTxt with targetPath", () => {
    it("targetPathパラメータで指定したcharacter.txtを読み込む", async () => {
      const c1 = new CharacterTxt({ name: "root_character" });
      const c2 = new CharacterTxt({ name: "sub_character" });
      const z = new JSZip();
      
      // rootとsubdirに別々のcharacter.txtを配置
      z.file("root/character.txt", iconv.encode("name=root_character", "Windows-31j"));
      z.file("root/subdir/character.txt", iconv.encode("name=sub_character", "Windows-31j"));

      // subdirのcharacter.txtを明示的に指定
      const getc = await GetCharacterTxt("root", "test.zip", z.files, undefined, "root/subdir/character.txt");
      
      expect(getc.value.name).toBe("sub_character");
    });

    it("targetPathが省略された場合はrootDir配下のcharacter.txtを読み込む", async () => {
      const c = new CharacterTxt({ name: "default_character" });
      const z = new JSZip();
      
      z.file("root/character.txt", iconv.encode("name=default_character", "Windows-31j"));
      z.file("root/subdir/character.txt", iconv.encode("name=sub_character", "Windows-31j"));

      const getc = await GetCharacterTxt("root", "test.zip", z.files);
      
      expect(getc.value.name).toBe("default_character");
    });

    it("エンコーディングとtargetPathを両方指定", async () => {
      const z = new JSZip();
      
      z.file("root/character.txt", iconv.encode("name=テスト", "utf-8"));

      const getc = await GetCharacterTxt("root", "test.zip", z.files, "utf-8", "root/character.txt");
      
      expect(getc.value.name).toBe("テスト");
    });
  });

  describe("GetReadme with targetPath", () => {
    it("targetPathパラメータで指定したreadme.txtを読み込む", async () => {
      const z = new JSZip();
      
      z.file("root/readme.txt", iconv.encode("root readme", "Windows-31j"));
      z.file("root/subdir/readme.txt", iconv.encode("sub readme", "Windows-31j"));

      const readme = await GetReadme("root", z.files, "SJIS", "root/subdir/readme.txt");
      
      expect(readme).toBe("sub readme");
    });

    it("targetPathが省略された場合はrootDir配下のreadme.txtを読み込む", async () => {
      const z = new JSZip();
      
      z.file("root/readme.txt", iconv.encode("default readme", "Windows-31j"));
      z.file("root/subdir/readme.txt", iconv.encode("sub readme", "Windows-31j"));

      const readme = await GetReadme("root", z.files);
      
      expect(readme).toBe("default readme");
    });

    it("エンコーディングとtargetPathを両方指定", async () => {
      const z = new JSZip();
      
      z.file("root/readme.txt", iconv.encode("テストreadme", "utf-8"));

      const readme = await GetReadme("root", z.files, "utf-8", "root/readme.txt");
      
      expect(readme).toBe("テストreadme");
    });
  });

  describe("GetPrefixMap with targetPath", () => {
    it("targetPathパラメータで指定したprefix.mapを読み込む", async () => {
      const p1 = new PrefixMap();
      p1.SetValue({ tone: "B7", prefix: "", suffix: "B4" });
      const p2 = new PrefixMap();
      p2.SetValue({ tone: "B7", prefix: "", suffix: "B5" });
      
      const z = new JSZip();
      const newZip1 = ExtractPrefixMap("root", true, { "": p1 }, z);
      newZip1.file("root/subdir/prefix.map", iconv.encode("B7\t\tB5", "Windows-31j"));

      const getp = await GetPrefixMap("root", newZip1.files, "SJIS", "root/subdir/prefix.map");
      
      expect(getp[""].GetValue("B7").suffix).toBe("B5");
    });

    it("targetPathが省略された場合はrootDir配下のprefix.mapを読み込む", async () => {
      const p = new PrefixMap();
      p.SetValue({ tone: "B7", prefix: "", suffix: "B4" });
      
      const z = new JSZip();
      const newZip = ExtractPrefixMap("root", true, { "": p }, z);

      const getp = await GetPrefixMap("root", newZip.files);
      
      expect(getp[""].GetValue("B7").suffix).toBe("B4");
    });

    it("エンコーディングとtargetPathを両方指定", async () => {
      const z = new JSZip();
      
      z.file("root/prefix.map", iconv.encode("B7\t\tB4", "utf-8"));

      const getp = await GetPrefixMap("root", z.files, "utf-8", "root/prefix.map");
      
      expect(getp[""].GetValue("B7").suffix).toBe("B4");
    });
  });

  describe("GetCharacterYaml with targetPath", () => {
    it("targetPathパラメータで指定したcharacter.yamlを読み込む", async () => {
      const z = new JSZip();
      const p = new PrefixMap();
      const ps = { "": p };
      
      const yaml1 = { voice: "root_voice" };
      const yaml2 = { voice: "sub_voice" };
      
      z.file("root/character.yaml", iconv.encode("voice: root_voice", "utf-8"));
      z.file("root/subdir/character.yaml", iconv.encode("voice: sub_voice", "utf-8"));

      const getcy = await GetCharacterYaml("root", z.files, ps, "root/subdir/character.yaml");
      
      expect(getcy.yaml).toBeTruthy();
      if (getcy.yaml !== null) {
        expect(getcy.yaml["voice"]).toBe("sub_voice");
      }
    });

    it("targetPathが省略された場合はrootDir配下のcharacter.yamlを読み込む", async () => {
      const z = new JSZip();
      const p = new PrefixMap();
      p.SetValue({ tone: "B7", prefix: "", suffix: "B4" });
      const ps = { "": p };
      
      const newZip = ExtractCharacterYaml(
        "root",
        true,
        { voice: "default_voice" },
        false,
        ps,
        z,
        new ArrayBuffer(0)
      );

      const getcy = await GetCharacterYaml("root", newZip.files, ps);
      
      expect(getcy.yaml).toBeTruthy();
      if (getcy.yaml !== null) {
        expect(getcy.yaml["voice"]).toBe("default_voice");
      }
    });

    it("targetPathで空文字を指定した場合はデフォルトパスが使われる", async () => {
      const z = new JSZip();
      const p = new PrefixMap();
      const ps = { "": p };
      
      z.file("root/character.yaml", iconv.encode("voice: test", "utf-8"));

      const getcy = await GetCharacterYaml("root", z.files, ps, "");
      
      expect(getcy.yaml).toBeTruthy();
      if (getcy.yaml !== null) {
        expect(getcy.yaml["voice"]).toBe("test");
      }
    });
  });
});
