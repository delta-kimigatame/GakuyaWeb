/**
 * ArraySelectionのテスト
 */

import { describe, it, expect } from 'vitest';
import {
  createEmptySelection,
  updateSelection,
  selectAll,
  clearSelection,
  selectRange,
  isSelected,
  getSelectionCount,
  getSelectedIndices,
  isSelectionEmpty,
} from '../../src/utils/ArraySelection';

describe('ArraySelection', () => {
  describe('createEmptySelection', () => {
    it('空の選択状態を作成', () => {
      const selection = createEmptySelection();
      expect(selection.selectedIndices.size).toBe(0);
      expect(selection.lastClickedIndex).toBeNull();
    });
  });

  describe('updateSelection', () => {
    it('通常クリック：単一選択', () => {
      const current = createEmptySelection();
      const result = updateSelection(current, 3, false, false, 10);

      expect(result.selectedIndices.size).toBe(1);
      expect(result.selectedIndices.has(3)).toBe(true);
      expect(result.lastClickedIndex).toBe(3);
    });

    it('通常クリック：前の選択を解除', () => {
      const current = { selectedIndices: new Set([1, 2]), lastClickedIndex: 2 };
      const result = updateSelection(current, 5, false, false, 10);

      expect(result.selectedIndices.size).toBe(1);
      expect(result.selectedIndices.has(5)).toBe(true);
      expect(result.selectedIndices.has(1)).toBe(false);
    });

    it('Ctrlクリック：追加選択', () => {
      const current = { selectedIndices: new Set([1, 2]), lastClickedIndex: 2 };
      const result = updateSelection(current, 5, true, false, 10);

      expect(result.selectedIndices.size).toBe(3);
      expect(result.selectedIndices.has(1)).toBe(true);
      expect(result.selectedIndices.has(2)).toBe(true);
      expect(result.selectedIndices.has(5)).toBe(true);
    });

    it('Ctrlクリック：トグル（選択解除）', () => {
      const current = { selectedIndices: new Set([1, 2, 5]), lastClickedIndex: 5 };
      const result = updateSelection(current, 2, true, false, 10);

      expect(result.selectedIndices.size).toBe(2);
      expect(result.selectedIndices.has(2)).toBe(false);
      expect(result.selectedIndices.has(1)).toBe(true);
      expect(result.selectedIndices.has(5)).toBe(true);
    });

    it('Shiftクリック：範囲選択（昇順）', () => {
      const current = { selectedIndices: new Set([2]), lastClickedIndex: 2 };
      const result = updateSelection(current, 5, false, true, 10);

      expect(result.selectedIndices.size).toBe(4);
      expect(result.selectedIndices.has(2)).toBe(true);
      expect(result.selectedIndices.has(3)).toBe(true);
      expect(result.selectedIndices.has(4)).toBe(true);
      expect(result.selectedIndices.has(5)).toBe(true);
    });

    it('Shiftクリック：範囲選択（降順）', () => {
      const current = { selectedIndices: new Set([5]), lastClickedIndex: 5 };
      const result = updateSelection(current, 2, false, true, 10);

      expect(result.selectedIndices.size).toBe(4);
      expect(result.selectedIndices.has(2)).toBe(true);
      expect(result.selectedIndices.has(3)).toBe(true);
      expect(result.selectedIndices.has(4)).toBe(true);
      expect(result.selectedIndices.has(5)).toBe(true);
    });

    it('Shiftクリック：lastClickedIndexがnullの場合は通常クリック', () => {
      const current = { selectedIndices: new Set<number>(), lastClickedIndex: null };
      const result = updateSelection(current, 3, false, true, 10);

      expect(result.selectedIndices.size).toBe(1);
      expect(result.selectedIndices.has(3)).toBe(true);
    });

    it('範囲外のインデックスは無視', () => {
      const current = createEmptySelection();
      const result1 = updateSelection(current, -1, false, false, 10);
      const result2 = updateSelection(current, 10, false, false, 10);

      expect(result1).toBe(current);
      expect(result2).toBe(current);
    });
  });

  describe('selectAll', () => {
    it('全選択', () => {
      const result = selectAll(5);

      expect(result.selectedIndices.size).toBe(5);
      expect(result.selectedIndices.has(0)).toBe(true);
      expect(result.selectedIndices.has(4)).toBe(true);
    });

    it('長さ0の場合', () => {
      const result = selectAll(0);

      expect(result.selectedIndices.size).toBe(0);
      expect(result.lastClickedIndex).toBeNull();
    });
  });

  describe('clearSelection', () => {
    it('選択解除', () => {
      const result = clearSelection();

      expect(result.selectedIndices.size).toBe(0);
      expect(result.lastClickedIndex).toBeNull();
    });
  });

  describe('selectRange', () => {
    it('範囲選択（昇順）', () => {
      const result = selectRange(2, 5, 10);

      expect(result.selectedIndices.size).toBe(4);
      expect(result.selectedIndices.has(2)).toBe(true);
      expect(result.selectedIndices.has(5)).toBe(true);
    });

    it('範囲選択（降順）', () => {
      const result = selectRange(5, 2, 10);

      expect(result.selectedIndices.size).toBe(4);
      expect(result.selectedIndices.has(2)).toBe(true);
      expect(result.selectedIndices.has(5)).toBe(true);
    });

    it('範囲外を含む場合はクランプ', () => {
      const result = selectRange(-1, 12, 10);

      expect(result.selectedIndices.size).toBe(10);
      expect(result.selectedIndices.has(0)).toBe(true);
      expect(result.selectedIndices.has(9)).toBe(true);
    });
  });

  describe('isSelected', () => {
    it('選択中', () => {
      const selection = { selectedIndices: new Set([1, 3, 5]), lastClickedIndex: 5 };
      expect(isSelected(selection, 3)).toBe(true);
    });

    it('未選択', () => {
      const selection = { selectedIndices: new Set([1, 3, 5]), lastClickedIndex: 5 };
      expect(isSelected(selection, 2)).toBe(false);
    });
  });

  describe('getSelectionCount', () => {
    it('選択数を取得', () => {
      const selection = { selectedIndices: new Set([1, 3, 5]), lastClickedIndex: 5 };
      expect(getSelectionCount(selection)).toBe(3);
    });

    it('空の場合', () => {
      const selection = createEmptySelection();
      expect(getSelectionCount(selection)).toBe(0);
    });
  });

  describe('getSelectedIndices', () => {
    it('選択中のインデックスを配列で取得（ソート済み）', () => {
      const selection = { selectedIndices: new Set([5, 1, 3]), lastClickedIndex: 3 };
      const result = getSelectedIndices(selection);

      expect(result).toEqual([1, 3, 5]);
    });

    it('空の場合', () => {
      const selection = createEmptySelection();
      expect(getSelectedIndices(selection)).toEqual([]);
    });
  });

  describe('isSelectionEmpty', () => {
    it('空', () => {
      const selection = createEmptySelection();
      expect(isSelectionEmpty(selection)).toBe(true);
    });

    it('非空', () => {
      const selection = { selectedIndices: new Set([1]), lastClickedIndex: 1 };
      expect(isSelectionEmpty(selection)).toBe(false);
    });
  });
});
