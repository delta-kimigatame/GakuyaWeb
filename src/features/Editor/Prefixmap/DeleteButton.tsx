import * as React from "react";
import { useTranslation } from "react-i18next";

import { PrefixMap, NoteNumToTone } from "../../../lib/PrefixMap";
import { Log } from "../../../lib/Logging";
import { FullWidthButton } from "../../../components/Common/FullWidthButton";

export const DeleteButton: React.FC<DeleteButtonProps> = (props) => {
  const { t } = useTranslation();

  /**
   * 削除ボタンを押した際の処理
   */
  const OnDeleteClick = () => {
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    delete ps[props.color];
    props.setPrefixMaps(ps);
    Log.info(`voice colorの削除${props.color}`, "PrefixMapPanel");
    props.setColor("");
    props.setColorName("");
    props.setSelected(new Array());
    props.setPrefix("");
    props.setSuffix("");
  };

  return (
    <FullWidthButton
      color="inherit"
      disabled={!props.update || props.color === ""}
      onClick={OnDeleteClick}
      testId="prefixDeleteButton"
    >
      {t("editor.prefixmap.delete")}
    </FullWidthButton>
  );
};
export interface DeleteButtonProps {
  /** ファイル更新の要否 */
  update: boolean;
  /** 現在のボイスカラー */
  color: string;
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
