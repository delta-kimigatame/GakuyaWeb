import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { PrefixMap, NoteNumToTone } from "../../../Lib/PrefixMap";
import { Log } from "../../../Lib/Logging";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const SetButton: React.FC<SetButtonProps> = (props) => {
  const { t } = useTranslation();

  /**
   * 選択した要素に値を設定
   */
  const OnSetClick = () => {
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    for (let i = 0; i < props.selected.length; i++) {
      Log.log(
        `${props.color}の${NoteNumToTone(props.selected[i])}の値更新。prefix:${
          props.prefix
        }、suffix:${props.suffix}`,
        "PrefixMapPanel"
      );
      ps[props.color].SetValue({
        tone: NoteNumToTone(props.selected[i]),
        prefix: props.prefix,
        suffix: props.suffix,
      });
    }
    props.setPrefixMaps(ps);
  };

  return (
    <FullWidthButton
      color="inherit"
      disabled={!props.update || props.selected.length === 0}
      onClick={OnSetClick}
    >
      <Typography variant="caption">{t("editor.prefixmap.set")}</Typography>
    </FullWidthButton>
  );
};
export interface SetButtonProps {
  /** ファイル更新の要否 */
  update: boolean;
  /** 現在のボイスカラー */
  color: string;
  /** 現在選択している音高 */
  selected: Array<number>;
  /** prefix.map */
  prefixMaps: { string?: PrefixMap };
  /** 現在入力されているprefix値 */
  prefix: string;
  /** 現在入力されているsuffix値 */
  suffix: string;
  /** prefix.mapの変更 */
  setPrefixMaps: React.Dispatch<React.SetStateAction<{ string?: PrefixMap }>>;
}
