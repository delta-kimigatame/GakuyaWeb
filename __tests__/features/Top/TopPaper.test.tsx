import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Log } from "../../../src/lib/Logging";
import fs from "fs";

import { TopPaper } from "../../../src/features/Top/TopPaper";

describe("TopPaper", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Log.datas = [];
  });

  it("ButtonをクリックするとsetReadZipがnullになる", async () => {
    const setReadZipSpy = vi.fn();
    const setZipFileNameSpy = vi.fn();
    render(
      <TopPaper
        readZip={null}
        setReadZip={setReadZipSpy}
        setZipFileName={setZipFileNameSpy}
      />
    );
    const button = await screen.findByTestId("selectZipButton");
    fireEvent.click(button);
    expect(setReadZipSpy).toHaveBeenCalledWith(null);
  });

  it("Fileが変更され、nullの場合何も起こらない。", async () => {
    const setReadZipSpy = vi.fn();
    const setZipFileNameSpy = vi.fn();
    render(
      <TopPaper
        readZip={null}
        setReadZip={setReadZipSpy}
        setZipFileName={setZipFileNameSpy}
      />
    );
    const inputHidden = await screen.findByTestId("hiddenSelectZipInput");
    fireEvent.change(inputHidden, { target: { files: null } });
    expect(setReadZipSpy).not.toHaveBeenCalled();
    expect(setZipFileNameSpy).not.toHaveBeenCalled();
  });

  it("Fileが変更され、ファイル長が0の場合何も起こらない。", async () => {
    const setReadZipSpy = vi.fn();
    const setZipFileNameSpy = vi.fn();
    render(
      <TopPaper
        readZip={null}
        setReadZip={setReadZipSpy}
        setZipFileName={setZipFileNameSpy}
      />
    );
    const inputHidden = await screen.findByTestId("hiddenSelectZipInput");
    fireEvent.change(inputHidden, { target: { files: [] } });
    expect(setReadZipSpy).not.toHaveBeenCalled();
    expect(setZipFileNameSpy).not.toHaveBeenCalled();
  });

  it("Fileが変更されファイルがある場合、ダイアログが開き、ダイアログ内の副作用でsetZipFileNameが呼ばれる", async () => {
    const setReadZipSpy = vi.fn();
    const setZipFileNameSpy = vi.fn();
    const buffer = fs.readFileSync(
      "./__tests__/__fixtures__/minimumTestVB.zip"
    );
    render(
      <TopPaper
        readZip={null}
        setReadZip={setReadZipSpy}
        setZipFileName={setZipFileNameSpy}
      />
    );
    const inputHidden = await screen.findByTestId("hiddenSelectZipInput");
    fireEvent.change(inputHidden, {
      target: { files: [new File([buffer], "dummy.zip")] },
    });
    expect(setZipFileNameSpy).toHaveBeenCalledWith("dummy.zip");
    const dialogButton = screen.getByTestId("hiddenSelectZipInput");
    expect(dialogButton).toBeInTheDocument();
  });

  it("readZipが更新されたとき、内部状態が更新されログ出力される。", async () => {
    const setReadZipSpy = vi.fn();
    const setZipFileNameSpy = vi.fn();
    const { rerender } = render(
      <TopPaper
        readZip={null}
        setReadZip={setReadZipSpy}
        setZipFileName={setZipFileNameSpy}
      />
    );
    Log.datas = [];
    rerender(
      <TopPaper
        //@ts-ignore
        readZip={"dummy"}
        setReadZip={setReadZipSpy}
        setZipFileName={setZipFileNameSpy}
      />
    );
    expect(Log.datas[0]).toContain("zip読込完了");
  });
});
