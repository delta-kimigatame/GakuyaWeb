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
