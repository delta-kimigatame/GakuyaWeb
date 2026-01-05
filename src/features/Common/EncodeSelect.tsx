import * as React from "react";
import { useTranslation } from "react-i18next";

import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { FullWidthSelect } from "../../components/Common/FullWidthSelect";

/**
 * テキストファイルのエンコーディングを選択するコンポーネント
 * @param props {@link EncodeSelectProps}
 * @returns エンコーディング選択セレクトボックス
 */
export const EncodeSelect: React.FC<EncodeSelectProps> = (props) => {
  const { t } = useTranslation();

  const handleChange = (e: SelectChangeEvent) => {
    props.onChange(e.target.value);
  };

  return (
    <FullWidthSelect
      label={props.label || t("common.encoding")}
      value={props.value}
      onChange={handleChange}
      disabled={props.disabled}
    >
      <MenuItem value="SJIS">Shift-JIS</MenuItem>
      <MenuItem value="utf-8">UTF-8</MenuItem>
      <MenuItem value="gb18030">GB18030</MenuItem>
      <MenuItem value="gbk">GBK</MenuItem>
      <MenuItem value="big5">BIG5</MenuItem>
      <MenuItem value="windows-1252">WINDOWS-1252</MenuItem>
    </FullWidthSelect>
  );
};

export interface EncodeSelectProps {
  /** 現在選択されているエンコーディング */
  value: string;
  /** エンコーディング変更時のコールバック */
  onChange: (encoding: string) => void;
  /** セレクトボックスを無効化するか */
  disabled?: boolean;
  /** ラベル（省略時はデフォルト値を使用） */
  label?: string;
}
