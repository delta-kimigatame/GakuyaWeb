/**
 * 周波数表データテーブル
 * frqのデータポイントを表形式で表示し、選択・編集可能
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Frq } from '../../lib/UtauFrq';
import { ArraySelection, isSelected, updateSelection } from '../../utils/ArraySelection';
import { Log } from '../../lib/Logging';

export interface FrqDataTableProps {
  /** 表示するfrqデータ */
  frq: Frq;
  /** 選択状態 */
  selection: ArraySelection;
  /** 選択状態変更コールバック */
  onSelectionChange: (newSelection: ArraySelection) => void;
  /** 全選択/全解除コールバック */
  onSelectAll: (selectAll: boolean) => void;
  /** テーマモード */
  mode: 'light' | 'dark';
}

export interface FrqDataTableRef {
  scrollToIndex: (index: number) => void;
}

/**
 * 周波数表データテーブル
 */
export const FrqDataTable = React.forwardRef<FrqDataTableRef, FrqDataTableProps>(({
  frq,
  selection,
  onSelectionChange,
  onSelectAll,
  mode,
}, ref) => {
  const { t } = useTranslation();
  const frqArray = Array.from(frq.frq);
  const dataLength = frqArray.length;
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  // 外部から行へのスクロールを可能にする
  React.useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number) => {
      if (tableContainerRef.current) {
        // 行の高さは約28px（縮小版）
        const rowHeight = 28;
        const headerHeight = 28;
        const scrollTop = index * rowHeight;
        tableContainerRef.current.scrollTop = scrollTop;
        Log.debug(`テーブルをインデックス ${index} にスクロールしました`, 'FrqDataTable');
      }
    }
  }), []);

  // ヘッダーのチェックボックス状態
  const allSelected = selection.selectedIndices.size === dataLength;
  const someSelected = selection.selectedIndices.size > 0 && !allSelected;

  // 行クリック処理（タップ対応：キーボード不要の複数選択）
  const handleRowClick = (index: number, event: React.MouseEvent) => {
    // 選択済みかどうかチェック
    const isCurrentlySelected = isSelected(selection, index);
    
    let newSelection: ArraySelection;
    if (isCurrentlySelected) {
      // 選択済みならremove（選択解除）
      const newIndices = new Set(selection.selectedIndices);
      newIndices.delete(index);
      newSelection = {
        selectedIndices: newIndices,
        lastClickedIndex: selection.lastClickedIndex,
      };
      Log.debug(`インデックス ${index} の選択を解除しました`, 'FrqDataTable');
    } else {
      // 未選択ならadd（選択追加）
      const newIndices = new Set(selection.selectedIndices);
      newIndices.add(index);
      newSelection = {
        selectedIndices: newIndices,
        lastClickedIndex: index,
      };
      Log.debug(`インデックス ${index} を選択しました`, 'FrqDataTable');
    }
    
    onSelectionChange(newSelection);
  };

  // 全選択/全解除
  const handleSelectAll = () => {
    Log.info(`${!allSelected ? '全選択' : '全解除'}を実行しました`, 'FrqDataTable');
    onSelectAll(!allSelected);
  };

  return (
    <TableContainer
      ref={tableContainerRef}
      component={Paper}
      sx={{
        height: '100%',
        overflow: 'auto',
        backgroundColor: mode === 'dark' ? 'grey.900' : 'background.paper',
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow sx={{ height: 28 }}>
            <TableCell padding="checkbox" sx={{ py: 0, px: 0.5 }}>
              <Checkbox
                size="small"
                indeterminate={someSelected}
                checked={allSelected}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell align="left" sx={{ py: 0, px: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                {t('editor.frq_editor.table.frequency')}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {frqArray.map((freq, index) => {
            const selected = isSelected(selection, index);

            return (
              <TableRow
                key={index}
                hover
                selected={selected}
                onClick={(e) => handleRowClick(index, e)}
                sx={{
                  cursor: 'pointer',
                  height: 28,
                  '&.Mui-selected': {
                    backgroundColor: mode === 'dark' ? 'primary.dark' : 'primary.light',
                  },
                }}
              >
                <TableCell padding="checkbox" sx={{ py: 0, px: 0.5 }}>
                  <Checkbox size="small" checked={selected} />
                </TableCell>
                <TableCell align="left" sx={{ py: 0, px: 1 }}>
                  <Typography variant="caption" fontFamily="monospace" fontSize="0.7rem">
                    {freq === 0 ? '-' : freq}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* データなし表示 */}
      {dataLength === 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('editor.frq_editor.table.no_data')}
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
});
