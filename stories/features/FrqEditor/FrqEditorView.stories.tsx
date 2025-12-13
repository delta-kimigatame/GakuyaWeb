import type { Meta, StoryObj } from "@storybook/react";
import { FrqEditorView } from "../../../src/features/FrqEditor/FrqEditorView";
import { Frq } from "../../../src/lib/UtauFrq";
import { GenerateFrqWorkerPool } from "../../../src/services/workerPool";

const meta: Meta<typeof FrqEditorView> = {
  title: "Components/FrqEditor/FrqEditorView",
  component: FrqEditorView,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FrqEditorView>;

// テスト用のfrqデータ生成
const createTestFrq = (length: number = 200, pattern: string = "sine"): Frq => {
  const frq = new Float64Array(length);
  const amp = new Float64Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / length;
    
    // パターンに応じて周波数を設定
    switch (pattern) {
      case "sine":
        frq[i] = 400 + 200 * Math.sin(t * Math.PI * 4);
        break;
      case "rising":
        frq[i] = 200 + 600 * t;
        break;
      case "falling":
        frq[i] = 800 - 600 * t;
        break;
      case "vibrato":
        frq[i] = 440 + 50 * Math.sin(t * Math.PI * 20);
        break;
      default:
        frq[i] = 440;
    }

    // 音量: 包絡線
    const envelope = Math.sin(t * Math.PI);
    amp[i] = envelope * (0.3 + 0.7 * Math.sin(t * Math.PI * 8));
  }

  return new Frq({
    frq,
    amp,
    perSamples: 256,
    frqAverage: 440.0,
  });
};

// WorkerPoolのモック
const mockWorkerPool = new GenerateFrqWorkerPool(2);

export const LightMode: Story = {
  args: {
    wavFileName: "test_sample.wav",
    frq: createTestFrq(200, "sine"),
    workerPool: mockWorkerPool,
    mode: "light",
    onSave: (frq) => console.log("Save:", frq),
    onBack: () => console.log("Back"),
  },
};

export const DarkMode: Story = {
  args: {
    wavFileName: "test_sample.wav",
    frq: createTestFrq(200, "sine"),
    workerPool: mockWorkerPool,
    mode: "dark",
    onSave: (frq) => console.log("Save:", frq),
    onBack: () => console.log("Back"),
  },
};

export const RisingPitch: Story = {
  args: {
    wavFileName: "rising_pitch.wav",
    frq: createTestFrq(200, "rising"),
    workerPool: mockWorkerPool,
    mode: "light",
    onSave: (frq) => console.log("Save:", frq),
    onBack: () => console.log("Back"),
  },
};

export const FallingPitch: Story = {
  args: {
    wavFileName: "falling_pitch.wav",
    frq: createTestFrq(200, "falling"),
    workerPool: mockWorkerPool,
    mode: "light",
    onSave: (frq) => console.log("Save:", frq),
    onBack: () => console.log("Back"),
  },
};

export const Vibrato: Story = {
  args: {
    wavFileName: "vibrato.wav",
    frq: createTestFrq(200, "vibrato"),
    workerPool: mockWorkerPool,
    mode: "light",
    onSave: (frq) => console.log("Save:", frq),
    onBack: () => console.log("Back"),
  },
};

export const ManyDataPoints: Story = {
  args: {
    wavFileName: "long_sample.wav",
    frq: createTestFrq(500, "sine"),
    workerPool: mockWorkerPool,
    mode: "light",
    onSave: (frq) => console.log("Save:", frq),
    onBack: () => console.log("Back"),
  },
};

export const ShortData: Story = {
  args: {
    wavFileName: "short.wav",
    frq: createTestFrq(50, "sine"),
    workerPool: mockWorkerPool,
    mode: "light",
    onSave: (frq) => console.log("Save:", frq),
    onBack: () => console.log("Back"),
  },
};
