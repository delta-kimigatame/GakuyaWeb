import * as React from "react";
import { useTranslation } from "react-i18next";


import { PrefixMap } from "../../../lib/PrefixMap";
import { FullWidthTextField } from "../../Common/FullWidthTextField";
import { ClearButton } from "./ClearButton";
import { SetButton } from "./SetButton";

export const ValueArea: React.FC<ValueAreaProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <FullWidthTextField
        type="text"
        label={t("editor.prefixmap.header.prefix")}
        value={props.prefix}
        onChange={(e) => props.setPrefix(e.target.value)}
        disabled={!props.update || props.selected.length === 0}
      />
      <FullWidthTextField
        type="text"
        label={t("editor.prefixmap.header.suffix")}
        value={props.suffix}
        onChange={(e) => props.setSuffix(e.target.value)}
        disabled={!props.update || props.selected.length === 0}
      />
      <SetButton
        update={props.update}
        color={props.color}
        selected={props.selected}
        prefixMaps={props.prefixMaps}
        setPrefixMaps={props.setPrefixMaps}
        prefix={props.prefix}
        suffix={props.suffix}
      />
      <ClearButton
        update={props.update}
        color={props.color}
        selected={props.selected}
        prefixMaps={props.prefixMaps}
        setPrefixMaps={props.setPrefixMaps}
      />
    </>
  );
};
export interface ValueAreaProps {
  /** prefix.map */
  prefixMaps: { string?: PrefixMap };
  /** prefix.mapの変更 */
  setPrefixMaps: React.Dispatch<React.SetStateAction<{ string?: PrefixMap }>>;
  /** ファイル更新の要否 */
  update: boolean;
  /** 現在のボイスカラー */
  color: string;
  /** 現在選択している音高 */
  selected: Array<number>;
  /** 現在入力されているprefix値 */
  prefix: string;
  /** 現在入力されているsuffix値 */
  suffix: string;
  /** prefix値の変更 */
  setPrefix: React.Dispatch<React.SetStateAction<string>>;
  /** suffix値の変更 */
  setSuffix: React.Dispatch<React.SetStateAction<string>>;
}
