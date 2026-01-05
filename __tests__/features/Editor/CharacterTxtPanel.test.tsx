import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import JSZip from "jszip";

import { CharacterTxtPanel } from "../../../src/features/Editor/CharacterTxtPanel";
import { CharacterTxt } from "../../../src/lib/CharacterTxt";

describe("CharacterTxtPanel", () => {
  const mockCharacter = new CharacterTxt({
    name: "テストキャラクター",
    image: "icon.bmp",
    sample: "sample.wav",
    author: "テスト作者",
    web: "https://example.com",
  });

  const mockFiles = [
    "root/character.txt",
    "root/sub/character.txt",
    "another/character.txt",
  ];

  // 空のzipFilesを作成
  const mockZipFiles = new JSZip().files;

  const setCharacterTxtSpy = vi.fn();
  const setCharacterTxtUpdateSpy = vi.fn();
  const setIconBufSpy = vi.fn();
  const setSampleBufSpy = vi.fn();
  const setCharacterTxtEncodingSpy = vi.fn();
  const setCharacterTxtPathSpy = vi.fn();
  const onReloadSpy = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("チェックボックスをONにできる", async () => {
    const user = userEvent.setup();
    render(
      <CharacterTxtPanel
        rootDir="root"
        zipFiles={mockZipFiles}
        zipFileName="test.zip"
        characterTxt={mockCharacter}
        setCharacterTxt={setCharacterTxtSpy}
        characterTxtUpdate={false}
        characterForceUpdate={false}
        setCharacterTxtUpdate={setCharacterTxtUpdateSpy}
        files={mockFiles}
        setIconBuf={setIconBufSpy}
        setSampleBuf={setSampleBufSpy}
        characterTxtEncoding="SJIS"
        setCharacterTxtEncoding={setCharacterTxtEncodingSpy}
        characterTxtPath="root/character.txt"
        setCharacterTxtPath={setCharacterTxtPathSpy}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(setCharacterTxtUpdateSpy).toHaveBeenCalledWith(true);
  });

  it("ファイル選択セレクトボックスが表示される", () => {
    render(
      <CharacterTxtPanel
        rootDir="root"
        zipFiles={mockZipFiles}
        zipFileName="test.zip"
        characterTxt={mockCharacter}
        setCharacterTxt={setCharacterTxtSpy}
        characterTxtUpdate={true}
        characterForceUpdate={false}
        setCharacterTxtUpdate={setCharacterTxtUpdateSpy}
        files={mockFiles}
        setIconBuf={setIconBufSpy}
        setSampleBuf={setSampleBufSpy}
        characterTxtEncoding="SJIS"
        setCharacterTxtEncoding={setCharacterTxtEncodingSpy}
        characterTxtPath="root/character.txt"
        setCharacterTxtPath={setCharacterTxtPathSpy}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    const fileSelect = comboboxes[0]; // 最初のcomboboxがファイル選択
    expect(fileSelect).toBeInTheDocument();
    expect(fileSelect).toHaveTextContent("root/character.txt");
  });

  it("ファイルパス変更時にonReloadが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <CharacterTxtPanel
        rootDir="root"
        zipFiles={mockZipFiles}
        zipFileName="test.zip"
        characterTxt={mockCharacter}
        setCharacterTxt={setCharacterTxtSpy}
        characterTxtUpdate={true}
        characterForceUpdate={false}
        setCharacterTxtUpdate={setCharacterTxtUpdateSpy}
        files={mockFiles}
        setIconBuf={setIconBufSpy}
        setSampleBuf={setSampleBufSpy}
        characterTxtEncoding="SJIS"
        setCharacterTxtEncoding={setCharacterTxtEncodingSpy}
        characterTxtPath="root/character.txt"
        setCharacterTxtPath={setCharacterTxtPathSpy}
        onReload={onReloadSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    const option = screen.getByRole("option", { name: "root/sub/character.txt" });
    await user.click(option);

    await waitFor(() => {
      expect(setCharacterTxtPathSpy).toHaveBeenCalledWith("root/sub/character.txt");
      expect(onReloadSpy).toHaveBeenCalledWith("root/sub/character.txt", "SJIS");
    });
  });

  it("エンコーディング変更時にonReloadが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <CharacterTxtPanel
        rootDir="root"
        zipFiles={mockZipFiles}
        zipFileName="test.zip"
        characterTxt={mockCharacter}
        setCharacterTxt={setCharacterTxtSpy}
        characterTxtUpdate={true}
        characterForceUpdate={false}
        setCharacterTxtUpdate={setCharacterTxtUpdateSpy}
        files={mockFiles}
        setIconBuf={setIconBufSpy}
        setSampleBuf={setSampleBufSpy}
        characterTxtEncoding="SJIS"
        setCharacterTxtEncoding={setCharacterTxtEncodingSpy}
        characterTxtPath="root/character.txt"
        setCharacterTxtPath={setCharacterTxtPathSpy}
        onReload={onReloadSpy}
      />
    );

    const encodeSelect = screen.getAllByRole("combobox")[1]; // 2つ目がエンコーディング選択
    await user.click(encodeSelect);

    const utf8Option = screen.getByRole("option", { name: "UTF-8" });
    await user.click(utf8Option);

    await waitFor(() => {
      expect(setCharacterTxtEncodingSpy).toHaveBeenCalledWith("utf-8");
      expect(onReloadSpy).toHaveBeenCalledWith("root/character.txt", "utf-8");
    });
  });

  it("update=falseの場合、セレクトボックスはdisabledにならない（ファイル選択は常に可能）", () => {
    render(
      <CharacterTxtPanel
        rootDir="root"
        zipFiles={mockZipFiles}
        zipFileName="test.zip"
        characterTxt={mockCharacter}
        setCharacterTxt={setCharacterTxtSpy}
        characterTxtUpdate={false}
        characterForceUpdate={false}
        setCharacterTxtUpdate={setCharacterTxtUpdateSpy}
        files={mockFiles}
        setIconBuf={setIconBufSpy}
        setSampleBuf={setSampleBufSpy}
        characterTxtEncoding="SJIS"
        setCharacterTxtEncoding={setCharacterTxtEncodingSpy}
        characterTxtPath="root/character.txt"
        setCharacterTxtPath={setCharacterTxtPathSpy}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    const fileSelect = comboboxes[0];
    const encodeSelect = comboboxes[1];

    // character.txtは編集有無に関わらずファイル選択できる仕様
    expect(fileSelect.getAttribute("aria-disabled")).not.toBe("true");
    expect(encodeSelect.getAttribute("aria-disabled")).not.toBe("true");
    
    // ただし、テキストフィールドはdisabledになる
    const nameField = screen.getByRole("textbox", { name: /name/i });
    expect(nameField).toBeDisabled();
  });

  it("onReloadが省略されても動作する", async () => {
    const user = userEvent.setup();
    render(
      <CharacterTxtPanel
        rootDir="root"
        zipFiles={mockZipFiles}
        zipFileName="test.zip"
        characterTxt={mockCharacter}
        setCharacterTxt={setCharacterTxtSpy}
        characterTxtUpdate={true}
        characterForceUpdate={false}
        setCharacterTxtUpdate={setCharacterTxtUpdateSpy}
        files={mockFiles}
        setIconBuf={setIconBufSpy}
        setSampleBuf={setSampleBufSpy}
        characterTxtEncoding="SJIS"
        setCharacterTxtEncoding={setCharacterTxtEncodingSpy}
        characterTxtPath="root/character.txt"
        setCharacterTxtPath={setCharacterTxtPathSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    const option = screen.getByRole("option", { name: "root/sub/character.txt" });
    await user.click(option);

    // エラーが発生しないことを確認
    expect(setCharacterTxtPathSpy).toHaveBeenCalledWith("root/sub/character.txt");
  });

  it("character.txtの名前フィールドが表示される", () => {
    render(
      <CharacterTxtPanel
        rootDir="root"
        zipFiles={mockZipFiles}
        zipFileName="test.zip"
        characterTxt={mockCharacter}
        setCharacterTxt={setCharacterTxtSpy}
        characterTxtUpdate={true}
        characterForceUpdate={false}
        setCharacterTxtUpdate={setCharacterTxtUpdateSpy}
        files={mockFiles}
        setIconBuf={setIconBufSpy}
        setSampleBuf={setSampleBufSpy}
        characterTxtEncoding="SJIS"
        setCharacterTxtEncoding={setCharacterTxtEncodingSpy}
        characterTxtPath="root/character.txt"
        setCharacterTxtPath={setCharacterTxtPathSpy}
      />
    );

    const nameField = screen.getByRole("textbox", { name: /name/i });
    expect(nameField).toHaveValue("テストキャラクター");
  });

  it("複数のcharacter.txtファイルが選択肢として表示される", async () => {
    const user = userEvent.setup();
    render(
      <CharacterTxtPanel
        rootDir="root"
        zipFiles={mockZipFiles}
        zipFileName="test.zip"
        characterTxt={mockCharacter}
        setCharacterTxt={setCharacterTxtSpy}
        characterTxtUpdate={true}
        characterForceUpdate={false}
        setCharacterTxtUpdate={setCharacterTxtUpdateSpy}
        files={mockFiles}
        setIconBuf={setIconBufSpy}
        setSampleBuf={setSampleBufSpy}
        characterTxtEncoding="SJIS"
        setCharacterTxtEncoding={setCharacterTxtEncodingSpy}
        characterTxtPath="root/character.txt"
        setCharacterTxtPath={setCharacterTxtPathSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    expect(screen.getByRole("option", { name: "root/character.txt" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "root/sub/character.txt" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "another/character.txt" })).toBeInTheDocument();
  });
});
