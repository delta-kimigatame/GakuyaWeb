import type { Meta, StoryObj } from "@storybook/react";
import { CharacterTxtPanel } from "../../../src/features/Editor/CharacterTxtPanel";
import { CharacterTxt } from "../../../src/lib/CharacterTxt";

const meta = {
  title: "Components/Editor/CharacterTxtPanel",
  component: CharacterTxtPanel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CharacterTxtPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// 実際の画像ファイルを読み込んでArrayBufferに変換
const loadImageAsArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  return await response.arrayBuffer();
};

// gakuya.pngを使用したモックZIPファイル
const createMockZipFiles = () => {
  return {
    "icon.bmp": {
      async: async (type: string) => {
        if (type === "arraybuffer") {
          return await loadImageAsArrayBuffer("/icons/gakuya.png");
        }
        return new ArrayBuffer(0);
      },
    } as any,
    "sample.wav": {
      async: () => Promise.resolve(new ArrayBuffer(0)),
    } as any,
  };
};

export const Default: Story = {
  args: {
    rootDir: "",
    zipFiles: createMockZipFiles(),
    files: ["あ.wav", "い.wav", "う.wav", "icon.bmp", "sample.wav"],
    zipFileName: "voicebank.zip",
    characterTxt: new CharacterTxt({
      name: "音源名",
      image: "icon.bmp",
      sample: "sample.wav",
      author: "作者名",
      web: "https://example.com",
      version: "単独音",
    }),
    setCharacterTxt: () => {},
    characterTxtUpdate: true,
    characterForceUpdate: false,
    setCharacterTxtUpdate: () => {},
    setIconBuf: () => {},
    setSampleBuf: () => {},
  },
};

export const Empty: Story = {
  args: {
    rootDir: "",
    zipFiles: {},
    files: ["あ.wav", "い.wav", "う.wav"],
    zipFileName: "voicebank.zip",
    characterTxt: new CharacterTxt({
      name: "新しい音源",
      image: "",
      sample: "",
      author: "",
      web: "",
      version: "",
    }),
    setCharacterTxt: () => {},
    characterTxtUpdate: true,
    characterForceUpdate: false,
    setCharacterTxtUpdate: () => {},
    setIconBuf: () => {},
    setSampleBuf: () => {},
  },
};
