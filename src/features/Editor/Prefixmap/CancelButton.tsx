import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { Log } from "../../../lib/Logging";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const CancelButton: React.FC<CancelButtonProps> = (props) => {
  const { t } = useTranslation();

  /**
   * すべて選択解除を押した際の処理
   */
  const OnCancelClick = () => {
    Log.log(`選択解除`, "PrefixMapPanel");
    props.setSelected(new Array());
    props.setPrefix("");
    props.setSuffix("");
  };

  return (
    <FullWidthButton
      color="inherit"
      disabled={!props.update}
      onClick={OnCancelClick}
    >
      <Typography variant="caption">{t("editor.prefixmap.cancel")}</Typography>
    </FullWidthButton>
  );
};
export interface CancelButtonProps {
  /** ファイル更新の要否 */
  update: boolean;
  /** prefix値の変更 */
  setPrefix: React.Dispatch<React.SetStateAction<string>>;
  /** suffix値の変更 */
  setSuffix: React.Dispatch<React.SetStateAction<string>>;
  /** 選択している値*/
  setSelected: React.Dispatch<React.SetStateAction<Array<number>>>;
}
