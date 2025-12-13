/**
 * 周波数表一覧画面のストーリー（実データ使用）
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { FrqListView, ZipFiles } from '../../../src/features/FrqEditor/FrqListView';
import { GenerateFrqWorkerPool } from '../../../src/services/workerPool';

const meta: Meta<typeof FrqListView> = {
  title: 'Components/FrqEditor/FrqListView-RealData',
  component: FrqListView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FrqListView>;

/**
 * 実データを読み込むラッパーコンポーネント
 */
function FrqListViewWithRealData({ mode }: { mode: 'light' | 'dark' }) {
  const [zipFiles, setZipFiles] = useState<ZipFiles | null>(null);
  const [workerPool, setWorkerPool] = useState<GenerateFrqWorkerPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // workerPool初期化
  useEffect(() => {
    const pool = new GenerateFrqWorkerPool(8);
    setWorkerPool(pool);

    return () => {
      pool.clearTasks();
    };
  }, []);

  // frq更新ハンドラ：生成されたfrqをzipFilesに追加
  const handleFrqUpdate = (wavFileName: string, frq: any) => {
    console.log('Update:', wavFileName, frq);
    if (!zipFiles) return;

    // frqファイル名を生成（a.wav → a_wav.frq）
    const frqFileName = wavFileName.replace(/\.wav$/i, '_wav.frq');
    const frqBuffer = frq.Output();

    // zipFilesに追加
    setZipFiles((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [frqFileName]: {
          async: async (type: 'arraybuffer' | 'string' | 'blob') => {
            if (type === 'arraybuffer') {
              return frqBuffer;
            }
            throw new Error(`Unsupported type: ${type}`);
          },
        },
      };
    });
  };

  useEffect(() => {
    const loadZip = async () => {
      try {
        setLoading(true);
        setError(null);

        // samples/sjis_CV_jp.zipを読み込み（Shift_JISエンコーディング）
        const response = await fetch('/samples/sjis_CV_jp.zip');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const zip = new JSZip();
        const td = new TextDecoder('Shift_JIS');
        
        await zip.loadAsync(arrayBuffer, {
          decodeFileName: (fileNameBinary) => td.decode(fileNameBinary as Uint8Array),
        });

        // ZipFiles形式に変換
        const files: ZipFiles = {};
        zip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            files[relativePath] = zipEntry;
          }
        });

        setZipFiles(files);
        console.log('Loaded zip files:', Object.keys(files));
      } catch (err) {
        console.error('Failed to load zip:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadZip();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading sjis_CV_jp.zip...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error loading zip: {error}
      </div>
    );
  }

  if (!zipFiles) {
    return (
      <div style={{ padding: '20px' }}>
        No zip files loaded
      </div>
    );
  }

  return (
    <FrqListView
      zipFiles={zipFiles}
      workerPool={workerPool}
      mode={mode}
      onFrqUpdate={handleFrqUpdate}
    />
  );
}

/**
 * 実データ使用（ライトモード）
 */
export const RealDataLight: Story = {
  render: () => <FrqListViewWithRealData mode="light" />,
  parameters: {
    docs: {
      description: {
        story: 'samples/sjis_CV_jp.zipの実データを使用した動作確認用ストーリー。wavファイルが存在すればサムネイル表示、frqがなければ生成ボタンとして機能します。',
      },
    },
  },
};

/**
 * 実データ使用（ダークモード）
 */
export const RealDataDark: Story = {
  render: () => <FrqListViewWithRealData mode="dark" />,
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'ダークモードでの実データ表示。',
      },
    },
  },
};

/**
 * 実データ使用（ページサイズ5）
 */
export const RealDataSmallPage: Story = {
  render: () => {
    const [zipFiles, setZipFiles] = useState<ZipFiles | null>(null);
    const [workerPool, setWorkerPool] = useState<GenerateFrqWorkerPool | null>(null);
    const [loading, setLoading] = useState(true);

    // workerPool初期化
    useEffect(() => {
      const pool = new GenerateFrqWorkerPool(2);
      setWorkerPool(pool);

      return () => {
        pool.clearTasks();
      };
    }, []);

    // frq更新ハンドラ
    const handleFrqUpdate = (wavFileName: string, frq: any) => {
      console.log('Update:', wavFileName, frq);
      if (!zipFiles) return;

      const frqFileName = wavFileName.replace(/\.wav$/i, '_wav.frq');
      const frqBuffer = frq.Output();

      setZipFiles((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [frqFileName]: {
            async: async (type: 'arraybuffer' | 'string' | 'blob') => {
              if (type === 'arraybuffer') {
                return frqBuffer;
              }
              throw new Error(`Unsupported type: ${type}`);
            },
          },
        };
      });
    };

    useEffect(() => {
      const loadZip = async () => {
        try {
          const response = await fetch('/samples/sjis_CV_jp.zip');
          const arrayBuffer = await response.arrayBuffer();
          const zip = new JSZip();
          const td = new TextDecoder('Shift_JIS');
          
          await zip.loadAsync(arrayBuffer, {
            decodeFileName: (fileNameBinary) => td.decode(fileNameBinary as Uint8Array),
          });

          const files: ZipFiles = {};
          zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
              files[relativePath] = zipEntry;
            }
          });

          setZipFiles(files);
        } catch (err) {
          console.error('Failed to load zip:', err);
        } finally {
          setLoading(false);
        }
      };

      loadZip();
    }, []);

    if (loading || !zipFiles) {
      return <div style={{ padding: '20px' }}>Loading...</div>;
    }

    return (
      <FrqListView
        zipFiles={zipFiles}
        workerPool={workerPool}
        mode="light"
        itemsPerPage={5}
        onFrqUpdate={handleFrqUpdate}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'ページあたり5件表示に設定。ページネーション動作の確認用。',
      },
    },
  },
};

