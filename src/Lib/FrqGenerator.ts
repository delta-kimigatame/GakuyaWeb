/**
 * 周波数表生成ユーティリティ
 * wavデータからFrqオブジェクトを非同期生成する
 */

import { World } from 'tsworld';
import { Wave } from 'utauwav';
import { Frq } from './UtauFrq';
import { GenerateFrq } from './GenerateFrq';
import { Log } from './Logging';

export interface FrqGenerationProgress {
  /** 現在の進捗(0-1) */
  progress: number;
  /** 処理中のファイル名 */
  fileName: string;
  /** ステータスメッセージ */
  status: 'initializing' | 'analyzing' | 'completed' | 'error';
}

export type ProgressCallback = (progress: FrqGenerationProgress) => void;

/**
 * wavデータからFrqを生成(進捗コールバック付き)
 * @param wavBuffer wavファイルのArrayBuffer
 * @param fileName ファイル名(進捗表示用)
 * @param onProgress 進捗コールバック
 * @param sampleRate サンプリングレート(デフォルト: 44100)
 * @param perSamples 分析間隔(デフォルト: 256)
 * @returns 生成されたFrqオブジェクト
 */
export async function generateFrqFromWav(
  wavBuffer: ArrayBuffer,
  fileName: string,
  onProgress?: ProgressCallback,
  sampleRate: number = 44100,
  perSamples: number = 256
): Promise<Frq> {
  try {
    onProgress?.({
      progress: 0,
      fileName,
      status: 'initializing',
    });

    // utauWavでwavをデコード
    let wav: Wave;
    try {
      wav = new Wave(wavBuffer);
    } catch (error) {
      throw new Error(`wavファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }

    onProgress?.({
      progress: 0.3,
      fileName,
      status: 'analyzing',
    });

    // モノラル化とFloat64Array変換
    const normalizedData = wav.LogicalNormalize(1);
    if (!normalizedData) {
      throw new Error('wavデータの正規化に失敗しました');
    }
    const float64Data = Float64Array.from(normalizedData as Array<number>);

    onProgress?.({
      progress: 0.7,
      fileName,
      status: 'analyzing',
    });

    // World初期化（await必須）
    const world = new World();
    await world.Initialize();
    onProgress?.({
      progress: 0.8,
      fileName,
      status: 'analyzing',
    });

    // Frq生成
    const frq = GenerateFrq(world, float64Data, sampleRate, perSamples);

    if (!frq) {
      throw new Error('周波数表の生成に失敗しました');
    }

    onProgress?.({
      progress: 1.0,
      fileName,
      status: 'completed',
    });

    return frq;
  } catch (error) {
    onProgress?.({
      progress: 0,
      fileName,
      status: 'error',
    });
    Log.error(`${fileName}のfrq生成エラー: ${error instanceof Error ? error.message : String(error)}`, 'FrqGenerator.generateFrqFromWav');
    throw error;
  }
}

/**
 * 複数のwavファイルから一括でFrqを生成
 * @param wavFiles wavファイルのマップ { fileName: ArrayBuffer }
 * @param onProgress 進捗コールバック
 * @param concurrency 同時実行数(デフォルト: 3)
 * @returns 生成されたFrqオブジェクトのマップ { fileName: Frq }
 */
export async function generateFrqBatch(
  wavFiles: Map<string, ArrayBuffer>,
  onProgress?: ProgressCallback,
  concurrency: number = 3
): Promise<Map<string, Frq>> {
  const results = new Map<string, Frq>();
  const entries = Array.from(wavFiles.entries());
  const total = entries.length;
  let completed = 0;

  // 並列処理用のキュー
  const queue: Array<() => Promise<void>> = [];

  for (const [fileName, wavBuffer] of entries) {
    queue.push(async () => {
      try {
        const frq = await generateFrqFromWav(
          wavBuffer,
          fileName,
          (progress) => {
            // 個別ファイルの進捗を全体の進捗に変換
            const overallProgress = (completed + progress.progress) / total;
            onProgress?.({
              ...progress,
              progress: overallProgress,
            });
          }
        );
        results.set(fileName, frq);
        completed++;
      } catch (error) {
        Log.error(`${fileName}の周波数表生成に失敗: ${error}`, 'FrqGenerator.generateFrqBatch');
        // エラーがあっても続行
        completed++;
      }
    });
  }

  // 並列実行
  const running: Array<Promise<void>> = [];
  for (const task of queue) {
    const promise = task();
    running.push(promise);

    if (running.length >= concurrency) {
      await Promise.race(running);
      running.splice(
        running.findIndex((p) => p === promise),
        1
      );
    }
  }

  // 残りの処理を待つ
  await Promise.all(running);

  return results;
}
