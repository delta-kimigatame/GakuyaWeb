/**
 * 周波数(Hz)とトーン(音階)の変換ユーティリティ
 * A0(55Hz)を基準として、12平均律に基づいた変換を行う
 */

/** A0の周波数(Hz) */
const A0_HZ = 27.5;

/** 1オクターブあたりの半音数 */
const SEMITONES_PER_OCTAVE = 12;

/** 音名とA0からの半音差のマッピング */
const NOTE_NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

/**
 * 周波数(Hz)をA0基準のトーン値(半音単位)に変換
 * @param hz 周波数(Hz)
 * @returns A0を0としたトーン値(半音単位)。0以下の場合は0を返す
 */
export function hzToTone(hz: number): number {
  if (hz <= 0) return 0;
  return SEMITONES_PER_OCTAVE * Math.log2(hz / A0_HZ);
}

/**
 * A0基準のトーン値(半音単位)を周波数(Hz)に変換
 * @param tone A0を0としたトーン値(半音単位)
 * @returns 周波数(Hz)
 */
export function toneToHz(tone: number): number {
  return A0_HZ * Math.pow(2, tone / SEMITONES_PER_OCTAVE);
}

/**
 * 周波数(Hz)をキャンバス座標のY位置に変換
 * @param hz 周波数(Hz)
 * @param canvasHeight キャンバスの高さ
 * @param minHz 最小周波数(デフォルト: A0 = 55Hz)
 * @param maxHz 最大周波数(デフォルト: A5 = 880Hz)
 * @returns キャンバス上のY座標(上端が0、下端がcanvasHeight)
 */
export function hzToCanvasY(
  hz: number,
  canvasHeight: number,
  minHz: number = 55,
  maxHz: number = 880
): number {
  if (hz <= 0) return canvasHeight; // 0Hz以下は最下部
  
  // 対数スケールでの変換
  const minTone = hzToTone(minHz);
  const maxTone = hzToTone(maxHz);
  const tone = hzToTone(hz);
  
  // トーン値を0-1の範囲に正規化し、Y座標に変換(上下反転)
  const normalized = (tone - minTone) / (maxTone - minTone);
  return canvasHeight * (1 - normalized);
}

/**
 * キャンバス座標のY位置を周波数(Hz)に変換
 * @param y キャンバス上のY座標
 * @param canvasHeight キャンバスの高さ
 * @param minHz 最小周波数(デフォルト: A0 = 55Hz)
 * @param maxHz 最大周波数(デフォルト: A5 = 880Hz)
 * @returns 周波数(Hz)
 */
export function canvasYToHz(
  y: number,
  canvasHeight: number,
  minHz: number = 55,
  maxHz: number = 880
): number {
  const minTone = hzToTone(minHz);
  const maxTone = hzToTone(maxHz);
  
  // Y座標を0-1の範囲に正規化(上下反転)
  const normalized = 1 - y / canvasHeight;
  const tone = minTone + normalized * (maxTone - minTone);
  
  return toneToHz(tone);
}

/**
 * トーン値を音名文字列に変換
 * @param tone A0を0としたトーン値(半音単位)
 * @returns 音名(例: "A0", "C#3", "G5")
 */
export function toneToNoteName(tone: number): string {
  const semitone = Math.round(tone);
  const noteIndex = ((semitone % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE;
  
  // A0から始まるので、C以降は次のオクターブ
  // A, A#, B (0-2) はオクターブ0
  // C, C#, D, D#, E, F, F#, G, G# (3-11) はオクターブ1
  // 次のA (12) はオクターブ1
  let octave = Math.floor(semitone / SEMITONES_PER_OCTAVE);
  if (noteIndex >= 3) { // C以降
    octave += 1;
  }
  
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * 音名文字列をトーン値に変換
 * @param noteName 音名(例: "A0", "C#3", "G5")
 * @returns A0を0としたトーン値(半音単位)。無効な音名の場合はnullを返す
 */
export function noteNameToTone(noteName: string): number | null {
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return null;
  
  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = NOTE_NAMES.indexOf(note);
  
  if (noteIndex === -1) return null;
  
  return octave * SEMITONES_PER_OCTAVE + noteIndex;
}

/**
 * 指定範囲内でトーン補助線を引くべき位置を計算
 * @param minTone 最小トーン値
 * @param maxTone 最大トーン値
 * @param step 補助線の間隔(半音単位、デフォルト: 12 = 1オクターブ)
 * @returns 補助線を引くべきトーン値の配列
 */
export function getToneGridPositions(
  minTone: number,
  maxTone: number,
  step: number = SEMITONES_PER_OCTAVE
): number[] {
  const positions: number[] = [];
  const startTone = Math.ceil(minTone / step) * step;
  
  for (let tone = startTone; tone <= maxTone; tone += step) {
    positions.push(tone);
  }
  
  return positions;
}
