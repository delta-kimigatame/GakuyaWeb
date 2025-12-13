/**
 * UTAU標準の周波数表(.frq)ファイルを扱います。
 * 周波数表は下記の仕様を持つバイナリデータです。
 *  0 ～  7Byte "FREQ0003"
 *  8 ～ 11Byte 何サンプリング毎に基準周波数を求めるかの数値。通常は256。リトルエンディアン
 * 12 ～ 19Byte Float64型で平均周波数
 * 20 ～ 35Byte frqを作成した処理系の名前。もしくは0
 * 36 ～ 39Byte 何点分のデータか? リトルエンディアン
 * 以降 1点毎に16Byte 周波数をFlat64、音量をFloat64
 */

/** 音量の移動平均を取るフレーム数（前後各方向のフレーム数×2+自分自身） */
const AMP_MOVING_AVERAGE_WINDOW = 11;

/** 無音判定の閾値（ampがこの値以下の場合、無音とみなす） */
const AMP_SILENCE_THRESHOLD = 0.01;

/** 周波数自動修正の倍率判定用の閾値設定（各処理で100%に近づける原則） */
const FREQ_CORRECTION_THRESHOLDS = {
  // 1/4倍: 400%付近 (350-450% → 87.5-112.5%)
  div4Min: 350,
  div4Max: 450,
  
  // 1/3倍: 300%付近 (267-333% → 89-111%)
  div3Min: 267,
  div3Max: 333,
  
  // 1/2倍: 200%付近 (175-225% → 87.5-112.5%)
  div2Min: 175,
  div2Max: 225,
  
  // 2/3倍: 150%付近 (140-160% → 93-107%)
  // 150%×2/3=100%
  mul2div3Min: 140,
  mul2div3Max: 160,
  
  // 3/2倍: 67%付近 (62-72% → 93-108%)
  // 67%×3/2=100%
  mul3div2Min: 62,
  mul3div2Max: 72,
  
  // 2倍: 50%付近 (44-62% → 88-124%)
  mul2Min: 44,
  mul2Max: 62,
  
  // 3倍: 33.3%付近 (29-44% → 87-132%)
  mul3Min: 29,
  mul3Max: 44,
  
  // 4倍: 25%付近 (21-29% → 84-116%)
  mul4Min: 21,
  mul4Max: 29,
};

/**
 * UTAU標準の周波数表(.frq)ファイルを扱います。
 */
export class Frq {
  /** 何サンプル毎の基準周波数を扱うか */
  perSamples: number = 256;
  /** 平均周波数 */
  frqAverage: number = 0;
  /** 周波数列 */
  private frq_: Array<number> = [];
  /** 音量 */
  private amp_: Array<number> = [];

  /** 周波数列 */
  get frq(): Float64Array {
    return Float64Array.from(this.frq_);
  }

  /** 音量 */
  get amp(): Float64Array {
    return Float64Array.from(this.amp_);
  }

  /**
   * @param data frqのバイナリデータ
   */
  constructor(data: FrqRequire) {
    if (data.buf !== undefined) {
      this.LoadBinary(data.buf);
    } else if (data.frq === undefined) {
      throw new Error("bufもしくはfrqのどちらかが必要です。");
    } else if (data.amp !== undefined) {
      if (data.perSamples !== undefined) {
        this.perSamples = data.perSamples;
      }
      if (data.frqAverage !== undefined) {
        this.frqAverage = data.frqAverage;
      }
      this.frq_ = Array.from(data.frq);
      this.amp_ = Array.from(data.amp);
    } else if (data.data !== undefined) {
      if (data.perSamples !== undefined) {
        this.perSamples = data.perSamples;
      }
      if (data.frqAverage !== undefined) {
        this.frqAverage = data.frqAverage;
      }
      this.frq_ = Array.from(data.frq);
      this.amp_ = new Array<number>();
      for (let i = 0; i < this.frq_.length; i++) {
        const start = this.perSamples * i;
        const end = this.perSamples * (i + 1);
        // データ範囲外の場合は0を設定
        if (start >= data.data.length) {
          this.amp_.push(0);
        } else {
          const sliceEnd = Math.min(end, data.data.length);
          const segment = data.data.slice(start, sliceEnd);
          this.amp_.push(this.GetAmp(segment));
        }
      }
      this.applyMovingAverageToAmp(AMP_MOVING_AVERAGE_WINDOW);
    } else {
      throw new Error("dataもしくはampのどちらかが必要です。");
    }
  }

