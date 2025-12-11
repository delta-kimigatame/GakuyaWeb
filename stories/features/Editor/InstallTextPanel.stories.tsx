import type { Meta, StoryObj } from "@storybook/react";
import { InstallTextPanel } from "../../../src/features/Editor/InstallTxtPanel";
import { InstallTxt } from "../../../src/lib/InstallTxt";
import React from "react";

const meta: Meta<typeof InstallTextPanel> = {
  title: "Components/Editor/InstallTextPanel",
  component: InstallTextPanel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof InstallTextPanel>;

/**
 * install.txtを作成する場合の標準的な状態です。
 * チェックボックスをオンにすると、folderとdescriptionの入力欄が有効になります。
 */
export const WithInstall: Story = {
  render: () => {
    const [install, setInstall] = React.useState<InstallTxt | null>(
      new InstallTxt({
        folder: "テスト音源",
        contentsDir: "テスト音源",
        description: "これはテスト用の音源です",
      })
    );
    const [update, setUpdate] = React.useState(true);

    return (
      <div style={{ width: "600px" }}>
        <InstallTextPanel
          rootDir="テスト音源"
          install={install}
          setInstall={setInstall}
          zipFileName="テスト音源.zip"
          update={update}
          setUpdate={setUpdate}
        />
      </div>
    );
  },
};

/**
 * install.txtを作成しない場合の状態です。
 * チェックボックスがオフの場合、入力欄は表示されません。
 */
export const WithoutInstall: Story = {
  render: () => {
    const [install, setInstall] = React.useState<InstallTxt | null>(null);
    const [update, setUpdate] = React.useState(false);

    return (
      <div style={{ width: "600px" }}>
        <InstallTextPanel
          rootDir="テスト音源"
          install={install}
          setInstall={setInstall}
          zipFileName="テスト音源.zip"
          update={update}
          setUpdate={setUpdate}
        />
      </div>
    );
  },
};

/**
 * チェックボックスはオンだが、入力欄が無効化されている状態です。
 * これは実際のアプリでは発生しませんが、参考として用意しました。
 */
export const Disabled: Story = {
  render: () => {
    const [install, setInstall] = React.useState<InstallTxt | null>(
      new InstallTxt({
        folder: "テスト音源",
        contentsDir: "テスト音源",
        description: "",
      })
    );
    const [update, setUpdate] = React.useState(false);

    return (
      <div style={{ width: "600px" }}>
        <InstallTextPanel
          rootDir="テスト音源"
          install={install}
          setInstall={setInstall}
          zipFileName="テスト音源.zip"
          update={update}
          setUpdate={setUpdate}
        />
      </div>
    );
  },
};
