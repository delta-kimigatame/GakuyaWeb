import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { LanguageMenu } from "../../../../src/features/Header/HeaderMenuItem/LanguageMenu";

describe("LanguageMenu", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it("jaをクリックするとjaになる", async () => {
    const setLanguageSpy = vi.fn();
    const setMenuAnchorSpy = vi.fn();
    render(
      <LanguageMenu
        language="ja"
        setLanguage={setLanguageSpy}
        setMenuAnchor={setMenuAnchorSpy}
      />
    );
    const menuBaseItem = screen.getByText("ja").closest("li") as HTMLElement;
    fireEvent.click(menuBaseItem);
    const menuItem = (await screen
      .getByText("language.ja")
      .closest("li")) as HTMLElement;
    fireEvent.click(menuItem);
    expect(setLanguageSpy).toHaveBeenCalledWith("ja");
    expect(setMenuAnchorSpy).toHaveBeenCalledWith(null);
  });
  it("enをクリックするとenになる", async () => {
    const setLanguageSpy = vi.fn();
    const setMenuAnchorSpy = vi.fn();
    render(
      <LanguageMenu
        language="ja"
        setLanguage={setLanguageSpy}
        setMenuAnchor={setMenuAnchorSpy}
      />
    );
    const menuBaseItem = screen.getByText("ja").closest("li") as HTMLElement;
    fireEvent.click(menuBaseItem);
    const menuItem = await screen
      .getByText("language.en")
      .closest("li") as HTMLElement;
    fireEvent.click(menuItem);
    expect(setLanguageSpy).toHaveBeenCalledWith("en");
    expect(setMenuAnchorSpy).toHaveBeenCalledWith(null);
  });
});
