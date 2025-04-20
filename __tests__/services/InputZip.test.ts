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
});
