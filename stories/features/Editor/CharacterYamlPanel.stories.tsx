import type { Meta, StoryObj } from "@storybook/react";
import { CharacterYamlPanel } from "../../../src/features/Editor/CharacterYamlPanel";

const meta = {
  title: "Components/Editor/CharacterYamlPanel",
  component: CharacterYamlPanel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CharacterYamlPanel>;

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
    "portrait.png": {
      async: async (type: string) => {
        if (type === "arraybuffer") {
          return await loadImageAsArrayBuffer("/icons/gakuya.png");
        }
        return new ArrayBuffer(0);
      },
    } as any,
  };
};

export const Default: Story = {
  args: {
    rootDir: "",
    zipFiles: createMockZipFiles(),
    files: ["あ.wav", "い.wav", "う.wav", "portrait.png"],
    characterYaml: {
      text_file_encoding: "shift_jis",
      portrait: "portrait.png",
      portrait_opacity: 67,
      portrait_height: 0,
      voice: "音声提供者",
      default_phonemizer: "OpenUtau.Plugin.Builtin.JapanesePresampPhonemizer",
    },
    setCharacterYaml: () => {},
    update: true,
    setUpdate: () => {},
    setPortraitBuf: () => {},
  },
};

export const Empty: Story = {
  args: {
    rootDir: "",
    zipFiles: {},
    files: ["あ.wav", "い.wav", "う.wav"],
    characterYaml: {},
    setCharacterYaml: () => {},
    update: true,
    setUpdate: () => {},
    setPortraitBuf: () => {},
  },
};
