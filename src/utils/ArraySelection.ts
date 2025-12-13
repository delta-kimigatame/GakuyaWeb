/**
 * 配列選択ロジック
 * Ctrl/Shiftキーによる複数選択をサポート
 */

/**
 * 配列選択の状態
 */
export interface ArraySelection {
  /** 選択中のインデックスのSet */
  selectedIndices: Set<number>;
  /** 最後にクリックしたインデックス（Shift選択の基準点） */
  lastClickedIndex: number | null;
}

/**
 * 空の選択状態を作成
 */
export function createEmptySelection(): ArraySelection {
  return {
    selectedIndices: new Set(),
    lastClickedIndex: null,
  };
}

/**
 * クリックイベントに応じて選択状態を更新
 * @param current 現在の選択状態
 * @param clickedIndex クリックされたインデックス
 * @param ctrlKey Ctrlキーが押されているか
 * @param shiftKey Shiftキーが押されているか
 * @param maxLength 配列の長さ（範囲チェック用）
 * @returns 新しい選択状態
 */
export function updateSelection(
  current: ArraySelection,
  clickedIndex: number,
  ctrlKey: boolean,
  shiftKey: boolean,
  maxLength: number
): ArraySelection {
  // 範囲外チェック
  if (clickedIndex < 0 || clickedIndex >= maxLength) {
    return current;
  }

  // Shift選択：lastClickedIndexからclickedIndexまでの範囲を選択
  if (shiftKey && current.lastClickedIndex !== null) {
    const start = Math.min(current.lastClickedIndex, clickedIndex);
    const end = Math.max(current.lastClickedIndex, clickedIndex);
    const newIndices = new Set(current.selectedIndices);

    for (let i = start; i <= end; i++) {
      newIndices.add(i);
    }

    return {
      selectedIndices: newIndices,
      lastClickedIndex: clickedIndex,
    };
  }

  // Ctrl選択：トグル
  if (ctrlKey) {
    const newIndices = new Set(current.selectedIndices);
    if (newIndices.has(clickedIndex)) {
      newIndices.delete(clickedIndex);
    } else {
      newIndices.add(clickedIndex);
    }

    return {
      selectedIndices: newIndices,
      lastClickedIndex: clickedIndex,
    };
  }

  // 通常クリック：単一選択
  return {
    selectedIndices: new Set([clickedIndex]),
    lastClickedIndex: clickedIndex,
  };
}

/**
 * すべてを選択
 */
export function selectAll(maxLength: number): ArraySelection {
  const indices = new Set<number>();
  for (let i = 0; i < maxLength; i++) {
    indices.add(i);
  }

  return {
    selectedIndices: indices,
    lastClickedIndex: maxLength > 0 ? 0 : null,
  };
}

/**
 * すべての選択を解除
 */
export function clearSelection(): ArraySelection {
  return createEmptySelection();
}

/**
 * 指定範囲を選択
 */
export function selectRange(startIndex: number, endIndex: number, maxLength: number): ArraySelection {
  const start = Math.max(0, Math.min(startIndex, endIndex));
  const end = Math.min(maxLength - 1, Math.max(startIndex, endIndex));
  const indices = new Set<number>();

  for (let i = start; i <= end; i++) {
    indices.add(i);
  }

  return {
    selectedIndices: indices,
    lastClickedIndex: endIndex,
  };
}

/**
 * 選択されているか判定
 */
export function isSelected(selection: ArraySelection, index: number): boolean {
  return selection.selectedIndices.has(index);
}

/**
 * 選択数を取得
 */
export function getSelectionCount(selection: ArraySelection): number {
  return selection.selectedIndices.size;
}

/**
 * 選択中のインデックスを配列で取得（ソート済み）
 */
export function getSelectedIndices(selection: ArraySelection): number[] {
  return Array.from(selection.selectedIndices).sort((a, b) => a - b);
}

/**
 * 何も選択されていないか判定
 */
export function isSelectionEmpty(selection: ArraySelection): boolean {
  return selection.selectedIndices.size === 0;
}
