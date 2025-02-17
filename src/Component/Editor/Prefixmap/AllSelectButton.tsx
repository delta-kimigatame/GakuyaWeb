import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { Log } from "../../../Lib/Logging";
import { FullWidthButton } from "../../Common/FullWidthButton";

const mapWriter = new Array<number>();
for (let i = 107; i >= 24; i--) {
  mapWriter.push(i);
}
export const AllSelectButton: React.FC<AllSelectButtonProps> = (props) => {
  const { t } = useTranslation();

  /**
   * すべて選択ボタンを押した際の処理
   */
  const OnAllClick = () => {
    Log.log(`全て選択`, "PrefixMapPanel");
    props.setSelected(mapWriter.slice());
  };

  return (
    <FullWidthButton
      color="inherit"
      disabled={!props.update}
      onClick={OnAllClick}
    >
      <Typography variant="caption">{t("editor.prefixmap.all")}</Typography>
    </FullWidthButton>
  );
};
export interface AllSelectButtonProps {
  /** ファイル更新の要否 */
  update: boolean;
  /** prefix値の変更 */
  setPrefix: React.Dispatch<React.SetStateAction<string>>;
  /** suffix値の変更 */
  setSuffix: React.Dispatch<React.SetStateAction<string>>;
  /** 選択している値*/
  setSelected: React.Dispatch<React.SetStateAction<Array<number>>>;
}
