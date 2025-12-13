/**
 * 周波数表編集ツールバー
 * 選択範囲に対する編集操作を提供
 */

import React from 'react';
import { Box, Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export interface FrqEditorToolbarProps {
  /** 選択範囲を2倍にする */
  onMultiplyBy2: () => void;
  /** 選択範囲を3倍にする */
  onMultiplyBy3: () => void;
  /** 選択範囲を1/2にする */
  onDivideBy2: () => void;
  /** 選択範囲を1/3にする */
  onDivideBy3: () => void;
  /** ファイル全体の平均周波数を選択範囲の平均値にする */
  onFileAverageToSelection: () => void;
  /** 選択範囲の平均値をファイル全体の平均周波数にする */
  onSelectionToFileAverage: () => void;
  /** 選択範囲を線形補完する */
  onLinearInterpolate: () => void;
  /** 全選択 */
  onSelectAll: () => void;
  /** 選択解除 */
  onClearSelection: () => void;
  /** 周波数表を再生成する */
  onRegenerate: () => void;
  /** 保存 */
  onSave: () => void;
  /** 選択されているポイント数 */
  selectionCount: number;
}

/**
 * 周波数表編集ツールバー
 */
export const FrqEditorToolbar: React.FC<FrqEditorToolbarProps> = ({
  onMultiplyBy2,
  onMultiplyBy3,
  onDivideBy2,
  onDivideBy3,
  onFileAverageToSelection,
  onSelectionToFileAverage,
  onLinearInterpolate,
  onSelectAll,
  onClearSelection,
  onRegenerate,
  onSave,
  selectionCount,
}) => {
  const { t } = useTranslation();
  const hasSelection = selectionCount > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {/* 選択操作 */}
      <ButtonGroup variant="outlined" size="small">
        <Tooltip title={t('editor.frq_editor.toolbar.select_all')}>
          <Button onClick={onSelectAll}>
            {t('editor.frq_editor.toolbar.select_all')}
          </Button>
        </Tooltip>
        <Tooltip title={t('editor.frq_editor.toolbar.clear_selection')}>
          <span>
            <Button onClick={onClearSelection} disabled={!hasSelection}>
              {t('editor.frq_editor.toolbar.clear_selection')}
            </Button>
          </span>
        </Tooltip>
      </ButtonGroup>

      {/* 選択範囲倍率操作 */}
      <ButtonGroup variant="outlined" size="small">
        <Tooltip title={t('editor.frq_editor.toolbar.multiply_by_2')}>
          <span>
            <Button onClick={onMultiplyBy2} disabled={!hasSelection}>
              ×2
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={t('editor.frq_editor.toolbar.multiply_by_3')}>
          <span>
            <Button onClick={onMultiplyBy3} disabled={!hasSelection}>
              ×3
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={t('editor.frq_editor.toolbar.divide_by_2')}>
          <span>
            <Button onClick={onDivideBy2} disabled={!hasSelection}>
              ÷2
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={t('editor.frq_editor.toolbar.divide_by_3')}>
          <span>
            <Button onClick={onDivideBy3} disabled={!hasSelection}>
              ÷3
            </Button>
          </span>
        </Tooltip>
      </ButtonGroup>

      {/* 平均値操作 */}
      <ButtonGroup variant="outlined" size="small">
        <Tooltip title={t('editor.frq_editor.toolbar.file_average_to_selection')}>
          <span>
            <Button onClick={onFileAverageToSelection} disabled={!hasSelection}>
              avg→・
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={t('editor.frq_editor.toolbar.selection_to_file_average')}>
          <span>
            <Button onClick={onSelectionToFileAverage} disabled={!hasSelection}>
              ・→avg
            </Button>
          </span>
        </Tooltip>
      </ButtonGroup>

      {/* 線形補完 */}
      <Tooltip title={t('editor.frq_editor.toolbar.linear_interpolate')}>
        <span>
          <Button
            variant="outlined"
            size="small"
            onClick={onLinearInterpolate}
            disabled={!hasSelection}
          >
            ・─・
          </Button>
        </span>
      </Tooltip>

      {/* 再生成・保存 */}
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        <Tooltip title={t('editor.frq_editor.toolbar.regenerate')}>
          <IconButton onClick={onRegenerate} color="secondary" size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('editor.frq_editor.toolbar.save')}>
          <IconButton onClick={onSave} color="primary" size="small">
            <SaveIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
