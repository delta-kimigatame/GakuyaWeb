import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { InstallTextPanel } from "../../../src/features/Editor/InstallTxtPanel";
import { InstallTxt } from "../../../src/lib/InstallTxt";

describe("InstallTextPanel", () => {
  const setInstallSpy = vi.fn();
  const setUpdateSpy = vi.fn();

  const install = new InstallTxt({
    folder: "root",
    contentsDir: "contents",
    description: "hogehoge",
  });
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("初期値の確認:installがnullの場合、テキストボックスは表示されない。", () => {
    render(
      <InstallTextPanel
        rootDir="/root/"
        install={null}
        setInstall={setInstallSpy}
        zipFileName="dummy.zip"
        update={false}
        setUpdate={setUpdateSpy}
      />
    );
    expect(
      screen.queryByRole("textbox", { name: /editor\.install\.field\.folder/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", {
        name: /editor\.install\.field\.description/i,
      })
    ).not.toBeInTheDocument();
  });

  it("初期値の確認:installが非nullの場合、テキストボックスが初期値付きで表示される。_falseのためdisabled", () => {
    render(
      <InstallTextPanel
        rootDir="/root/"
        install={install}
        setInstall={setInstallSpy}
        zipFileName="dummy.zip"
        update={false}
        setUpdate={setUpdateSpy}
      />
    );
    const folderField = screen.getByRole("textbox", {
      name: /editor\.install\.field\.folder/i,
    });
    const descriptionField = screen.getByRole("textbox", {
      name: /editor\.install\.field\.description/i,
    });
    expect(folderField).toHaveValue("root");
    expect(descriptionField).toHaveValue("hogehoge");
    expect(folderField).toHaveAttribute("disabled");
    expect(descriptionField).toHaveAttribute("disabled");
  });

  it("初期値の確認:installが非nullの場合、テキストボックスが初期値付きで表示される。_trueのためdisabledではない", () => {
    render(
      <InstallTextPanel
        rootDir="/root/"
        install={install}
        setInstall={setInstallSpy}
        zipFileName="dummy.zip"
        update={true}
        setUpdate={setUpdateSpy}
      />
    );
    const folderField = screen.getByRole("textbox", {
      name: /editor\.install\.field\.folder/i,
    });
    const descriptionField = screen.getByRole("textbox", {
      name: /editor\.install\.field\.description/i,
    });
    expect(folderField).toHaveValue("root");
    expect(descriptionField).toHaveValue("hogehoge");
    expect(folderField).not.toHaveAttribute("disabled");
    expect(descriptionField).not.toHaveAttribute("disabled");
  });

  it("checkboxの動作:クリックするとsetUpdateが呼ばれる_true", () => {
    render(
      <InstallTextPanel
        rootDir="/root/"
        install={install}
        setInstall={setInstallSpy}
        zipFileName="dummy.zip"
        update={false}
        setUpdate={setUpdateSpy}
      />
    );
    const checkbox = screen.getByRole("checkbox", {
      name: /editor\.install\.check/i,
    });
    fireEvent.click(checkbox);
    expect(setUpdateSpy).toHaveBeenCalledWith(true);
  });

  it("checkboxの動作:クリックするとsetUpdateが呼ばれる_false", () => {
    render(
      <InstallTextPanel
        rootDir="/root/"
        install={install}
        setInstall={setInstallSpy}
        zipFileName="dummy.zip"
        update={true}
        setUpdate={setUpdateSpy}
      />
    );
    const checkbox = screen.getByRole("checkbox", {
      name: /editor\.install\.check/i,
    });
    fireEvent.click(checkbox);
    expect(setUpdateSpy).toHaveBeenCalledWith(false);
  });

  it("checkboxの動作:クリックするとsetUpdateが呼ばれる_true_installがnullかつrootが有", () => {
    render(
      <InstallTextPanel
        rootDir="/root/"
        install={null}
        setInstall={setInstallSpy}
        zipFileName="dummy.zip"
        update={false}
        setUpdate={setUpdateSpy}
      />
    );
    const checkbox = screen.getByRole("checkbox", {
      name: /editor\.install\.check/i,
    });
    fireEvent.click(checkbox);
    expect(setUpdateSpy).toHaveBeenCalledWith(true);
    expect(setInstallSpy).toHaveBeenCalled();
    expect(setInstallSpy.mock.calls.length).toBe(1)
    const argsInstall = setInstallSpy.mock.calls[0][0] as InstallTxt;
    expect(argsInstall.folder).toBe("/root/")
    expect(argsInstall.contentsDir).toBe("/root/")
    expect(argsInstall.description).toBe(undefined)
  });

  it("checkboxの動作:クリックするとsetUpdateが呼ばれる_true_installがnullかつrootが空文字列", () => {
    render(
      <InstallTextPanel
        rootDir=""
        install={null}
        setInstall={setInstallSpy}
        zipFileName="dummy.zip"
        update={false}
        setUpdate={setUpdateSpy}
      />
    );
    const checkbox = screen.getByRole("checkbox", {
      name: /editor\.install\.check/i,
    });
    fireEvent.click(checkbox);
    expect(setUpdateSpy).toHaveBeenCalledWith(true);
    expect(setInstallSpy).toHaveBeenCalled();
    expect(setInstallSpy.mock.calls.length).toBe(1)
    const argsInstall = setInstallSpy.mock.calls[0][0] as InstallTxt;
    expect(argsInstall.folder).toBe("dummy")
    expect(argsInstall.contentsDir).toBe("dummy")
    expect(argsInstall.description).toBe(undefined)
  });

  it("folderの変更", async() => {
    render(
      <InstallTextPanel
        rootDir=""
        install={install}
        setInstall={setInstallSpy}
        zipFileName="dummy.zip"
        update={true}
        setUpdate={setUpdateSpy}
      />
    );
    const user = userEvent.setup();
    const folderField = screen.getByRole("textbox", {
      name: /editor\.install\.field\.folder/i,
    });
    await user.type(folderField, "a");
    expect(setInstallSpy).toHaveBeenCalled();
    expect(setInstallSpy.mock.calls.length).toBe(1)
    const argsInstall = setInstallSpy.mock.calls[0][0] as InstallTxt;
    expect(argsInstall.folder).toBe("roota")
    expect(argsInstall.contentsDir).toBe("contents")
    expect(argsInstall.description).toBe("hogehoge")
  });

  it("descriptionの変更", async() => {
    render(
      <InstallTextPanel
        rootDir=""
        install={install}
        setInstall={setInstallSpy}
        zipFileName="dummy.zip"
        update={true}
        setUpdate={setUpdateSpy}
      />
    );
    const user = userEvent.setup();
    const descriptionField = screen.getByRole("textbox", {
      name: /editor\.install\.field\.description/i,
    });
    await user.type(descriptionField, "a");
    expect(setInstallSpy).toHaveBeenCalled();
    expect(setInstallSpy.mock.calls.length).toBe(1)
    const argsInstall = setInstallSpy.mock.calls[0][0] as InstallTxt;
    expect(argsInstall.folder).toBe("root")
    expect(argsInstall.contentsDir).toBe("contents")
    expect(argsInstall.description).toBe("hogehogea")
  });
});
