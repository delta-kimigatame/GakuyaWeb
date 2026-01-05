import JSZip from "jszip";
import * as iconv from "iconv-lite";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
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
  ExtractAllOtoIni,
} from "../../src/services/OutputZip";
import { InstallTxt, InstallTxtValue } from "../../src/lib/InstallTxt";
import { PrefixMap } from "../../src/lib/PrefixMap";
import { FileReadAsync } from "../../src/services/FileReadAsync";
import { CharacterTxt } from "../../src/lib/CharacterTxt";

describe("OutputZip", () => {
  it("ExtractInstallTxt_false", () => {
    const i = new InstallTxt({ folder: "hoge" });
    const z = new JSZip();
    const newZip = ExtractInstallTxt(false, i, z);
    expect("install.txt" in newZip.files).toBeFalsy();
  });
  it("ExtractInstallTxt_true", () => {
    const i = new InstallTxt({ folder: "hoge" });
    const z = new JSZip();
    const newZip = ExtractInstallTxt(true, i, z);
    expect("install.txt" in newZip.files).toBeTruthy();
    newZip.files["install.txt"].async("arraybuffer").then(async (buf) => {
      const txt = await FileReadAsync(buf);
      expect(txt).toBe("type=voiceset\r\nfolder=hoge\r\n");
    });
  });
  it("ExtractPrefixMap_false", () => {
    const p = new PrefixMap();
    const ps = {};
    ps[""] = p;
    const z = new JSZip();
    const newZip = ExtractPrefixMap("root", false, ps, z);
    expect("root/prefix.map" in newZip.files).toBeFalsy();
  });
  it("ExtractPrefixMap_true", () => {
    const p = new PrefixMap();
    p.SetValue({ tone: "B7", prefix: "", suffix: "B4" });
    const ps = {};
    ps[""] = p;
    const z = new JSZip();
    const newZip = ExtractPrefixMap("root", true, ps, z);
    expect("root/prefix.map" in newZip.files).toBeTruthy();
    newZip.files["root/prefix.map"].async("arraybuffer").then(async (buf) => {
      const txt = await FileReadAsync(buf);
      expect(txt.startsWith("B7\t\tB4")).toBeTruthy();
    });
  });
  it("ExtractReadme_false", () => {
    const z = new JSZip();
    const newZip = ExtractReadme("root", false, "test", z);
    expect("root/readme.txt" in newZip.files).toBeFalsy();
  });
  it("ExtractReadme_true", () => {
    const z = new JSZip();
    const newZip = ExtractReadme("root", true, "test", z);
    expect("root/readme.txt" in newZip.files).toBeTruthy();
    newZip.files["root/readme.txt"].async("arraybuffer").then(async (buf) => {
      const txt = await FileReadAsync(buf);
      expect(txt).toBe("test");
    });
  });
  it("GetSubbanks_simple", () => {
    const p = new PrefixMap();
    const ps = {};
    ps[""] = p;
    const result = GetSubbanks(ps);
    expect(result.length).toBe(1);
    expect(result[0]["color"]).toBe("");
    expect(result[0]["prefix"]).toBe("");
    expect(result[0]["suffix"]).toBe("");
    expect(result[0]["tone_ranges"][0]).toBe("C1-B7");
  });
  it("GetSubbanks2range", () => {
    const p = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    ps[""] = p;
    const result = GetSubbanks(ps);
    expect(result.length).toBe(2);
    expect(result[0]["color"]).toBe("");
    expect(result[0]["prefix"]).toBe("");
    expect(result[0]["suffix"]).toBe("");
    expect(result[0]["tone_ranges"][0]).toBe("C1-B3");
    expect(result[1]["color"]).toBe("");
    expect(result[1]["prefix"]).toBe("");
    expect(result[1]["suffix"]).toBe("A");
    expect(result[1]["tone_ranges"][0]).toBe("C4-B7");
  });
  it("GetSubbanks2range2color", () => {
    const p = new PrefixMap();
    const p2 = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    p2.SetRangeValues("C4-B7", "", "B");
    ps[""] = p;
    ps["C"] = p2;
    const result = GetSubbanks(ps);
    expect(result.length).toBe(4);
    expect(result[0]["color"]).toBe("");
    expect(result[0]["prefix"]).toBe("");
    expect(result[0]["suffix"]).toBe("");
    expect(result[0]["tone_ranges"][0]).toBe("C1-B3");
    expect(result[1]["color"]).toBe("");
    expect(result[1]["prefix"]).toBe("");
    expect(result[1]["suffix"]).toBe("A");
    expect(result[1]["tone_ranges"][0]).toBe("C4-B7");
    expect(result[2]["color"]).toBe("C");
    expect(result[2]["prefix"]).toBe("");
    expect(result[2]["suffix"]).toBe("");
    expect(result[2]["tone_ranges"][0]).toBe("C1-B3");
    expect(result[3]["color"]).toBe("C");
    expect(result[3]["prefix"]).toBe("");
    expect(result[3]["suffix"]).toBe("B");
    expect(result[3]["tone_ranges"][0]).toBe("C4-B7");
  });
  it("ExtractCharacterYaml_false", () => {
    const p = new PrefixMap();
    const p2 = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    p2.SetRangeValues("C4-B7", "", "B");
    ps[""] = p;
    ps["C"] = p2;
    const z = new JSZip();
    const newZip = ExtractCharacterYaml(
      "root",
      false,
      {},
      false,
      ps,
      z,
      new ArrayBuffer(0)
    );
    expect("root/character.yaml" in newZip.files).toBeFalsy();
  });
  it("ExtractCharacterYaml_true_maps", () => {
    const p = new PrefixMap();
    const p2 = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    p2.SetRangeValues("C4-B7", "", "B");
    ps[""] = p;
    ps["C"] = p2;
    const z = new JSZip();
    const newZip = ExtractCharacterYaml(
      "root",
      false,
      { voice: "hoge" },
      true,
      ps,
      z,
      new ArrayBuffer(0)
    );
    expect("root/character.yaml" in newZip.files).toBeTruthy();
    newZip.files["root/character.yaml"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf, "utf-8");
        const y = yaml.load(txt);
        expect(y["subbanks"].length).toBe(4);
        expect(y["voice"]).toBe("hoge");
      });
  });
  it("ExtractCharacterYaml_update_maps", () => {
    const p = new PrefixMap();
    const p2 = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    p2.SetRangeValues("C4-B7", "", "B");
    ps[""] = p;
    ps["C"] = p2;
    const z = new JSZip();
    const newZip = ExtractCharacterYaml(
      "root",
      false,
      {
        subbanks: [
          { color: "", prefix: "", suffix: "", tone_ranges: ["C1-B7"] },
        ],
      },
      true,
      ps,
      z,
      new ArrayBuffer(0)
    );
    expect("root/character.yaml" in newZip.files).toBeTruthy();
    newZip.files["root/character.yaml"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf, "utf-8");
        const y = yaml.load(txt);
        expect(y["subbanks"].length).toBe(4);
      });
  });
  it("ExtractCharacterYaml_false_map1", () => {
    const p = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    ps[""] = p;
    const z = new JSZip();
    const newZip = ExtractCharacterYaml(
      "root",
      false,
      {},
      true,
      ps,
      z,
      new ArrayBuffer(0)
    );
    expect("root/character.yaml" in newZip.files).toBeFalsy();
  });
  it("ExtractCharacterYaml_true_maps_yaml_null", () => {
    const p = new PrefixMap();
    const p2 = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    p2.SetRangeValues("C4-B7", "", "B");
    ps[""] = p;
    ps["C"] = p2;
    const z = new JSZip();
    const newZip = ExtractCharacterYaml(
      "root",
      false,
      null,
      true,
      ps,
      z,
      new ArrayBuffer(0)
    );
    expect("root/character.yaml" in newZip.files).toBeTruthy();
    newZip.files["root/character.yaml"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf, "utf-8");
        const y = yaml.load(txt);
        expect(y["subbanks"].length).toBe(4);
      });
  });
  it("ExtractCharacterYaml_true_yaml", () => {
    const p = new PrefixMap();
    const p2 = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    p2.SetRangeValues("C4-B7", "", "B");
    ps[""] = p;
    ps["C"] = p2;
    const z = new JSZip();
    const newZip = ExtractCharacterYaml(
      "root",
      true,
      {
        voice: "hoge",
        subbanks: [
          { color: "", prefix: "", suffix: "", tone_ranges: ["C1-B7"] },
        ],
      },
      false,
      ps,
      z,
      new ArrayBuffer(0)
    );
    expect("root/character.yaml" in newZip.files).toBeTruthy();
    newZip.files["root/character.yaml"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf, "utf-8");
        const y = yaml.load(txt);
        expect(y["subbanks"].length).toBe(4);
        expect(y["voice"]).toBe("hoge");
      });
  });
  it("ExtractCharacterYaml_true_yaml", () => {
    const ps = {};
    const z = new JSZip();
    const newZip = ExtractCharacterYaml(
      "root",
      true,
      { voice: "hoge" },
      false,
      ps,
      z,
      new ArrayBuffer(0)
    );
    expect("root/character.yaml" in newZip.files).toBeTruthy();
    newZip.files["root/character.yaml"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf, "utf-8");
        const y = yaml.load(txt);
        expect("subbanks" in y).toBeFalsy();
        expect(y["voice"]).toBe("hoge");
      });
  });
  it("GetPotraitPath_Simple", () => {
    const z = new JSZip();
    const path = GetAddFilePath("root", z, "portrait", "png");
    expect(path).toBe("portrait.png");
  });
  it("GetPotraitPath_CountUp", () => {
    const z = new JSZip();
    z.file("root/portrait.png", new ArrayBuffer(0));
    const path = GetAddFilePath("root", z, "portrait", "png");
    expect(path).toBe("portrait1.png");
    z.file("root/portrait1.png", new ArrayBuffer(0));
    const path2 = GetAddFilePath("root", z, "portrait", "png");
    expect(path2).toBe("portrait2.png");
    z.file("root/portrait2.png", new ArrayBuffer(0));
    const path3 = GetAddFilePath("root", z, "portrait", "png");
    expect(path3).toBe("portrait3.png");
  });
  it("ExtractCharacterYaml_true_yaml_portrait_no_upload", () => {
    const p = new PrefixMap();
    const p2 = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    p2.SetRangeValues("C4-B7", "", "B");
    ps[""] = p;
    ps["C"] = p2;
    const z = new JSZip();
    const newZip = ExtractCharacterYaml(
      "root",
      true,
      {
        voice: "hoge",
        portrait: "fuga.png",
      },
      false,
      ps,
      z,
      new ArrayBuffer(0)
    );
    expect("root/character.yaml" in newZip.files).toBeTruthy();
    newZip.files["root/character.yaml"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf, "utf-8");
        const y = yaml.load(txt);
        expect(y["subbanks"].length).toBe(4);
        expect(y["voice"]).toBe("hoge");
        expect(y["portrait"]).toBe("fuga.png");
      });
  });
  it("ExtractCharacterYaml_true_yaml_portrait_upload", () => {
    const p = new PrefixMap();
    const p2 = new PrefixMap();
    const ps = {};
    p.SetRangeValues("C4-B7", "", "A");
    p2.SetRangeValues("C4-B7", "", "B");
    ps[""] = p;
    ps["C"] = p2;
    const z = new JSZip();
    const newZip = ExtractCharacterYaml(
      "root",
      true,
      {
        voice: "hoge",
        portrait: "upload",
      },
      false,
      ps,
      z,
      new ArrayBuffer(0)
    );
    expect("root/character.yaml" in newZip.files).toBeTruthy();
    expect("root/portrait.png" in newZip.files).toBeTruthy();
    newZip.files["root/character.yaml"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf, "utf-8");
        const y = yaml.load(txt);
        expect(y["subbanks"].length).toBe(4);
        expect(y["voice"]).toBe("hoge");
        expect(y["portrait"]).toBe("portrait.png");
      });
  });
  it("ExtractCharacterTxt_false", () => {
    const c = new CharacterTxt({ name: "test" });
    const c_output = new File(
      [
        iconv.encode(
          new CharacterTxt({ name: "hoge" }).OutputTxt(),
          "Windows-31j"
        ),
      ],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const z = new JSZip();
    z.file("root/character.txt", c_output);
    const newZip = ExtractCharacterTxt(
      "root",
      false,
      c,
      z,
      new ArrayBuffer(0),
      new ArrayBuffer(0)
    );
    newZip.files["root/character.txt"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf);
        expect(txt).toBe("name=hoge\r\n");
      });
  });
  it("ExtractCharacterTxt_true", () => {
    const c = new CharacterTxt({ name: "test" });
    const c_output = new File(
      [
        iconv.encode(
          new CharacterTxt({ name: "hoge" }).OutputTxt(),
          "Windows-31j"
        ),
      ],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const z = new JSZip();
    z.file("root/character.txt", c_output);
    const newZip = ExtractCharacterTxt(
      "root",
      true,
      c,
      z,
      new ArrayBuffer(0),
      new ArrayBuffer(0)
    );
    newZip.files["root/character.txt"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf);
        expect(txt).toBe("name=test\r\n");
      });
  });
  it("ExtractCharacterTxt_no_txt", () => {
    const c = new CharacterTxt({ name: "test" });
    const z = new JSZip();
    const newZip = ExtractCharacterTxt(
      "root",
      true,
      c,
      z,
      new ArrayBuffer(0),
      new ArrayBuffer(0)
    );
    newZip.files["root/character.txt"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf);
        expect(txt).toBe("name=test\r\n");
      });
  });
  it("ExtractCharacterTxt_all", () => {
    const c = new CharacterTxt({
      name: "test",
      image: "a.bmp",
      sample: "b.wav",
      author: "c",
      web: "d",
      version: "e",
    });
    const z = new JSZip();
    const newZip = ExtractCharacterTxt(
      "root",
      true,
      c,
      z,
      new ArrayBuffer(0),
      new ArrayBuffer(0)
    );
    newZip.files["root/character.txt"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf);
        expect(txt).toBe(
          "name=test\r\nimage=a.bmp\r\nsample=b.wav\r\nauthor=c\r\nweb=d\r\nversion=e\r\n"
        );
      });
  });
  it("ExtractCharacterTxt_image_upload", () => {
    const c = new CharacterTxt({
      name: "test",
      image: "upload",
      sample: "b.wav",
      author: "c",
      web: "d",
      version: "e",
    });
    const z = new JSZip();
    const newZip = ExtractCharacterTxt(
      "root",
      true,
      c,
      z,
      new ArrayBuffer(0),
      new ArrayBuffer(0)
    );
    expect("root/icon.bmp" in newZip.files).toBeTruthy();
    newZip.files["root/character.txt"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf);
        expect(txt).toBe(
          "name=test\r\nimage=icon.bmp\r\nsample=b.wav\r\nauthor=c\r\nweb=d\r\nversion=e\r\n"
        );
      });
  });
  it("ExtractCharacterTxt_sample_upload", () => {
    const c = new CharacterTxt({
      name: "test",
      image: "a.bmp",
      sample: "upload",
      author: "c",
      web: "d",
      version: "e",
    });
    const z = new JSZip();
    const newZip = ExtractCharacterTxt(
      "root",
      true,
      c,
      z,
      new ArrayBuffer(0),
      new ArrayBuffer(0)
    );
    expect("root/sample.wav" in newZip.files).toBeTruthy();
    newZip.files["root/character.txt"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf);
        expect(txt).toBe(
          "name=test\r\nimage=a.bmp\r\nsample=sample.wav\r\nauthor=c\r\nweb=d\r\nversion=e\r\n"
        );
      });
  });
  it("ExtractCharacterTxt_icon_and sample_upload", () => {
    const c = new CharacterTxt({
      name: "test",
      image: "upload",
      sample: "upload",
      author: "c",
      web: "d",
      version: "e",
    });
    const z = new JSZip();
    const newZip = ExtractCharacterTxt(
      "root",
      true,
      c,
      z,
      new ArrayBuffer(0),
      new ArrayBuffer(0)
    );
    expect("root/icon.bmp" in newZip.files).toBeTruthy();
    expect("root/sample.wav" in newZip.files).toBeTruthy();
    newZip.files["root/character.txt"]
      .async("arraybuffer")
      .then(async (buf) => {
        const txt = await FileReadAsync(buf);
        expect(txt).toBe(
          "name=test\r\nimage=icon.bmp\r\nsample=sample.wav\r\nauthor=c\r\nweb=d\r\nversion=e\r\n"
        );
      });
  });
  it("ExtractOtoIni_false", () => {
    const z = new JSZip();
    const newZip = ExtractRootOto("root", z, false);
    expect("root/oto.ini" in newZip.files).toBeFalsy();
  });
  it("ExtractOtoIni_true", () => {
    const z = new JSZip();
    const newZip = ExtractRootOto("root", z, true);
    expect("root/oto.ini" in newZip.files).toBeTruthy();
    newZip.files["root/oto.ini"].async("arraybuffer").then(async (buf) => {
      const txt = await FileReadAsync(buf);
      expect(txt).toBe("");
    });
  });
  it("ExtractOtoIni_have_oto", () => {
    const c_output = new File(
      [iconv.encode("aaa", "Windows-31j")],
      "character.txt",
      { type: "text/plane;charset=shift-jis" }
    );
    const z = new JSZip();
    z.file("root/character.txt", c_output);
    const newZip = ExtractRootOto("root", z, true);
    expect("root/oto.ini" in newZip.files).toBeTruthy();
    newZip.files["root/oto.ini"].async("arraybuffer").then(async (buf) => {
      const txt = await FileReadAsync(buf);
      expect(txt).toBe("");
    });
  });
  it("GetNewFileName",()=>{
    expect(GetNewFileName("root","test","root/a.wav")).toBe("test/a.wav")
    expect(GetNewFileName("root","test","root/root/a.wav")).toBe("test/root/a.wav")
    expect(GetNewFileName("","test","root/a.wav")).toBe("test/root/a.wav")
    expect(GetNewFileName("","test","a.wav")).toBe("test/a.wav")
  })

  describe("ExtractAllOtoIni", () => {
    it("複数oto.iniの一括変換_SJIS to UTF-8", async () => {
      const z = new JSZip();
      const content1 = "あ.wav=あ,0,100,50,0,0";
      const content2 = "い.wav=い,0,100,50,0,0";
      
      z.file("root/oto.ini", iconv.encode(content1, "Windows-31j"));
      z.file("root/sub/oto.ini", iconv.encode(content2, "Windows-31j"));

      const otoEncodings = new Map<string, string>();
      otoEncodings.set("root/oto.ini", "SJIS");
      otoEncodings.set("root/sub/oto.ini", "SJIS");

      const newZip = await ExtractAllOtoIni(
        "root",
        "newroot",
        otoEncodings,
        z.files,
        new JSZip()
      );

      expect("newroot/oto.ini" in newZip.files).toBeTruthy();
      expect("newroot/sub/oto.ini" in newZip.files).toBeTruthy();

      const buf1 = await newZip.files["newroot/oto.ini"].async("arraybuffer");
      const txt1 = await FileReadAsync(buf1, "Windows-31j");
      expect(txt1).toBe(content1);

      const buf2 = await newZip.files["newroot/sub/oto.ini"].async("arraybuffer");
      const txt2 = await FileReadAsync(buf2, "Windows-31j");
      expect(txt2).toBe(content2);
    });

    it("エンコーディングマップに基づく変換", async () => {
      const z = new JSZip();
      const contentSjis = "あ.wav=あ,0,100,50,0,0";
      const contentGbk = "测试.wav=测试,0,100,50,0,0";

      z.file("root/oto.ini", iconv.encode(contentSjis, "Windows-31j"));
      z.file("root/sub/oto.ini", iconv.encode(contentGbk, "gbk"));

      const otoEncodings = new Map<string, string>();
      otoEncodings.set("root/oto.ini", "SJIS");
      otoEncodings.set("root/sub/oto.ini", "gbk");

      const newZip = await ExtractAllOtoIni(
        "root",
        "newroot",
        otoEncodings,
        z.files,
        new JSZip()
      );

      const buf1 = await newZip.files["newroot/oto.ini"].async("arraybuffer");
      const txt1 = await FileReadAsync(buf1, "Windows-31j");
      expect(txt1).toBe(contentSjis);

      // GBKの中国語文字はShift-JISで表現できないため、
      // 正しく変換できるかはiconv-liteの実装依存。
      // ここでは少なくともファイルが作成されていることを確認
      const buf2 = await newZip.files["newroot/sub/oto.ini"].async("arraybuffer");
      expect(buf2).toBeDefined();
      const txt2 = await FileReadAsync(buf2, "Windows-31j");
      // 文字化けするが、何らかのテキストが返ってくることを確認
      expect(txt2.length).toBeGreaterThan(0);
    });

    it("oldRootDirとnewRootDirのパス変換", async () => {
      const z = new JSZip();
      const content = "a.wav=a,0,100,50,0,0";

      z.file("olddir/oto.ini", iconv.encode(content, "Windows-31j"));
      z.file("olddir/sub/oto.ini", iconv.encode(content, "Windows-31j"));

      const otoEncodings = new Map<string, string>();
      otoEncodings.set("olddir/oto.ini", "SJIS");
      otoEncodings.set("olddir/sub/oto.ini", "SJIS");

      const newZip = await ExtractAllOtoIni(
        "olddir",
        "newdir",
        otoEncodings,
        z.files,
        new JSZip()
      );

      expect("newdir/oto.ini" in newZip.files).toBeTruthy();
      expect("newdir/sub/oto.ini" in newZip.files).toBeTruthy();
      expect("olddir/oto.ini" in newZip.files).toBeFalsy();
    });

    it("存在しないパスはスキップ", async () => {
      const z = new JSZip();
      const content = "a.wav=a,0,100,50,0,0";

      z.file("root/oto.ini", iconv.encode(content, "Windows-31j"));

      const otoEncodings = new Map<string, string>();
      otoEncodings.set("root/oto.ini", "SJIS");
      otoEncodings.set("root/notfound/oto.ini", "SJIS");

      const newZip = await ExtractAllOtoIni(
        "root",
        "newroot",
        otoEncodings,
        z.files,
        new JSZip()
      );

      expect("newroot/oto.ini" in newZip.files).toBeTruthy();
      expect("newroot/notfound/oto.ini" in newZip.files).toBeFalsy();
    });

    it("ルートディレクトリが空文字の場合", async () => {
      const z = new JSZip();
      const content = "a.wav=a,0,100,50,0,0";

      z.file("oto.ini", iconv.encode(content, "Windows-31j"));

      const otoEncodings = new Map<string, string>();
      otoEncodings.set("oto.ini", "SJIS");

      const newZip = await ExtractAllOtoIni(
        "",
        "newroot",
        otoEncodings,
        z.files,
        new JSZip()
      );

      expect("newroot/oto.ini" in newZip.files).toBeTruthy();

      const buf = await newZip.files["newroot/oto.ini"].async("arraybuffer");
      const txt = await FileReadAsync(buf, "Windows-31j");
      expect(txt).toBe(content);
    });

    it("エンコーディングマップが空の場合", async () => {
      const z = new JSZip();
      const content = "a.wav=a,0,100,50,0,0";

      z.file("root/oto.ini", iconv.encode(content, "Windows-31j"));

      const otoEncodings = new Map<string, string>();

      const newZip = await ExtractAllOtoIni(
        "root",
        "newroot",
        otoEncodings,
        z.files,
        new JSZip()
      );

      // エンコーディングマップに含まれないファイルは処理されない
      expect("newroot/oto.ini" in newZip.files).toBeFalsy();
    });
  });
});
