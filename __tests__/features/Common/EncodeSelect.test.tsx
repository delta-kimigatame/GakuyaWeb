import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { EncodeSelect } from "../../../src/features/Common/EncodeSelect";

describe("EncodeSelect", () => {
  const onChangeSpy = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("初期値が正しく表示される", () => {
    render(<EncodeSelect value="SJIS" onChange={onChangeSpy} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveTextContent("Shift-JIS");
  });

  it("エンコーディング変更時にonChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    render(<EncodeSelect value="SJIS" onChange={onChangeSpy} />);

    const select = screen.getByRole("combobox");
    await user.click(select);
    
    const utf8Option = screen.getByRole("option", { name: "UTF-8" });
    await user.click(utf8Option);

    expect(onChangeSpy).toHaveBeenCalledWith("utf-8");
  });

  it("disabled状態では操作できない", () => {
    render(<EncodeSelect value="SJIS" onChange={onChangeSpy} disabled={true} />);

    const select = screen.getByRole("combobox");
    expect(select.getAttribute("aria-disabled")).toBe("true");
  });

  it("すべてのエンコーディングオプションが表示される", async () => {
    const user = userEvent.setup();
    render(<EncodeSelect value="SJIS" onChange={onChangeSpy} />);

    const select = screen.getByRole("combobox");
    await user.click(select);

    expect(screen.getByRole("option", { name: "Shift-JIS" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "UTF-8" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "GB18030" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "GBK" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "BIG5" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "WINDOWS-1252" })).toBeInTheDocument();
  });

  it("カスタムラベルが表示される", () => {
    render(<EncodeSelect value="SJIS" onChange={onChangeSpy} label="カスタムラベル" />);

    expect(screen.getByText("カスタムラベル")).toBeInTheDocument();
  });

  it("disabled=falseの場合は操作可能", () => {
    render(<EncodeSelect value="SJIS" onChange={onChangeSpy} disabled={false} />);

    const select = screen.getByRole("combobox");
    expect(select.getAttribute("aria-disabled")).not.toBe("true");
  });

  it("異なるエンコーディングから別のエンコーディングへ変更できる", async () => {
    const user = userEvent.setup();
    render(<EncodeSelect value="utf-8" onChange={onChangeSpy} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveTextContent("UTF-8");

    await user.click(select);
    const gbkOption = screen.getByRole("option", { name: "GBK" });
    await user.click(gbkOption);

    expect(onChangeSpy).toHaveBeenCalledWith("gbk");
  });
});
