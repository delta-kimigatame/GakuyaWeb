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
        this.amp_.push(
          this.GetAmp(
            data.data.slice(this.perSamples * i, this.perSamples * (i + 1))
          )
        );
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
    console.log(dataCount)
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