/**
 * frq生成テスト（frqファイルを除外）
 */
export const GenerateFrqTest: Story = {
  render: () => {
    const [zipFiles, setZipFiles] = useState<ZipFiles | null>(null);
    const [workerPool, setWorkerPool] = useState<GenerateFrqWorkerPool | null>(null);
    const [loading, setLoading] = useState(true);

    // workerPool初期化
    useEffect(() => {
      const pool = new GenerateFrqWorkerPool(2);
      setWorkerPool(pool);

      return () => {
        pool.clearTasks();
      };
    }, []);

    // frq更新ハンドラ
    const handleFrqUpdate = (wavFileName: string, frq: any) => {
      console.log('Generated frq for:', wavFileName);
      console.log('Frq data length:', frq.frq.length);
      if (!zipFiles) return;

      const frqFileName = wavFileName.replace(/\.wav$/i, '_wav.frq');
      const frqBuffer = frq.Output();

      setZipFiles((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [frqFileName]: {
            async: async (type: 'arraybuffer' | 'string' | 'blob') => {
              if (type === 'arraybuffer') {
                return frqBuffer;
              }
              throw new Error(`Unsupported type: ${type}`);
            },
          },
        };
      });
    };

    useEffect(() => {
      const loadZip = async () => {
        try {
          const response = await fetch('/samples/sjis_CV_jp.zip');
          const arrayBuffer = await response.arrayBuffer();
          const zip = new JSZip();
          const td = new TextDecoder('Shift_JIS');
          
          await zip.loadAsync(arrayBuffer, {
            decodeFileName: (fileNameBinary) => td.decode(fileNameBinary as Uint8Array),
          });

          // frqファイルを除外した新しいZipFilesオブジェクトを作成
          const files: ZipFiles = {};
          zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir && !relativePath.toLowerCase().endsWith('.frq')) {
              files[relativePath] = zipEntry;
            }
          });

          console.log('Loaded files (excluding .frq):', Object.keys(files));
          setZipFiles(files);
        } catch (err) {
          console.error('Failed to load zip:', err);
        } finally {
          setLoading(false);
        }
      };

      loadZip();
    }, []);

    if (loading || !zipFiles) {
      return <div style={{ padding: '20px' }}>Loading...</div>;
    }

    return (
      <FrqListView
        zipFiles={zipFiles}
        workerPool={workerPool}
        mode="light"
        itemsPerPage={10}
        onFrqUpdate={handleFrqUpdate}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'frqファイルを除外して読み込み、frq生成機能の動作を確認。各wavファイルのサムネイルをクリックすると周波数表が生成されます。',
      },
    },
  },
};

/**
 * frq生成テスト（ダークモード）
 */
export const GenerateFrqTestDark: Story = {
  render: () => {
    const [zipFiles, setZipFiles] = useState<ZipFiles | null>(null);
    const [workerPool, setWorkerPool] = useState<GenerateFrqWorkerPool | null>(null);
    const [loading, setLoading] = useState(true);

    // workerPool初期化
    useEffect(() => {
      const pool = new GenerateFrqWorkerPool(2);
      setWorkerPool(pool);

      return () => {
        pool.clearTasks();
      };
    }, []);

    // frq更新ハンドラ
    const handleFrqUpdate = (wavFileName: string, frq: any) => {
      console.log('Generated frq for:', wavFileName);
      console.log('Frq data length:', frq.frq.length);
      if (!zipFiles) return;

      const frqFileName = wavFileName.replace(/\.wav$/i, '_wav.frq');
      const frqBuffer = frq.Output();

      setZipFiles((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [frqFileName]: {
            async: async (type: 'arraybuffer' | 'string' | 'blob') => {
              if (type === 'arraybuffer') {
                return frqBuffer;
              }
              throw new Error(`Unsupported type: ${type}`);
            },
          },
        };
      });
    };

    useEffect(() => {
      const loadZip = async () => {
        try {
          const response = await fetch('/samples/sjis_CV_jp.zip');
          const arrayBuffer = await response.arrayBuffer();
          const zip = new JSZip();
          const td = new TextDecoder('Shift_JIS');
          
          await zip.loadAsync(arrayBuffer, {
            decodeFileName: (fileNameBinary) => td.decode(fileNameBinary as Uint8Array),
          });

          // frqファイルを除外
          const files: ZipFiles = {};
          zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir && !relativePath.toLowerCase().endsWith('.frq')) {
              files[relativePath] = zipEntry;
            }
          });

          setZipFiles(files);
        } catch (err) {
          console.error('Failed to load zip:', err);
        } finally {
          setLoading(false);
        }
      };

      loadZip();
    }, []);

    if (loading || !zipFiles) {
      return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>;
    }

    return (
      <FrqListView
        zipFiles={zipFiles}
        workerPool={workerPool}
        mode="dark"
        itemsPerPage={10}
        onFrqUpdate={handleFrqUpdate}
      />
    );
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'ダークモードでのfrq生成テスト。',
      },
    },
  },
};
