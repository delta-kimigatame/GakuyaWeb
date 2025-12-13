/**
 * 周波数表一覧画面のストーリー
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FrqListView, ZipFiles } from '../../../src/features/FrqEditor/FrqListView';
import { Frq } from '../../../src/lib/UtauFrq';
import { GenerateFrqWorkerPool } from '../../../src/services/workerPool';

// モックworkerPoolを作成（実際には動作しない）
const mockWorkerPool = null;

/**
 * モックzipファイルを作成
 */
function createMockZipFiles(wavCount: number, withFrq: boolean = true): ZipFiles {
  const files: ZipFiles = {};

  for (let i = 0; i < wavCount; i++) {
    const wavName = `sample_${i.toString().padStart(3, '0')}.wav`;
    const frqName = `sample_${i.toString().padStart(3, '0')}_wav.frq`;

    // wavファイル（ダミー）
    files[wavName] = {
      async: async () => new ArrayBuffer(44100 * 2), // 1秒分のダミー
    };

    // frqファイル
    if (withFrq) {
      const frq = createMockFrq(i);
      files[frqName] = {
        async: async () => frq.Output(),
      };
    }
  }

  return files;
}

/**
 * モックfrqを作成
 */
function createMockFrq(seed: number): Frq {
  const length = 100;
  const freqData = new Array(length);
  const ampData = new Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / length;
    // seedによって波形を変える（100Hz～500Hz）
    freqData[i] = 300 + 200 * Math.sin(t * Math.PI * 4 + seed);
    ampData[i] = 0.5 + 0.3 * Math.cos(t * Math.PI * 2);
  }

  return new Frq({
    frq: Float64Array.from(freqData),
    amp: Float64Array.from(ampData),
  });
}

const meta: Meta<typeof FrqListView> = {
  title: 'Components/FrqEditor/FrqListView',
  component: FrqListView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FrqListView>;

/**
 * デフォルト状態（10ファイル、全てfrqあり）
 */
export const Default: Story = {
  args: {
    zipFiles: createMockZipFiles(10, true),
    workerPool: mockWorkerPool,
    mode: 'light',
    onFrqUpdate: (wavFileName, frq) => console.log('Update:', wavFileName, frq),
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
 * frq未生成状態（自動生成待ち）
 */
export const NoFrq: Story = {
  args: {
    zipFiles: createMockZipFiles(5, false),
    workerPool: mockWorkerPool,
    mode: 'light',
    onFrqUpdate: (wavFileName, frq) => console.log('Update:', wavFileName, frq),
  },
};

/**
 * 少数ファイル（ページネーションなし）
 */
export const FewFiles: Story = {
  args: {
    zipFiles: createMockZipFiles(3, true),
    workerPool: mockWorkerPool,
    mode: 'light',
  },
};

/**
 * 多数ファイル（ページネーションあり）
 */
export const ManyFiles: Story = {
  args: {
    zipFiles: createMockZipFiles(35, true),
    workerPool: mockWorkerPool,
    mode: 'light',
    itemsPerPage: 10,
  },
};

/**
 * 混在状態（frqあり/なし混在）
 */
export const MixedState: Story = {
  args: {
    zipFiles: (() => {
      const files = createMockZipFiles(10, false);
      // 偶数番号のみfrqを追加
      for (let i = 0; i < 10; i += 2) {
        const frqName = `sample_${i.toString().padStart(3, '0')}_wav.frq`;
        const frq = createMockFrq(i);
        files[frqName] = {
          async: async () => frq.Output(),
        };
      }
      return files;
    })(),
    workerPool: mockWorkerPool,
    mode: 'light',
    onFrqUpdate: (wavFileName, frq) => console.log('Update:', wavFileName, frq),
  },
};

/**
 * wavファイルなし
 */
export const NoWavFiles: Story = {
  args: {
    zipFiles: {},
    workerPool: mockWorkerPool,
    mode: 'light',
  },
};

/**
 * カスタムページサイズ
 */
export const CustomPageSize: Story = {
  args: {
    zipFiles: createMockZipFiles(25, true),
    workerPool: mockWorkerPool,
    mode: 'light',
    itemsPerPage: 5,
  },
};
