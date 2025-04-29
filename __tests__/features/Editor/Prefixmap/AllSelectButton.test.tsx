import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { AllSelectButton } from "../../../../src/features/Editor/Prefixmap/AllSelectButton";

describe("AllSelectButton", () => {
  const setSelectedSpy = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("updateがfalseの場合disabled", () => {
    render(<AllSelectButton update={false} setSelected={setSelectedSpy} />);
    const button = screen.getByTestId("prefixAllSelectButton");
    expect(button).toHaveAttribute("disabled");
  });
  it("click時の動作", () => {
    render(<AllSelectButton update={true} setSelected={setSelectedSpy} />);
    const button = screen.getByTestId("prefixAllSelectButton");
    expect(button).not.toHaveAttribute("disabled");
    fireEvent.click(button);
    expect(setSelectedSpy).toHaveBeenCalled();
    const testTable = Array.from({ length: 107 - 24 + 1 }, (_, i) => 107 - i);
    expect(setSelectedSpy.mock.calls[0][0]).toEqual(testTable);
  });
});
