import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { DeleteButton } from "../../../../src/features/Editor/Prefixmap/DeleteButton";
import { PrefixMap } from "../../../../src/lib/PrefixMap";

describe("DeleteButton", () => {
  const setPrefixMapsSpy = vi.fn();
  const setPrefixSpy = vi.fn();
  const setSuffixSpy = vi.fn();
  const setSelectedSpy = vi.fn();
  const setColorSpy = vi.fn();
  const setColorNameSpy = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("updateがfalseの場合disabled", () => {
    render(
      <DeleteButton
        update={false}
        prefixMaps={{}}
        color="strong"
        setPrefixMaps={setPrefixMapsSpy}
        setPrefix={setPrefixSpy}
        setSuffix={setSuffixSpy}
        setSelected={setSelectedSpy}
        setColor={setColorSpy}
        setColorName={setColorNameSpy}
      />
    );
    const button = screen.getByTestId("prefixDeleteButton");
    expect(button).toHaveAttribute("disabled");
  });

  it("colorNameが空文字列の場合disabled", () => {
    render(
      <DeleteButton
        update={true}
        prefixMaps={{}}
        color=""
        setPrefixMaps={setPrefixMapsSpy}
        setPrefix={setPrefixSpy}
        setSuffix={setSuffixSpy}
        setSelected={setSelectedSpy}
        setColor={setColorSpy}
        setColorName={setColorNameSpy}
      />
    );
    const button = screen.getByTestId("prefixDeleteButton");
    expect(button).toHaveAttribute("disabled");
  });

  it("クリック時の動作", () => {
    const pstemp={}
    pstemp["strong"]=new PrefixMap()
    render(
      <DeleteButton
        update={true}
        prefixMaps={pstemp}
        color="strong"
        setPrefixMaps={setPrefixMapsSpy}
        setPrefix={setPrefixSpy}
        setSuffix={setSuffixSpy}
        setSelected={setSelectedSpy}
        setColor={setColorSpy}
        setColorName={setColorNameSpy}
      />
    );
    const button = screen.getByTestId("prefixDeleteButton");
    expect(button).not.toHaveAttribute("disabled");

    fireEvent.click(button)
    expect(setPrefixMapsSpy).toHaveBeenCalled()
    const ps=setPrefixMapsSpy.mock.calls[0][0]
    expect(Object.keys(ps)).not.toContain("strong")
    expect(setColorSpy).toHaveBeenCalledWith("")
    expect(setSelectedSpy).toHaveBeenCalledWith([])
    expect(setPrefixSpy).toHaveBeenCalledWith("")
    expect(setSuffixSpy).toHaveBeenCalledWith("")
  });
  
});