  /**
   * バイナリデータからfrqを読み込みます
   * @param data frqのバイナリデータ
   */
  private LoadBinary(data: ArrayBuffer) {
    const td = new TextDecoder();
    const dv = new DataView(data);
    if (data.byteLength < 56) {
      throw new RangeError(
        "このデータはfrqファイルではありません。ファイルサイズが小さすぎます。"
      );
    } else if (td.decode(data.slice(0, 4)) !== "FREQ") {
      throw new Error(
        "このデータはfrqファイルではありません。FREQ識別子がありません。"
      );
    }
    this.perSamples = dv.getUint16(8, true);
    this.frqAverage = dv.getFloat64(12, true);
    const dataCount = dv.getUint16(36, true);
    for (let i = 0; i < dataCount; i++) {
      this.frq_.push(dv.getFloat64(40 + 16 * i, true));
      this.amp_.push(dv.getFloat64(40 + 8 + 16 * i, true));
    }
  }

  /**
   * wavの波形データから音量を求めます
   * @param data perSamples分の波形データ
   * @returns 波形データの絶対値の平均値
   */
  private GetAmp(data: Float64Array): number {
    if (data.length === 0) {
      return 0; // 空の配列の場合は0を返す
    }
    let temp: number = 0;
    for (let i = 0; i < data.length; i++) {
      temp += Math.abs(data[i]);
    }
    return temp / data.length;
  }

  /**
   * 音量配列に移動平均を適用します
   * @param windowSize 移動平均の窓サイズ（奇数を推奨）
   * 例: windowSize=5 の場合、前2フレーム + 自分自身 + 後2フレームの5フレームで平均を取る
   */
  private applyMovingAverageToAmp(windowSize: number): void {
    if (this.amp_.length === 0 || windowSize < 1) {
      return;
    }

    const halfWindow = Math.floor(windowSize / 2);
    const originalAmp = [...this.amp_];

    for (let i = 0; i < this.amp_.length; i++) {
      let sum = 0;
      let count = 0;

      // 移動平均の範囲を計算（配列の範囲内に制限）
      const startIdx = Math.max(0, i - halfWindow);
      const endIdx = Math.min(this.amp_.length - 1, i + halfWindow);

      for (let j = startIdx; j <= endIdx; j++) {
        sum += originalAmp[j];
        count++;
      }

      this.amp_[i] = sum / count;
    }
  }

  /**
   * this.frq_のデータを使って平均周波数を求めます。ただし0の点は無視します。
   */
  CalcAverageFrq() {
    let count: number = 0;
    let sum: number = 0;
    for (let i = 0; i < this.frq_.length; i++) {
      if (this.frq_[i] !== 0) {
        count++;
        sum += this.frq_[i];
      }
    }
    this.frqAverage = sum / count;
  }

  /**
   * Frqファイルを出力する。
   * @returns frqファイルのバイナリ
   */
  Output(): ArrayBuffer {
    const header = new ArrayBuffer(40);
    const dvHeader = new DataView(header);
    dvHeader.setUint8(0, "F".charCodeAt(0));
    dvHeader.setUint8(1, "R".charCodeAt(0));
    dvHeader.setUint8(2, "E".charCodeAt(0));
    dvHeader.setUint8(3, "Q".charCodeAt(0));
    dvHeader.setUint8(4, "0".charCodeAt(0));
    dvHeader.setUint8(5, "0".charCodeAt(0));
    dvHeader.setUint8(6, "0".charCodeAt(0));
    dvHeader.setUint8(7, "3".charCodeAt(0));
    dvHeader.setUint32(8, this.perSamples, true);
    dvHeader.setFloat64(12, this.frqAverage, true);
    dvHeader.setUint32(36, this.frq_.length, true);
    const body = new ArrayBuffer(this.frq_.length * 16);
    const dvBody = new DataView(body);
    for (let i = 0; i < this.frq_.length; i++) {
      dvBody.setFloat64(i * 16, this.frq_[i], true);
      dvBody.setFloat64(i * 16 + 8, this.amp_[i], true);
    }
    const data = new Uint8Array(header.byteLength + body.byteLength);
    data.set(new Uint8Array(header), 0);
    data.set(new Uint8Array(body), 40);
    return data.buffer;
  }

  /**
   * 全体の平均周波数を取得(0Hzの点は除外)
   * @returns 平均周波数(Hz)
   */
  getAverageFreq(): number {
    let count = 0;
    let sum = 0;
    for (let i = 0; i < this.frq_.length; i++) {
      if (this.frq_[i] !== 0) {
        count++;
        sum += this.frq_[i];
      }
    }
    return count > 0 ? sum / count : 0;
  }

