import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ShowLogMenu } from "../../../../src/features/Header/HeaderMenuItem/ShowLogMenu";

describe("ShowLogMenu", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("クリックするとダイアログが開く", async () => {
    const setMenuAnchorSpy = vi.fn();
    render(<ShowLogMenu setMenuAnchor={setMenuAnchorSpy} />);
    const menuBaseItem = screen
      .getByText("menu.showLog")
      .closest("li") as HTMLElement;
    fireEvent.click(menuBaseItem);
    const dialogButton = await screen.getByRole("button", {
      name: /error\.download/i,
    });
    expect(dialogButton).toBeInTheDocument();
  });

  it("ダイアログを閉じるとメニューも閉じる", async () => {
    const setMenuAnchorSpy = vi.fn();
    render(<ShowLogMenu setMenuAnchor={setMenuAnchorSpy} />);
    const menuBaseItem = screen
      .getByText("menu.showLog")
      .closest("li") as HTMLElement;
    fireEvent.click(menuBaseItem);
    const dialogCloseButton = await screen.getByTestId("dialogCloseButton")
    expect(dialogCloseButton).toBeInTheDocument();
    fireEvent.click(dialogCloseButton)
    expect(setMenuAnchorSpy).toHaveBeenCalledWith(null)
  });
  
  it("ダイアログ上のボタンをクリックすると、ダイアログが閉じる", async () => {
    //ログをダウンロードする動作はテスト困難
    const setMenuAnchorSpy = vi.fn();
    render(<ShowLogMenu setMenuAnchor={setMenuAnchorSpy} />);
    const menuBaseItem = screen
      .getByText("menu.showLog")
      .closest("li") as HTMLElement;
    fireEvent.click(menuBaseItem);
    const dialogButton = await screen.getByRole("button", {
      name: /error\.download/i,
    });
    expect(dialogButton).toBeInTheDocument();
    fireEvent.click(dialogButton)
    expect(setMenuAnchorSpy).toHaveBeenCalledWith(null)
  });
  
});
