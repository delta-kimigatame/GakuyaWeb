import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { CancelButton } from "../../../../src/features/Editor/Prefixmap/CancelButton";

describe("CancelButton", () => {
  const setPrefixSpy = vi.fn();
  const setSuffixSpy = vi.fn();
  const setSelectedSpy = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("updateがfalseの場合disabled", () => {
    render(
      <CancelButton
        update={false}
        setSelected={setSelectedSpy}
        setPrefix={setPrefixSpy}
        setSuffix={setSuffixSpy}
      />
    );
    const button = screen.getByTestId("prefixCancelButton");
    expect(button).toHaveAttribute("disabled");
  });
  it("click時の動作", () => {
    render(
      <CancelButton
        update={true}
        setSelected={setSelectedSpy}
        setPrefix={setPrefixSpy}
        setSuffix={setSuffixSpy}
      />
    );
    const button = screen.getByTestId("prefixCancelButton");
    expect(button).not.toHaveAttribute("disabled");
    fireEvent.click(button);
    expect(setSelectedSpy).toHaveBeenCalledWith([]);
    expect(setPrefixSpy).toHaveBeenCalledWith("")
    expect(setSuffixSpy).toHaveBeenCalledWith("")
  });
});
