/**
 * ファイル全体の平均周波数表示・編集
 * コンパクトで編集可能なテキストフィールド
 */

import React from 'react';
import { Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface AverageFreqDisplayProps {
  /** ファイル全体の平均周波数 */
  averageFreq: number;
  /** 平均周波数変更時のコールバック */
  onAverageFreqChange: (newAverage: number) => void;
}

/**
 * ファイル全体の平均周波数表示・編集
 */
export const AverageFreqDisplay: React.FC<AverageFreqDisplayProps> = ({
  averageFreq,
  onAverageFreqChange,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = React.useState(averageFreq.toString());
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setValue(averageFreq.toString());
  }, [averageFreq]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    const num = parseFloat(newValue);
    if (isNaN(num) || num < 0) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleBlur = () => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onAverageFreqChange(num);
      setError(false);
    } else {
      // エラーの場合は元の値に戻す
      setValue(averageFreq.toString());
      setError(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {t('editor.frq_editor.average.file_average')}:
      </Box>
      <TextField
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        error={error}
        size="small"
        sx={{ width: '150px' }}
        slotProps={{
          input: {
            style: { textAlign: 'right' },
          },
        }}
      />
      <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Hz</Box>
    </Box>
  );
};
