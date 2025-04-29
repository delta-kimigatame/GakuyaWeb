import "@testing-library/jest-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import fs from "fs";

import { LoadZipButtonArea } from "../../../src/features/LoadZipDialog/LoadZipButtonArea";
import { LoadZipCore } from "../../../src/features/LoadZipDialog/LoadZipDialog";
import { Log } from "../../../src/lib/Logging";

describe("LoadZipButtonArea", () => {
  const loadZipSpy = vi.fn();
  const setDialogOpenSpy = vi.fn();
  const setProcessingSpy = vi.fn();
  const setEncodingSpy = vi.fn();
  const setZipFilesSpy = vi.fn();
  const buffer = fs.readFileSync("./__tests__/__fixtures__/minimumTestVB.zip");
  let inputFile: File;
  let zipFiles;
  beforeAll(async () => {
    inputFile = new File([buffer], "dummy.zip");
    zipFiles = await LoadZipCore(
      inputFile,
      "Shift-Jis",
      () => {},
      () => {}
    );
  });
  beforeEach(async () => {
    Log.datas = [];
    vi.restoreAllMocks();
  });
  it("文字コードを変更した際の動作_utf-8", async () => {
    render(
      <LoadZipButtonArea
        file={inputFile}
        encoding="Shift-Jis"
        zipFiles={zipFiles}
        LoadZip={loadZipSpy}
        setDialogOpen={setDialogOpenSpy}
        setProcessing={setProcessingSpy}
        setEncoding={setEncodingSpy}
        setZipFiles={setZipFilesSpy}
      />
    );
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    const optionUTF8 = await screen.findByRole("option", { name: "UTF-8" });
    await user.click(optionUTF8);
    expect(setEncodingSpy).toHaveBeenCalledWith("utf-8");
    expect(setProcessingSpy).toHaveBeenCalledWith(true);
    expect(setZipFilesSpy).toHaveBeenCalledWith(null);
    expect(loadZipSpy).toHaveBeenCalledWith(inputFile, "utf-8");
  });
  it("文字コードを変更した際の動作_shift-jis", async () => {
    render(
      <LoadZipButtonArea
        file={inputFile}
        encoding="utf-8"
        zipFiles={zipFiles}
        LoadZip={loadZipSpy}
        setDialogOpen={setDialogOpenSpy}
        setProcessing={setProcessingSpy}
        setEncoding={setEncodingSpy}
        setZipFiles={setZipFilesSpy}
      />
    );
    const user = userEvent.setup();

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    const optionUTF8 = await screen.findByRole("option", { name: "Shift-JIS" });
    await user.click(optionUTF8);
    expect(setEncodingSpy).toHaveBeenCalledWith("Shift-Jis");
    expect(setProcessingSpy).toHaveBeenCalledWith(true);
    expect(setZipFilesSpy).toHaveBeenCalledWith(null);
    expect(loadZipSpy).toHaveBeenCalledWith(inputFile, "Shift-Jis");
  });
  it("submitをクリック:zipFilesがnullの場合何もしない", async () => {
    render(
      <LoadZipButtonArea
        file={inputFile}
        encoding="Shift-Jis"
        zipFiles={null}
        LoadZip={loadZipSpy}
        setDialogOpen={setDialogOpenSpy}
        setProcessing={setProcessingSpy}
        setEncoding={setEncodingSpy}
        setZipFiles={setZipFilesSpy}
      />
    );
    Log.datas = [];
    const button = await screen.findByTestId("loadZipSubbmitButton");
    fireEvent.click(button);
    // 何もしない=ログに何もないはず
    expect(Log.datas.length).toBe(0);
  });
  it("submitをクリック:ファイル名が更新される", async () => {
    render(
      <LoadZipButtonArea
        file={inputFile}
        encoding="Shift-Jis"
        zipFiles={zipFiles}
        LoadZip={loadZipSpy}
        setDialogOpen={setDialogOpenSpy}
        setProcessing={setProcessingSpy}
        setEncoding={setEncodingSpy}
        setZipFiles={setZipFilesSpy}
      />
    );
    Log.datas = [];
    const button = await screen.findByTestId("loadZipSubbmitButton");
    fireEvent.click(button);
    await waitFor(()=>{
      expect(setZipFilesSpy).toHaveBeenCalled()
    })
    expect(setDialogOpenSpy).toHaveBeenCalledWith(false)
  });
});