  /**
   * 指定範囲の平均周波数を取得(0Hzの点は除外)
   * @param startIdx 開始インデックス
   * @param endIdx 終了インデックス(含む)
   * @returns 平均周波数(Hz)
   */
  getAverageFreqInRange(startIdx: number, endIdx: number): number {
    let count = 0;
    let sum = 0;
    for (let i = startIdx; i <= endIdx && i < this.frq_.length; i++) {
      if (this.frq_[i] !== 0) {
        count++;
        sum += this.frq_[i];
      }
    }
    return count > 0 ? sum / count : 0;
  }

  /**
   * 指定インデックスの周波数を倍率変更
   * @param indices 対象インデックスの配列
   * @param factor 倍率
   */
  multiplyFreqInRange(indices: number[], factor: number): void {
    for (const idx of indices) {
      if (idx >= 0 && idx < this.frq_.length) {
        this.frq_[idx] *= factor;
      }
    }
  }

  /**
   * 指定インデックスの周波数を指定値に設定
   * @param indices 対象インデックスの配列
   * @param freq 設定する周波数(Hz)
   */
  setFreqInRange(indices: number[], freq: number): void {
    for (const idx of indices) {
      if (idx >= 0 && idx < this.frq_.length) {
        this.frq_[idx] = freq;
      }
    }
  }

  /**
   * 指定インデックス範囲の周波数を線形補完
   * 始点と終点の値を使って、間を線形的に補完する
   * @param indices 対象インデックスの配列(ソート済みを想定)
   */
  linearInterpolate(indices: number[]): void {
    if (indices.length < 2) return;
    
    const sortedIndices = [...indices].sort((a, b) => a - b);
    const startIdx = sortedIndices[0];
    const endIdx = sortedIndices[sortedIndices.length - 1];
    
    if (startIdx < 0 || endIdx >= this.frq_.length) return;
    
    const startFreq = this.frq_[startIdx];
    const endFreq = this.frq_[endIdx];
    const range = endIdx - startIdx;
    
    if (range === 0) return;
    
    for (let i = 1; i < sortedIndices.length - 1; i++) {
      const idx = sortedIndices[i];
      const ratio = (idx - startIdx) / range;
      this.frq_[idx] = startFreq + (endFreq - startFreq) * ratio;
    }
  }

  /**
   * 周波数データの長さを取得
   * @returns データポイント数
   */
  getLength(): number {
    return this.frq_.length;
  }

  /**
   * 指定インデックスの周波数を取得
   * @param index インデックス
   * @returns 周波数(Hz)、範囲外の場合は0
   */
  getFreqAt(index: number): number {
    return index >= 0 && index < this.frq_.length ? this.frq_[index] : 0;
  }

  /**
   * 指定インデックスの音量を取得
   * @param index インデックス
   * @returns 音量、範囲外の場合は0
   */
  getAmpAt(index: number): number {
    return index >= 0 && index < this.amp_.length ? this.amp_[index] : 0;
  }

