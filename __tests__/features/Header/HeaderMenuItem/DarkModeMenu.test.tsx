import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import fs from "fs";

import { DarkModeMenu } from "../../../../src/features/Header/HeaderMenuItem/DarkModeMenu";

describe("DarkModeMenu", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it("darkモードの時にクリックするとlightになる", async () => {
    const setModeSpy = vi.fn();
    const setMenuAnchorSpy = vi.fn();
    render(
      <DarkModeMenu
        mode="dark"
        setMode={setModeSpy}
        setMenuAnchor={setMenuAnchorSpy}
      />
    );
    const modeMenu = screen
      .getByText("menu.toLightMode")
      .closest("li") as HTMLElement;
    fireEvent.click(modeMenu);
    expect(setModeSpy).toHaveBeenCalledWith("light")
    expect(setMenuAnchorSpy).toHaveBeenCalledWith(null)
  });
  it("lightモードの時にクリックするとdarkになる", async () => {
    const setModeSpy = vi.fn();
    const setMenuAnchorSpy = vi.fn();
    render(
      <DarkModeMenu
        mode="light"
        setMode={setModeSpy}
        setMenuAnchor={setMenuAnchorSpy}
      />
    );
    const modeMenu = screen
      .getByText("menu.toDarkMode")
      .closest("li") as HTMLElement;
    fireEvent.click(modeMenu);
    expect(setModeSpy).toHaveBeenCalledWith("dark")
    expect(setMenuAnchorSpy).toHaveBeenCalledWith(null)
  });
});
