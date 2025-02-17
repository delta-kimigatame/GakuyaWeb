import * as React from "react";
import { useTranslation } from "react-i18next";

import { PrefixMap, NoteNumToTone } from "../../../Lib/PrefixMap";
import { Log } from "../../../Lib/Logging";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const AddButton: React.FC<AddButtonProps> = (props) => {
  const { t } = useTranslation();

  /**
   * 追加ボタンを押した際の処理
   */
  const OnAddClick = () => {
    const p = new PrefixMap();
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    ps[props.colorName] = p;
    props.setPrefixMaps(ps);
    Log.log(`voice colorの追加${props.colorName}`, "PrefixMapPanel");
    props.setColor(props.colorName);
    props.setSelected(new Array());
    props.setPrefix("");
    props.setSuffix("");
  };

  return (
    <FullWidthButton
      color="inherit"
      disabled={!props.update || props.colorName === ""}
      onClick={OnAddClick}
    >
      {t("editor.prefixmap.add")}
    </FullWidthButton>
  );
};
export interface AddButtonProps {
  /** ファイル更新の要否 */
  update: boolean;
  /** 現在のボイスカラーの入力値 */
  colorName: string;
  /** prefix.map */
  prefixMaps: { string?: PrefixMap };
  /** prefix.mapの変更 */
  setPrefixMaps: React.Dispatch<React.SetStateAction<{ string?: PrefixMap }>>;
  /** prefix値の変更 */
  setPrefix: React.Dispatch<React.SetStateAction<string>>;
  /** suffix値の変更 */
  setSuffix: React.Dispatch<React.SetStateAction<string>>;
  /** 選択している値*/
  setSelected: React.Dispatch<React.SetStateAction<Array<number>>>;
  /** ボイスカラーの変更 */
  setColor: React.Dispatch<React.SetStateAction<string>>;
}
