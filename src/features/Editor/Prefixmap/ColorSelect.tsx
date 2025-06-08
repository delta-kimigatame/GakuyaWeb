import * as React from "react";
import { useTranslation } from "react-i18next";

import { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { PrefixMap, NoteNumToTone } from "../../../lib/PrefixMap";
import { Log } from "../../../lib/Logging";
import { FullWidthSelect } from "../../../components/Common/FullWidthSelect";

export const ColorSelect: React.FC<ColorSelectProps> = (props) => {
  const { t } = useTranslation();

  /**
   * voicecolorを変更した際の処理
   */
  const OnChangeColor = (e: SelectChangeEvent) => {
    props.setColor(e.target.value);
    props.setColorName(e.target.value);
    Log.log(`Voice Colorの切替。${e.target.value}`, "PrefixMapPanel");
  };

  return (
    <FullWidthSelect
      label={t("editor.prefixmap.voiceColor")}
      value={props.color}
      onChange={OnChangeColor}
      disabled={!props.update}
    >
      {Object.keys(props.prefixMaps).map((c) => (
        <MenuItem value={c}>{c}</MenuItem>
      ))}
    </FullWidthSelect>
  );
};
export interface ColorSelectProps {
    /** ファイル更新の要否 */
    update: boolean;
    /** 現在のボイスカラー */
    color: string;
    /** prefix.map */
    prefixMaps: { string?: PrefixMap };
    /** ボイスカラーの変更 */
    setColor: React.Dispatch<React.SetStateAction<string>>;
    /** ボイスカラーの入力値の変更 */
    setColorName: React.Dispatch<React.SetStateAction<string>>;
}
