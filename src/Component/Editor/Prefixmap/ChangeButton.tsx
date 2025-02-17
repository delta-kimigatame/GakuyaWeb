import * as React from "react";
import { useTranslation } from "react-i18next";

import { PrefixMap, NoteNumToTone } from "../../../Lib/PrefixMap";
import { Log } from "../../../Lib/Logging";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const ChangeButton: React.FC<ChangeButtonProps> = (props) => {
  const { t } = useTranslation();

  /**
   * 変更ボタンを押した際の処理
   */
  const OnChangeClick = () => {
    const p = new PrefixMap();
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    ps[props.colorName] = new PrefixMap(ps[props.color].OutputMap());
    delete ps[props.color];
    props.setPrefixMaps(ps);
    Log.log(
      `voice colorの変更${props.color}->${props.colorName}`,
      "PrefixMapPanel"
    );
    props.setColor(props.colorName);
    props.setSelected(new Array());
    props.setPrefix("");
    props.setSuffix("");
  };

  return (
    <FullWidthButton
      color="inherit"
      disabled={!props.update || props.color === "" || props.color === props.colorName}
      onClick={OnChangeClick}
    >
      {t("editor.prefixmap.change")}
    </FullWidthButton>
  );
};
export interface ChangeButtonProps {
  /** ファイル更新の要否 */
  update: boolean;
  /** 現在のボイスカラー */
  color: string;
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
  /** ボイスカラーの入力値の変更 */
  setColorName: React.Dispatch<React.SetStateAction<string>>;
}
