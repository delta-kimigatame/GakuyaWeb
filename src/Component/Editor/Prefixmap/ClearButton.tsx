import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { PrefixMap, NoteNumToTone } from "../../../lib/PrefixMap";
import { Log } from "../../../lib/Logging";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const ClearButton: React.FC<ClearButtonProps> = (props) => {
  const { t } = useTranslation();

  /**
   * 選択した要素に値を削除
   */
  const OnClearClick = () => {
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    for (let i = 0; i < props.selected.length; i++) {
      Log.log(
        `${props.color}の${NoteNumToTone(
          props.selected[i]
        )}の値更新。prefix:、suffix:`,
        "PrefixMapPanel"
      );
      ps[props.color].SetValue({
        tone: NoteNumToTone(props.selected[i]),
        prefix: "",
        suffix: "",
      });
    }
    props.setPrefixMaps(ps);
  };

  return (
    <FullWidthButton
      color="inherit"
      disabled={!props.update || props.selected.length === 0}
      onClick={OnClearClick}
    >
      <Typography variant="caption">{t("editor.prefixmap.clear")}</Typography>
    </FullWidthButton>
  );
};
export interface ClearButtonProps {
  /** ファイル更新の要否 */
  update: boolean;
  /** 現在のボイスカラー */
  color: string;
  /** 現在選択している音高 */
  selected: Array<number>;
  /** prefix.map */
  prefixMaps: { string?: PrefixMap };
  /** prefix.mapの変更 */
  setPrefixMaps: React.Dispatch<React.SetStateAction<{ string?: PrefixMap }>>;
}
