/**
 * UTAUのアイコン用bitmapを作成する。
 * ヘッダ構造はファイルヘッダ(14バイト)、情報ヘッダ(40バイト)とする。
 */

const FILE_HEADER_SIZE = 14;
const INFO_HEADER_SIZE = 40;
export const OutputBitmap = (
  width: number = 100,
  height: number = 100,
  depth: number = 3,
  data: Array<{ r: number; g: number; b: number }>
): ArrayBuffer => {
  const fileHeader = new ArrayBuffer(FILE_HEADER_SIZE);
  const dvFileHeader = new DataView(fileHeader);
  /** BM固定 */
  dvFileHeader.setUint8(0, "B".charCodeAt(0));
  dvFileHeader.setUint8(1, "M".charCodeAt(0));
  /** ファイルサイズ */
  dvFileHeader.setUint32(
    3,
    width * height * depth + FILE_HEADER_SIZE + INFO_HEADER_SIZE,
    true
  );
  /** 00000000で固定 */
  dvFileHeader.setUint32(6, 0, true);
  /** ファイルの頭からデータ部までのバイト数 */
  dvFileHeader.setUint32(10, FILE_HEADER_SIZE + INFO_HEADER_SIZE, true);

  const infoHeader = new ArrayBuffer(INFO_HEADER_SIZE);
  const dvInfoHeader = new DataView(infoHeader);
  /** 情報ヘッダのバイト数 */
  dvInfoHeader.setUint32(0, INFO_HEADER_SIZE, true);
  /** ビットマップの横幅 */
  dvInfoHeader.setUint32(4, width, true);
  /** ビットマップの縦幅 */
  dvInfoHeader.setUint32(8, height, true);
  /** プレーン数。常に1 */
  dvInfoHeader.setUint16(12, 1, true);
  /** 1pixelあたりのビット数 */
  dvInfoHeader.setUint16(14, depth * 8, true);
  /** 圧縮形式 */
  dvInfoHeader.setUint32(16, 0, true);
  /** 画像部のバイト数 */
  dvInfoHeader.setUint32(20, width * height * depth, true);
  /** 横方向のpixel/m 350dpiの場合350(pixel/inch) / 2.54(cm/inch) * 100≒13779 */
  dvInfoHeader.setUint32(24, Math.floor((350 / 2.54) * 100), true);
  /** 縦方向のpixel/m 350dpiの場合350(pixel/inch) / 2.54(cm/inch) * 100≒13779 */
  dvInfoHeader.setUint32(28, Math.floor((350 / 2.54) * 100), true);
  /** 使用する色数。0で固定 */
  dvInfoHeader.setUint32(32, 0, true);
  /** 重要な色数。0で固定 */
  dvInfoHeader.setUint32(36, 0, true);

  const body = new ArrayBuffer(width * height * depth);
  const dvBody = new DataView(body);
  for (let i = 0; i < data.length; i++) {
    dvBody.setUint8(i * 3, data[i].b);
    dvBody.setUint8(i * 3 + 1, data[i].g);
    dvBody.setUint8(i * 3 + 2, data[i].r);
  }
  const output = new Uint8Array(
    width * height * depth + FILE_HEADER_SIZE + INFO_HEADER_SIZE
  );
  output.set(new Uint8Array(fileHeader), 0);
  output.set(new Uint8Array(infoHeader), FILE_HEADER_SIZE);
  output.set(new Uint8Array(body), FILE_HEADER_SIZE + INFO_HEADER_SIZE);
  return output.buffer;
};
