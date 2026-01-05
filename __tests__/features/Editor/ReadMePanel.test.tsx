import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ReadMePanel } from "../../../src/features/Editor/ReadMePanel";

describe("ReadMePanel", () => {
  const mockFiles = ["root/readme.txt", "root/README.txt", "another/readme.txt"];
  const mockReadme = "これはテストのreadmeです。\n詳細な説明がここに入ります。";

  const setReadmeSpy = vi.fn();
  const setUpdateSpy = vi.fn();
  const setReadmeEncodingSpy = vi.fn();
  const setReadmePathSpy = vi.fn();
  const onReloadSpy = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("チェックボックスをONにできる", async () => {
    const user = userEvent.setup();
    render(
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={false}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath="root/readme.txt"
        setReadmePath={setReadmePathSpy}
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
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={true}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath="root/readme.txt"
        setReadmePath={setReadmePathSpy}
        files={mockFiles}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(setUpdateSpy).toHaveBeenCalledWith(false);
  });

  it("ファイル選択セレクトボックスが表示される", () => {
    render(
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={true}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath="root/readme.txt"
        setReadmePath={setReadmePathSpy}
        files={mockFiles}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    expect(fileSelect).toBeInTheDocument();
    expect(fileSelect).toHaveTextContent("root/readme.txt");
  });

  it("複数のreadmeファイルが選択肢として表示される", async () => {
    const user = userEvent.setup();
    render(
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={true}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath="root/readme.txt"
        setReadmePath={setReadmePathSpy}
        files={mockFiles}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    expect(screen.getByRole("option", { name: "root/readme.txt" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "root/README.txt" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "another/readme.txt" })).toBeInTheDocument();
  });

  it("ファイルパス変更時にonReloadが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={true}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath="root/readme.txt"
        setReadmePath={setReadmePathSpy}
        files={mockFiles}
        onReload={onReloadSpy}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    const option = screen.getByRole("option", { name: "another/readme.txt" });
    await user.click(option);

    await waitFor(() => {
      expect(setReadmePathSpy).toHaveBeenCalledWith("another/readme.txt");
      expect(onReloadSpy).toHaveBeenCalledWith("another/readme.txt", "SJIS");
    });
  });

  it("エンコーディング変更時にonReloadが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={true}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath="root/readme.txt"
        setReadmePath={setReadmePathSpy}
        files={mockFiles}
        onReload={onReloadSpy}
      />
    );

    const encodeSelect = screen.getAllByRole("combobox")[1]; // 2つ目がエンコーディング選択
    await user.click(encodeSelect);

    const utf8Option = screen.getByRole("option", { name: "UTF-8" });
    await user.click(utf8Option);

    await waitFor(() => {
      expect(setReadmeEncodingSpy).toHaveBeenCalledWith("utf-8");
      expect(onReloadSpy).toHaveBeenCalledWith("root/readme.txt", "utf-8");
    });
  });

  it("readmeテキストエリアが表示される", () => {
    render(
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={true}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath="root/readme.txt"
        setReadmePath={setReadmePathSpy}
        files={mockFiles}
      />
    );

    const textArea = screen.getByRole("textbox");
    expect(textArea).toBeInTheDocument();
    expect(textArea).toHaveValue(mockReadme);
  });

  it("update=falseの場合、セレクトボックスがdisabledになる", () => {
    render(
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={false}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath="root/readme.txt"
        setReadmePath={setReadmePathSpy}
        files={mockFiles}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    const fileSelect = comboboxes[0];
    const encodeSelect = comboboxes[1];

    expect(fileSelect.getAttribute("aria-disabled")).toBe("true");
    expect(encodeSelect.getAttribute("aria-disabled")).toBe("true");
  });

  it("ファイルが存在しない場合、セレクトボックスは表示されない", () => {
    render(
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={true}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath=""
        setReadmePath={setReadmePathSpy}
        files={[]}
      />
    );

    // セレクトボックスは1つだけ（EncodeSelect）
    const comboboxes = screen.queryAllByRole("combobox");
    expect(comboboxes).toHaveLength(1);
  });

  it("onReloadが省略されても動作する", async () => {
    const user = userEvent.setup();
    render(
      <ReadMePanel
        readme={mockReadme}
        setReadme={setReadmeSpy}
        update={true}
        setUpdate={setUpdateSpy}
        readmeEncoding="SJIS"
        setReadmeEncoding={setReadmeEncodingSpy}
        readmePath="root/readme.txt"
        setReadmePath={setReadmePathSpy}
        files={mockFiles}
      />
    );

    const fileSelect = screen.getAllByRole("combobox")[0];
    await user.click(fileSelect);

    const option = screen.getByRole("option", { name: "another/readme.txt" });
    await user.click(option);

    // エラーが発生しないことを確認
    expect(setReadmePathSpy).toHaveBeenCalledWith("another/readme.txt");
  });
});
