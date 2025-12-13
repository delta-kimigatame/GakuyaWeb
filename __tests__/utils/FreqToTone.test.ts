import { describe, it, expect } from 'vitest';
import {
  hzToTone,
  toneToHz,
  hzToCanvasY,
  canvasYToHz,
  toneToNoteName,
  noteNameToTone,
  getToneGridPositions,
} from '../../src/utils/FreqToTone';

describe('FreqToTone', () => {
  describe('hzToTone', () => {
    it('A0(55Hz)は0トーンを返す', () => {
      expect(hzToTone(55)).toBeCloseTo(0, 5);
    });

    it('A1(110Hz)は12トーンを返す', () => {
      expect(hzToTone(110)).toBeCloseTo(12, 5);
    });

    it('A5(880Hz)は48トーンを返す', () => {
      // A0(55Hz)からA5(880Hz)は4オクターブ = 48半音
      expect(hzToTone(880)).toBeCloseTo(48, 5);
    });

    it('0Hz以下は0を返す', () => {
      expect(hzToTone(0)).toBe(0);
      expect(hzToTone(-10)).toBe(0);
    });
  });

  describe('toneToHz', () => {
    it('0トーンはA0(55Hz)を返す', () => {
      expect(toneToHz(0)).toBeCloseTo(55, 2);
    });

    it('12トーンはA1(110Hz)を返す', () => {
      expect(toneToHz(12)).toBeCloseTo(110, 2);
    });

    it('48トーンはA4(440Hz)を返す', () => {
      // A0から4オクターブ上はA4
      expect(toneToHz(48)).toBeCloseTo(880, 2);
    });
  });

  describe('hzToTone <-> toneToHz の往復変換', () => {
    it('変換の往復で元の値に戻る', () => {
      const testFreqs = [55, 110, 220, 440, 880];
      for (const freq of testFreqs) {
        const tone = hzToTone(freq);
        const backToHz = toneToHz(tone);
        expect(backToHz).toBeCloseTo(freq, 2);
      }
    });
  });

  describe('hzToCanvasY', () => {
    it('最小Hz(55)はキャンバス最下部を返す', () => {
      const y = hzToCanvasY(55, 100, 55, 880);
      expect(y).toBeCloseTo(100, 1);
    });

    it('最大Hz(880)はキャンバス最上部を返す', () => {
      const y = hzToCanvasY(880, 100, 55, 880);
      expect(y).toBeCloseTo(0, 1);
    });

    it('中間値は適切な位置を返す', () => {
      const y = hzToCanvasY(220, 100, 55, 880); // A3は中間より少し上
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(100);
    });

    it('0Hz以下は最下部を返す', () => {
      const y = hzToCanvasY(0, 100, 55, 880);
      expect(y).toBe(100);
    });
  });

  describe('canvasYToHz', () => {
    it('Y=0(最上部)は最大Hzを返す', () => {
      const hz = canvasYToHz(0, 100, 55, 880);
      expect(hz).toBeCloseTo(880, 1);
    });

    it('Y=100(最下部)は最小Hzを返す', () => {
      const hz = canvasYToHz(100, 100, 55, 880);
      expect(hz).toBeCloseTo(55, 1);
    });
  });

  describe('toneToNoteName', () => {
    it('0トーンはA0を返す', () => {
      expect(toneToNoteName(0)).toBe('A0');
    });

    it('12トーンはA1を返す', () => {
      expect(toneToNoteName(12)).toBe('A1');
    });

    it('3トーンはC0を返す', () => {
      // A0から3半音上はC0(オクターブはまだ変わらない)
      expect(toneToNoteName(3)).toBe('C0');
    });

    it('1トーンはA#0を返す', () => {
      expect(toneToNoteName(1)).toBe('A#0');
    });

    it('48トーンはA4を返す', () => {
      // A0から48半音(4オクターブ)上
      expect(toneToNoteName(48)).toBe('A4');
    });
  });

  describe('noteNameToTone', () => {
    it('A0は0トーンを返す', () => {
      expect(noteNameToTone('A0')).toBe(0);
    });

    it('A1は12トーンを返す', () => {
      expect(noteNameToTone('A1')).toBe(12);
    });

    it('C0は3トーンを返す', () => {
      // A0から3半音上がC0
      expect(noteNameToTone('C0')).toBe(3);
    });

    it('C1は15トーンを返す', () => {
      // A0から1オクターブ+3半音がC1
      expect(noteNameToTone('C1')).toBe(15);
    });

    it('A#0は1トーンを返す', () => {
      expect(noteNameToTone('A#0')).toBe(1);
    });

    it('A4は48トーンを返す', () => {
      // A0から4オクターブ上
      expect(noteNameToTone('A4')).toBe(48);
    });

    it('無効な音名はnullを返す', () => {
      expect(noteNameToTone('Invalid')).toBeNull();
      expect(noteNameToTone('H0')).toBeNull();
      expect(noteNameToTone('A')).toBeNull();
    });
  });

  describe('getToneGridPositions', () => {
    it('12半音間隔で補助線位置を返す', () => {
      const positions = getToneGridPositions(0, 60, 12);
      expect(positions).toEqual([0, 12, 24, 36, 48, 60]);
    });

    it('6半音間隔で補助線位置を返す', () => {
      const positions = getToneGridPositions(0, 24, 6);
      expect(positions).toEqual([0, 6, 12, 18, 24]);
    });

    it('範囲外の開始値でも正しく計算する', () => {
      const positions = getToneGridPositions(5, 30, 12);
      expect(positions).toEqual([12, 24]);
    });

    it('範囲内に補助線がない場合は0を含む配列を返す', () => {
      const positions = getToneGridPositions(0, 5, 12);
      expect(positions).toEqual([0]); // 0は範囲内
    });
  });
});
