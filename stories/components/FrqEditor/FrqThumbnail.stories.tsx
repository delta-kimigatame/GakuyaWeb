import type { Meta, StoryObj } from '@storybook/react';
import { FrqThumbnail } from '../../../src/components/FrqEditor/FrqThumbnail';
import { Frq } from '../../../src/lib/UtauFrq';

const meta = {
  title: 'Components/FrqEditor/FrqThumbnail',
  component: FrqThumbnail,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FrqThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

// テスト用のFrqデータを作成
function createMockFrq(): Frq {
  const length = 200;
  const freqData = new Float64Array(length);
  const ampData = new Float64Array(length);
  
  // 周波数データ: 100Hz～500Hzで波形
  for (let i = 0; i < length; i++) {
    const t = i / length;
    freqData[i] = 300 + 200 * Math.sin(t * Math.PI * 4);
  }
  
  // 音量データ: 0.1～0.8で変動
  for (let i = 0; i < length; i++) {
    const t = i / length;
    ampData[i] = 0.3 + 0.3 * Math.sin(t * Math.PI * 2);
  }
  
  return new Frq({
    frq: freqData,
    amp: ampData,
    perSamples: 256,
  });
}

/**
 * 通常表示（ライトモード）
 */
export const Default: Story = {
  args: {
    wavFileName: 'あ.wav',
    frqData: createMockFrq(),
    width: 400,
    height: 150,
    mode: 'light',
    isGenerating: false,
    onClick: () => console.log('Thumbnail clicked'),
  },
};

/**
 * ダークモード
 */
export const DarkMode: Story = {
  args: {
    ...Default.args,
    mode: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * 生成中状態
 */
export const Generating: Story = {
  args: {
    wavFileName: 'い.wav',
    frqData: null,
    width: 400,
    height: 150,
    mode: 'light',
    isGenerating: true,
    onClick: () => console.log('Thumbnail clicked'),
  },
};

/**
 * 生成中状態（ダークモード）
 */
export const GeneratingDark: Story = {
  args: {
    ...Generating.args,
    mode: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * 周波数表なし
 */
export const NoFrq: Story = {
  args: {
    wavFileName: 'う.wav',
    frqData: null,
    width: 400,
    height: 150,
    mode: 'light',
    isGenerating: false,
    onClick: () => console.log('Thumbnail clicked'),
  },
};

/**
 * 小さいサイズ
 */
export const Small: Story = {
  args: {
    ...Default.args,
    width: 300,
    height: 80,
  },
};

/**
 * 大きいサイズ
 */
export const Large: Story = {
  args: {
    ...Default.args,
    width: 600,
    height: 250,
  },
};

/**
 * 複雑な波形データ
 */
export const ComplexWaveform: Story = {
  args: {
    wavFileName: 'か.wav',
    frqData: (() => {
      const length = 300;
      const freqData = new Float64Array(length);
      const ampData = new Float64Array(length);
      
      for (let i = 0; i < length; i++) {
        const t = i / length;
        // 複雑な周波数変動（55Hz～880Hzの範囲）
        freqData[i] = t < 0.5 
          ? 100 + 200 * Math.sin(t * Math.PI * 8)
          : 400 + 300 * Math.cos((t - 0.5) * Math.PI * 6);
        
        // ランダムな音量変動
        ampData[i] = 0.2 + 0.5 * Math.random();
      }
      
      return new Frq({
        frq: freqData,
        amp: ampData,
        perSamples: 256,
      });
    })(),
    width: 500,
    height: 180,
    mode: 'light',
    isGenerating: false,
    onClick: () => console.log('Complex waveform clicked'),
  },
};

/**
 * 0Hzを含む波形
 */
export const WithZeroFreq: Story = {
  args: {
    wavFileName: 'ん.wav',
    frqData: (() => {
      const length = 150;
      const freqData = new Float64Array(length);
      const ampData = new Float64Array(length);
      
      for (let i = 0; i < length; i++) {
        // 時々0Hzになる（無音部分）
        if (i % 20 < 5) {
          freqData[i] = 0;
          ampData[i] = 0.1;
        } else {
          freqData[i] = 220 + 100 * Math.sin(i * 0.1);
          ampData[i] = 0.5 + 0.3 * Math.sin(i * 0.05);
        }
      }
      
      return new Frq({
        frq: freqData,
        amp: ampData,
        perSamples: 256,
      });
    })(),
    width: 400,
    height: 150,
    mode: 'light',
    isGenerating: false,
    onClick: () => console.log('Zero freq waveform clicked'),
  },
};
