import type { Meta, StoryObj } from "@storybook/react";
import { ReadMePanel } from "../../../src/components/Editor/ReadMePanel";

const meta = {
  title: "Components/Editor/ReadMePanel",
  component: ReadMePanel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ReadMePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleReadme = `■利用規約

この音源は、以下の規約に従ってご利用いただけます。

【許可されていること】
・個人・商用利用OK
・音声の加工OK
・キャラクターのイラスト・動画への使用OK

【禁止されていること】
・音源の再配布
・音源製作者への誹謗中傷
・公序良俗に反する使用

【クレジット表記】
・作品に使用する際は、クレジットに「音源名」を記載してください

【その他】
・利用規約は予告なく変更される場合があります
・本音源を使用したことによるトラブルについて、製作者は一切責任を負いません

■音源の説明

この音源は単独音タイプの音源です。
明るく元気な声が特徴です。

製作者：〇〇
連絡先：example@example.com`;

export const Default: Story = {
  args: {
    readme: sampleReadme,
    setReadme: () => {},
    update: true,
    setUpdate: () => {},
  },
};

export const Empty: Story = {
  args: {
    readme: "",
    setReadme: () => {},
    update: true,
    setUpdate: () => {},
  },
};