  /**
   * 周波数データの自動修正を行います
   * - 無音部分の周波数を0にする
   * - オクターブ誤検出を修正（1/4, 1/3, 1/2, 2/3, 3/2, 2倍, 3倍, 4倍）
   * - 有音部分の周波数0を線形補間で補完
   */
  autoCorrectFrequency(): void {
    // 1. 無音判定：ampが閾値を下回る場合、frqを0にする
    for (let i = 0; i < this.frq_.length; i++) {
      if (this.amp_[i] <= AMP_SILENCE_THRESHOLD) {
        this.frq_[i] = 0;
      }
    }

    // 2. 平均周波数を再計算
    this.CalcAverageFrq();
    const avgFreq = this.frqAverage;

    if (avgFreq === 0 || !isFinite(avgFreq)) {
      return; // 平均周波数が0または無効な場合は処理を中断
    }

    // 3-8. オクターブ誤検出の修正
    // 倍率判定：100%に近づけることを目標として、各倍率で最適な閾値を設定
    // 処理順序：1/4倍 → 1/3倍 → 1/2倍 → 2/3倍 → 3/2倍 → 4倍 → 3倍 → 2倍
    
    for (let i = 0; i < this.frq_.length; i++) {
      if (this.frq_[i] === 0 || this.amp_[i] <= AMP_SILENCE_THRESHOLD) {
        continue;
      }

      const ratio = (this.frq_[i] / avgFreq) * 100; // パーセンテージ

      // 高周波側の修正（周波数が高すぎる → 割る）
      if (ratio >= FREQ_CORRECTION_THRESHOLDS.div4Min && ratio <= FREQ_CORRECTION_THRESHOLDS.div4Max) {
        // 350-450%: 1/4倍 → 87.5-112.5%
        this.frq_[i] /= 4;
      } else if (ratio >= FREQ_CORRECTION_THRESHOLDS.div3Min && ratio <= FREQ_CORRECTION_THRESHOLDS.div3Max) {
        // 267-333%: 1/3倍 → 89-111%
        this.frq_[i] /= 3;
      } else if (ratio >= FREQ_CORRECTION_THRESHOLDS.div2Min && ratio <= FREQ_CORRECTION_THRESHOLDS.div2Max) {
        // 175-225%: 1/2倍 → 87.5-112.5%
        this.frq_[i] /= 2;
      } else if (ratio >= FREQ_CORRECTION_THRESHOLDS.mul2div3Min && ratio <= FREQ_CORRECTION_THRESHOLDS.mul2div3Max) {
        // 140-160%: 2/3倍 → 93-107%
        this.frq_[i] *= 2 / 3;
      }
      // 低周波側の修正（周波数が低すぎる → 掛ける）
      else if (ratio >= FREQ_CORRECTION_THRESHOLDS.mul3div2Min && ratio <= FREQ_CORRECTION_THRESHOLDS.mul3div2Max) {
        // 62-72%: 3/2倍 → 93-108%
        this.frq_[i] *= 3 / 2;
      } else if (ratio >= FREQ_CORRECTION_THRESHOLDS.mul4Min && ratio < FREQ_CORRECTION_THRESHOLDS.mul4Max) {
        // 21-29%未満: 4倍 → 84-116%未満
        this.frq_[i] *= 4;
      } else if (ratio >= FREQ_CORRECTION_THRESHOLDS.mul3Min && ratio < FREQ_CORRECTION_THRESHOLDS.mul3Max) {
        // 29-44%未満: 3倍 → 87-132%未満
        this.frq_[i] *= 3;
      } else if (ratio >= FREQ_CORRECTION_THRESHOLDS.mul2Min && ratio < FREQ_CORRECTION_THRESHOLDS.mul2Max) {
        // 44-62%未満: 2倍 → 88-124%未満
        this.frq_[i] *= 2;
      }
    }

    // 9. 平均周波数を再計算
    this.CalcAverageFrq();

    // 10. 有音部分の周波数0を線形補間
    for (let i = 0; i < this.frq_.length; i++) {
      // 無音部分はスキップ
      if (this.amp_[i] <= AMP_SILENCE_THRESHOLD) {
        continue;
      }

      // 有音部分でfrqが0の場合、線形補間
      if (this.frq_[i] === 0) {
        // 直前の非0点を探す
        let prevIdx = -1;
        for (let j = i - 1; j >= 0; j--) {
          if (this.frq_[j] !== 0 && this.amp_[j] > AMP_SILENCE_THRESHOLD) {
            prevIdx = j;
            break;
          }
        }

        // 直後の非0点を探す
        let nextIdx = -1;
        for (let j = i + 1; j < this.frq_.length; j++) {
          if (this.frq_[j] !== 0 && this.amp_[j] > AMP_SILENCE_THRESHOLD) {
            nextIdx = j;
            break;
          }
        }

        // 両方見つかった場合のみ線形補間
        if (prevIdx !== -1 && nextIdx !== -1) {
          const prevFreq = this.frq_[prevIdx];
          const nextFreq = this.frq_[nextIdx];
          const range = nextIdx - prevIdx;
          const ratio = (i - prevIdx) / range;
          this.frq_[i] = prevFreq + (nextFreq - prevFreq) * ratio;
        } else if (prevIdx !== -1) {
          // 直前の値のみある場合は、その値を使用
          this.frq_[i] = this.frq_[prevIdx];
        } else if (nextIdx !== -1) {
          // 直後の値のみある場合は、その値を使用
          this.frq_[i] = this.frq_[nextIdx];
        }
      }
    }

    // 11. 最終的な平均周波数を再計算
    this.CalcAverageFrq();
  }
}

interface FrqRequire {
  /** 何サンプル毎の基準周波数を扱うか */
  perSamples?: number;
  /** 基本周波数列 */
  frq?: Float64Array;
  /** 音量列 */
  amp?: Float64Array;
  /** wavのデータ部。1を最大とする小数データ */
  data?: Float64Array;
  /** 平均周波数 */
  frqAverage?: number;
  /** バイナリデータ */
  buf?: ArrayBuffer;
}
