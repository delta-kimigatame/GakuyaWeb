import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { AddButton } from "../../../../src/features/Editor/Prefixmap/AddButton";

describe("AddButton", () => {
  const setPrefixMapsSpy = vi.fn();
  const setPrefixSpy = vi.fn();
  const setSuffixSpy = vi.fn();
  const setSelectedSpy = vi.fn();
  const setColorSpy = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("updateがfalseの場合disabled", () => {
    render(
      <AddButton
        update={false}
        prefixMaps={{}}
        colorName="strong"
        setPrefixMaps={setPrefixMapsSpy}
        setPrefix={setPrefixSpy}
        setSuffix={setSuffixSpy}
        setSelected={setSelectedSpy}
        setColor={setColorSpy}
      />
    );
    const button = screen.getByTestId("prefixAddButton");
    expect(button).toHaveAttribute("disabled");
  });

  it("colorNameが空文字列の場合disabled", () => {
    render(
      <AddButton
        update={true}
        prefixMaps={{}}
        colorName=""
        setPrefixMaps={setPrefixMapsSpy}
        setPrefix={setPrefixSpy}
        setSuffix={setSuffixSpy}
        setSelected={setSelectedSpy}
        setColor={setColorSpy}
      />
    );
    const button = screen.getByTestId("prefixAddButton");
    expect(button).toHaveAttribute("disabled");
  });

  it("クリック時の動作", () => {
    render(
      <AddButton
        update={true}
        prefixMaps={{}}
        colorName="strong"
        setPrefixMaps={setPrefixMapsSpy}
        setPrefix={setPrefixSpy}
        setSuffix={setSuffixSpy}
        setSelected={setSelectedSpy}
        setColor={setColorSpy}
      />
    );
    const button = screen.getByTestId("prefixAddButton");
    expect(button).not.toHaveAttribute("disabled");

    fireEvent.click(button)
    expect(setPrefixMapsSpy).toHaveBeenCalled()
    const ps=setPrefixMapsSpy.mock.calls[0][0]
    expect(Object.keys(ps)).toContain("strong")
    expect(setColorSpy).toHaveBeenCalledWith("strong")
    expect(setSelectedSpy).toHaveBeenCalledWith([])
    expect(setPrefixSpy).toHaveBeenCalledWith("")
    expect(setSuffixSpy).toHaveBeenCalledWith("")
  });
  
});
