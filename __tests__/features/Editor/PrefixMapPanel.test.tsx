import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { PrefixMapPanel } from "../../../src/features/Editor/PrefixMapPanel";
import { PrefixMap } from "../../../src/lib/PrefixMap";
import { PaletteMode } from "@mui/material";

describe("PrefixMapPanel", () => {
  const mockPrefixMaps: { [key: string]: PrefixMap } = {
    "": new PrefixMap(),
  };

  const mockFiles = [
    "root/prefix.map",
    "root/sub/prefix.map",
    "another/prefix.map",
  ];

  const setPrefixMapsSpy = vi.fn();
  const setUpdateSpy = vi.fn();
  const setPrefixMapEncodingSpy = vi.fn();
  const setPrefixMapPathSpy = vi.fn();
  const onReloadSpy = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("チェックボックスをONにできる", async () => {
    const user = userEvent.setup();
    render(
      <PrefixMapPanel
        prefixMaps={mockPrefixMaps}
        setPrefixMaps={setPrefixMapsSpy}
        update={false}
        setUpdate={setUpdateSpy}
        mode={"light" as PaletteMode}
        prefixMapEncoding="SJIS"
        setPrefixMapEncoding={setPrefixMapEncodingSpy}
        prefixMapPath="root/prefix.map"
        setPrefixMapPath={setPrefixMapPathSpy}
        files={mockFiles}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(setUpdateSpy).toHaveBeenCalledWith(true);
  });

  it("チェックボックスをOFFにできる", async () => {
    const user = userEvent.setup();
    render(
      <PrefixMapPanel
        prefixMaps={mockPrefixMaps}
        setPrefixMaps={setPrefixMapsSpy}
        update={true}
        setUpdate={setUpdateSpy}
        mode={"light" as PaletteMode}
        prefixMapEncoding="SJIS"
        setPrefixMapEncoding={setPrefixMapEncodingSpy}
        prefixMapPath="root/prefix.map"
        setPrefixMapPath={setPrefixMapPathSpy}
        files={mockFiles}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(setUpdateSpy).toHaveBeenCalledWith(false);
  });

  it("ファイル選択セレクトボックスが表示される", () => {
    render(
      <PrefixMapPanel
        prefixMaps={mockPrefixMaps}
        setPrefixMaps={setPrefixMapsSpy}
        update={true}
        setUpdate={setUpdateSpy}
        mode={"light" as PaletteMode}
        prefixMapEncoding="SJIS"
        setPrefixMapEncoding={setPrefixMapEncodingSpy}
        prefixMapPath="root/prefix.map"
        setPrefixMapPath={setPrefixMapPathSpy}
        files={mockFiles}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    const fileSelect = comboboxes[0];
    expect(fileSelect).toBeInTheDocument();
    expect(fileSelect).toHaveTextContent("root/prefix.map");
  });

  it("複数のprefix.mapファイルが選択肢として表示される", async () => {
    const user = userEvent.setup();
    render(
      <PrefixMapPanel
        prefixMaps={mockPrefixMaps}
        setPrefixMaps={setPrefixMapsSpy}
        update={true}
        setUpdate={setUpdateSpy}
        mode={"light" as PaletteMode}
        prefixMapEncoding="SJIS"
        setPrefixMapEncoding={setPrefixMapEncodingSpy}
        prefixMapPath="root/prefix.map"
        setPrefixMapPath={setPrefixMapPathSpy}
        files={mockFiles}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    expect(screen.getByRole("option", { name: "root/prefix.map" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "root/sub/prefix.map" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "another/prefix.map" })).toBeInTheDocument();
  });

  it("ファイルパス変更時にonReloadが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <PrefixMapPanel
        prefixMaps={mockPrefixMaps}
        setPrefixMaps={setPrefixMapsSpy}
        update={true}
        setUpdate={setUpdateSpy}
        mode={"light" as PaletteMode}
        prefixMapEncoding="SJIS"
        setPrefixMapEncoding={setPrefixMapEncodingSpy}
        prefixMapPath="root/prefix.map"
        setPrefixMapPath={setPrefixMapPathSpy}
        files={mockFiles}
        onReload={onReloadSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    const option = screen.getByRole("option", { name: "root/sub/prefix.map" });
    await user.click(option);

    await waitFor(() => {
      expect(setPrefixMapPathSpy).toHaveBeenCalledWith("root/sub/prefix.map");
      expect(onReloadSpy).toHaveBeenCalledWith("root/sub/prefix.map", "SJIS");
    });
  });

  it("エンコーディング変更時にonReloadが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <PrefixMapPanel
        prefixMaps={mockPrefixMaps}
        setPrefixMaps={setPrefixMapsSpy}
        update={true}
        setUpdate={setUpdateSpy}
        mode={"light" as PaletteMode}
        prefixMapEncoding="SJIS"
        setPrefixMapEncoding={setPrefixMapEncodingSpy}
        prefixMapPath="root/prefix.map"
        setPrefixMapPath={setPrefixMapPathSpy}
        files={mockFiles}
        onReload={onReloadSpy}
      />
    );

    const encodeSelect = screen.getAllByRole("combobox")[1]; // 2つ目がエンコーディング選択
    await user.click(encodeSelect);

    const utf8Option = screen.getByRole("option", { name: "UTF-8" });
    await user.click(utf8Option);

    await waitFor(() => {
      expect(setPrefixMapEncodingSpy).toHaveBeenCalledWith("utf-8");
      expect(onReloadSpy).toHaveBeenCalledWith("root/prefix.map", "utf-8");
    });
  });

  it("update=falseの場合、セレクトボックスがdisabledになる", () => {
    render(
      <PrefixMapPanel
        prefixMaps={mockPrefixMaps}
        setPrefixMaps={setPrefixMapsSpy}
        update={false}
        setUpdate={setUpdateSpy}
        mode={"light" as PaletteMode}
        prefixMapEncoding="SJIS"
        setPrefixMapEncoding={setPrefixMapEncodingSpy}
        prefixMapPath="root/prefix.map"
        setPrefixMapPath={setPrefixMapPathSpy}
        files={mockFiles}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    const fileSelect = comboboxes[0];
    const encodeSelect = comboboxes[1];

    expect(fileSelect.getAttribute("aria-disabled")).toBe("true");
    expect(encodeSelect.getAttribute("aria-disabled")).toBe("true");
  });

  it("prefix.mapファイルが存在しない場合、ファイル選択セレクトボックスは表示されない", () => {
    render(
      <PrefixMapPanel
        prefixMaps={{}}
        setPrefixMaps={setPrefixMapsSpy}
        update={true}
        setUpdate={setUpdateSpy}
        mode={"light" as PaletteMode}
        prefixMapEncoding="SJIS"
        setPrefixMapEncoding={setPrefixMapEncodingSpy}
        prefixMapPath=""
        setPrefixMapPath={setPrefixMapPathSpy}
        files={[]}
      />
    );

    const comboboxes = screen.queryAllByRole("combobox");
    // prefix.mapが存在しない場合、ファイル選択セレクトボックスは非表示、エンコーディング選択のみ表示
    expect(comboboxes.length).toBe(1);
  });

  it("onReloadが省略されても動作する", async () => {
    const user = userEvent.setup();
    render(
      <PrefixMapPanel
        prefixMaps={mockPrefixMaps}
        setPrefixMaps={setPrefixMapsSpy}
        update={true}
        setUpdate={setUpdateSpy}
        mode={"light" as PaletteMode}
        prefixMapEncoding="SJIS"
        setPrefixMapEncoding={setPrefixMapEncodingSpy}
        prefixMapPath="root/prefix.map"
        setPrefixMapPath={setPrefixMapPathSpy}
        files={mockFiles}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    const option = screen.getByRole("option", { name: "root/sub/prefix.map" });
    await user.click(option);

    // エラーが発生しないことを確認
    expect(setPrefixMapPathSpy).toHaveBeenCalledWith("root/sub/prefix.map");
  });
});
