import * as React from "react";

import { CancelButton } from "../../../features/Editor/Prefixmap/CancelButton";
import { AllSelectButton } from "../../../features/Editor/Prefixmap/AllSelectButton";

export const SelectArea: React.FC<SelectAreaProps> = (props) => {
  return (
    <>
      <AllSelectButton
        update={props.update}
        setSelected={props.setSelected}
      />
      <CancelButton
        update={props.update}
        setPrefix={props.setPrefix}
        setSuffix={props.setSuffix}
        setSelected={props.setSelected}
      />
      <br />
      <br />
    </>
  );
};
export interface SelectAreaProps {
  /** ファイル更新の要否 */
  update: boolean;
  /** prefix値の変更 */
  setPrefix: React.Dispatch<React.SetStateAction<string>>;
  /** suffix値の変更 */
  setSuffix: React.Dispatch<React.SetStateAction<string>>;
  /** 選択している値*/
  setSelected: React.Dispatch<React.SetStateAction<Array<number>>>;
}
