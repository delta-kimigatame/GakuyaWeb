import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { OtoIniPanel } from "../../../src/features/Editor/OtoIniPanel";

describe("OtoIniPanel", () => {
  const mockFiles = ["root/oto.ini", "root/sub/oto.ini", "another/oto.ini"];
  const mockEncodings = new Map<string, string>([
    ["root/oto.ini", "SJIS"],
    ["root/sub/oto.ini", "UTF-8"],
    ["another/oto.ini", "gbk"],
  ]);

  const setOtoEncodingsSpy = vi.fn();
  const setSelectedOtoPathSpy = vi.fn();
  const setOtoContentSpy = vi.fn();
  const setUpdateSpy = vi.fn();
  const onReloadSpy = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("チェックボックスをONにできる", async () => {
    const user = userEvent.setup();
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath="root/oto.ini"
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent="content"
        setOtoContent={setOtoContentSpy}
        update={false}
        setUpdate={setUpdateSpy}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(setUpdateSpy).toHaveBeenCalledWith(true);
  });

  it("チェックボックスをOFFにできる", async () => {
    const user = userEvent.setup();
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath="root/oto.ini"
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent="content"
        setOtoContent={setOtoContentSpy}
        update={true}
        setUpdate={setUpdateSpy}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(setUpdateSpy).toHaveBeenCalledWith(false);
  });

  it("ファイル選択セレクトボックスが表示される", () => {
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath="root/oto.ini"
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent="content"
        setOtoContent={setOtoContentSpy}
        update={true}
        setUpdate={setUpdateSpy}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    const fileSelect = comboboxes[0];
    expect(fileSelect).toBeInTheDocument();
    expect(fileSelect).toHaveTextContent("root/oto.ini");
  });

  it("ファイル選択セレクトボックスに全ファイルが表示される", async () => {
    const user = userEvent.setup();
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath="root/oto.ini"
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent="content"
        setOtoContent={setOtoContentSpy}
        update={true}
        setUpdate={setUpdateSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    expect(screen.getByRole("option", { name: "root/oto.ini" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "root/sub/oto.ini" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "another/oto.ini" })).toBeInTheDocument();
  });

  it("ファイルパス変更時にonReloadが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath="root/oto.ini"
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent="content"
        setOtoContent={setOtoContentSpy}
        update={true}
        setUpdate={setUpdateSpy}
        onReload={onReloadSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);
    
    const option = screen.getByRole("option", { name: "root/sub/oto.ini" });
    await user.click(option);

    await waitFor(() => {
      expect(setSelectedOtoPathSpy).toHaveBeenCalledWith("root/sub/oto.ini");
      expect(onReloadSpy).toHaveBeenCalledWith("root/sub/oto.ini", "UTF-8");
    });
  });

  it("エンコーディング変更時にonReloadが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath="root/oto.ini"
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent="content"
        setOtoContent={setOtoContentSpy}
        update={true}
        setUpdate={setUpdateSpy}
        onReload={onReloadSpy}
      />
    );

    const encodeSelect = screen.getAllByRole("combobox")[1]; // 2つ目がエンコーディング選択
    await user.click(encodeSelect);
    
    const utf8Option = screen.getByRole("option", { name: "UTF-8" });
    await user.click(utf8Option);

    await waitFor(() => {
      expect(setOtoEncodingsSpy).toHaveBeenCalled();
      expect(onReloadSpy).toHaveBeenCalledWith("root/oto.ini", "utf-8");
    });
  });

  it("oto.iniが存在しない場合はメッセージを表示", () => {
    render(
      <OtoIniPanel
        files={[]}
        otoEncodings={new Map()}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath=""
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent=""
        setOtoContent={setOtoContentSpy}
        update={true}
        setUpdate={setUpdateSpy}
      />
    );

    expect(screen.getByText(/noFiles/i)).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("プレビューテキストが表示される", () => {
    const testContent = "a.wav=a,0,100,50,0,0\nb.wav=b,0,100,50,0,0";
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath="root/oto.ini"
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent={testContent}
        setOtoContent={setOtoContentSpy}
        update={true}
        setUpdate={setUpdateSpy}
      />
    );

    const preview = screen.getByRole("textbox");
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveValue(testContent);
    expect(preview).toBeDisabled();
  });

  it("update=falseの場合、セレクトボックスがdisabledになる", () => {
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath="root/oto.ini"
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent="content"
        setOtoContent={setOtoContentSpy}
        update={false}
        setUpdate={setUpdateSpy}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    const fileSelect = comboboxes[0];
    const encodeSelect = comboboxes[1];
    
    expect(fileSelect.getAttribute("aria-disabled")).toBe("true");
    expect(encodeSelect.getAttribute("aria-disabled")).toBe("true");
  });

  it("selectedOtoPathが空の場合、プレビューは表示されない", () => {
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath=""
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent=""
        setOtoContent={setOtoContentSpy}
        update={true}
        setUpdate={setUpdateSpy}
      />
    );

    expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
  });

  it("onReloadが省略されても動作する", async () => {
    const user = userEvent.setup();
    render(
      <OtoIniPanel
        files={mockFiles}
        otoEncodings={mockEncodings}
        setOtoEncodings={setOtoEncodingsSpy}
        selectedOtoPath="root/oto.ini"
        setSelectedOtoPath={setSelectedOtoPathSpy}
        otoContent="content"
        setOtoContent={setOtoContentSpy}
        update={true}
        setUpdate={setUpdateSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);
    
    const option = screen.getByRole("option", { name: "root/sub/oto.ini" });
    await user.click(option);

    // エラーが発生しないことを確認
    expect(setSelectedOtoPathSpy).toHaveBeenCalledWith("root/sub/oto.ini");
  });
});
