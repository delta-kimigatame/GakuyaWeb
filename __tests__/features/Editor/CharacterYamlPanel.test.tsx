import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { CharacterYamlPanel } from "../../../src/features/Editor/CharacterYamlPanel";
import { PrefixMap } from "../../../src/lib/PrefixMap";

describe("CharacterYamlPanel", () => {
  const mockCharacterYaml = {
    voice: "テストボイス",
    subbanks: [
      {
        color: "a",
        prefix: "",
        suffix: "_A",
        tone_ranges: ["C1-B4"],
      },
    ],
  };

  const mockPrefixMaps: { [key: string]: PrefixMap } = {
    "": new PrefixMap(),
  };

  const mockFiles = [
    "root/character.yaml",
    "root/sub/character.yaml",
    "another/character.yaml",
  ];

  const setCharacterYamlSpy = vi.fn();
  const setUpdateSpy = vi.fn();
  const setPortraitBufSpy = vi.fn();
  const setCharacterYamlPathSpy = vi.fn();
  const onReloadSpy = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("チェックボックスをONにできる", async () => {
    const user = userEvent.setup();
    render(
      <CharacterYamlPanel
        characterYaml={mockCharacterYaml}
        setCharacterYaml={setCharacterYamlSpy}
        update={false}
        setUpdate={setUpdateSpy}
        prefixMapsUpdate={false}
        prefixMaps={mockPrefixMaps}
        files={mockFiles}
        portraitBuf={new ArrayBuffer(0)}
        setPortraitBuf={setPortraitBufSpy}
        characterYamlPath="root/character.yaml"
        setCharacterYamlPath={setCharacterYamlPathSpy}
      />
    );

    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);

    expect(setUpdateSpy).toHaveBeenCalledWith(true);
  });

  it("チェックボックスをOFFにできる", async () => {
    const user = userEvent.setup();
    render(
      <CharacterYamlPanel
        characterYaml={mockCharacterYaml}
        setCharacterYaml={setCharacterYamlSpy}
        update={true}
        setUpdate={setUpdateSpy}
        prefixMapsUpdate={false}
        prefixMaps={mockPrefixMaps}
        files={mockFiles}
        portraitBuf={new ArrayBuffer(0)}
        setPortraitBuf={setPortraitBufSpy}
        characterYamlPath="root/character.yaml"
        setCharacterYamlPath={setCharacterYamlPathSpy}
      />
    );

    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);

    expect(setUpdateSpy).toHaveBeenCalledWith(false);
  });

  it("ファイル選択セレクトボックスが表示される", () => {
    render(
      <CharacterYamlPanel
        characterYaml={mockCharacterYaml}
        setCharacterYaml={setCharacterYamlSpy}
        update={true}
        setUpdate={setUpdateSpy}
        prefixMapsUpdate={false}
        prefixMaps={mockPrefixMaps}
        files={mockFiles}
        portraitBuf={new ArrayBuffer(0)}
        setPortraitBuf={setPortraitBufSpy}
        characterYamlPath="root/character.yaml"
        setCharacterYamlPath={setCharacterYamlPathSpy}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBeGreaterThan(0);
    expect(comboboxes[0]).toHaveTextContent("root/character.yaml");
  });

  it("複数のcharacter.yamlファイルが選択肢として表示される", async () => {
    const user = userEvent.setup();
    render(
      <CharacterYamlPanel
        characterYaml={mockCharacterYaml}
        setCharacterYaml={setCharacterYamlSpy}
        update={true}
        setUpdate={setUpdateSpy}
        prefixMapsUpdate={false}
        prefixMaps={mockPrefixMaps}
        files={mockFiles}
        portraitBuf={new ArrayBuffer(0)}
        setPortraitBuf={setPortraitBufSpy}
        characterYamlPath="root/character.yaml"
        setCharacterYamlPath={setCharacterYamlPathSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    expect(screen.getByRole("option", { name: "root/character.yaml" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "root/sub/character.yaml" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "another/character.yaml" })).toBeInTheDocument();
  });

  it("ファイルパス変更時にonReloadが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <CharacterYamlPanel
        characterYaml={mockCharacterYaml}
        setCharacterYaml={setCharacterYamlSpy}
        update={true}
        setUpdate={setUpdateSpy}
        prefixMapsUpdate={false}
        prefixMaps={mockPrefixMaps}
        files={mockFiles}
        portraitBuf={new ArrayBuffer(0)}
        setPortraitBuf={setPortraitBufSpy}
        characterYamlPath="root/character.yaml"
        setCharacterYamlPath={setCharacterYamlPathSpy}
        onReload={onReloadSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    const option = screen.getByRole("option", { name: "root/sub/character.yaml" });
    await user.click(option);

    await waitFor(() => {
      expect(setCharacterYamlPathSpy).toHaveBeenCalledWith("root/sub/character.yaml");
      expect(onReloadSpy).toHaveBeenCalledWith("root/sub/character.yaml");
    });
  });

  it("update=falseの場合、セレクトボックスがdisabledになる", () => {
    render(
      <CharacterYamlPanel
        characterYaml={mockCharacterYaml}
        setCharacterYaml={setCharacterYamlSpy}
        update={false}
        setUpdate={setUpdateSpy}
        prefixMapsUpdate={false}
        prefixMaps={mockPrefixMaps}
        files={mockFiles}
        portraitBuf={new ArrayBuffer(0)}
        setPortraitBuf={setPortraitBufSpy}
        characterYamlPath="root/character.yaml"
        setCharacterYamlPath={setCharacterYamlPathSpy}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    const fileSelect = comboboxes[0];
    expect(fileSelect.getAttribute("aria-disabled")).toBe("true");
  });

  it("character.yamlファイルが存在しない場合、ファイル選択セレクトボックスは表示されない", () => {
    render(
      <CharacterYamlPanel
        characterYaml={mockCharacterYaml}
        setCharacterYaml={setCharacterYamlSpy}
        update={true}
        setUpdate={setUpdateSpy}
        prefixMapsUpdate={false}
        prefixMaps={mockPrefixMaps}
        files={[]}
        portraitBuf={new ArrayBuffer(0)}
        setPortraitBuf={setPortraitBufSpy}
        characterYamlPath=""
        setCharacterYamlPath={setCharacterYamlPathSpy}
      />
    );

    const comboboxes = screen.queryAllByRole("combobox");
    // character.yamlファイルが存在しないのでファイル選択セレクトボックスは表示されない
    // portraitSelectのみ表示される
    expect(comboboxes.length).toBe(1);
  });

  it("onReloadが省略されても動作する", async () => {
    const user = userEvent.setup();
    render(
      <CharacterYamlPanel
        characterYaml={mockCharacterYaml}
        setCharacterYaml={setCharacterYamlSpy}
        update={true}
        setUpdate={setUpdateSpy}
        prefixMapsUpdate={false}
        prefixMaps={mockPrefixMaps}
        files={mockFiles}
        portraitBuf={new ArrayBuffer(0)}
        setPortraitBuf={setPortraitBufSpy}
        characterYamlPath="root/character.yaml"
        setCharacterYamlPath={setCharacterYamlPathSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    const option = screen.getByRole("option", { name: "root/sub/character.yaml" });
    await user.click(option);

    // エラーが発生しないことを確認
    expect(setCharacterYamlPathSpy).toHaveBeenCalledWith("root/sub/character.yaml");
  });

  it("character.yamlがnullの場合の表示", () => {
    render(
      <CharacterYamlPanel
        characterYaml={null}
        setCharacterYaml={setCharacterYamlSpy}
        update={true}
        setUpdate={setUpdateSpy}
        prefixMapsUpdate={false}
        prefixMaps={mockPrefixMaps}
        files={mockFiles}
        portraitBuf={new ArrayBuffer(0)}
        setPortraitBuf={setPortraitBufSpy}
        characterYamlPath=""
        setCharacterYamlPath={setCharacterYamlPathSpy}
      />
    );

    // character.yamlがnullでも画面が表示されることを確認
    const checkbox = screen.getAllByRole("checkbox")[0];
    expect(checkbox).toBeInTheDocument();
  });
});
