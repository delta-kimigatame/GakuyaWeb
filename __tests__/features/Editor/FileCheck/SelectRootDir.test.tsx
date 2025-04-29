import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SelectRootDir } from "../../../../src/features/Editor/FileCheck/SelectRootDir";

describe("SelectRootDir", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("セレクトボックスを変更するとrootDirが変更される", async () => {
    const setRootDirSpy = vi.fn();
    render(
      <SelectRootDir
        rootDir="/"
        setRootDir={setRootDirSpy}
        directories={["/", "/test/"]}
      />
    );
    const user = userEvent.setup();
    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    const options = await screen.findByRole("option", { name: "/test/" });
    await user.click(options);
    expect(setRootDirSpy).toHaveBeenCalledWith("/test/")
  });
});
