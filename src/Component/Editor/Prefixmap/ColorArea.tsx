import * as React from "react";
import { useTranslation } from "react-i18next";


import { PrefixMap, NoteNumToTone } from "../../../lib/PrefixMap";
import { FullWidthTextField } from "../../Common/FullWidthTextField";
import { DeleteButton } from "./DeleteButton";
import { ChangeButton } from "./ChangeButton";
import { AddButton } from "./AddButton";
import { ColorSelect } from "./ColorSelect";


export const ColorArea: React.FC<ColorAreaProps> = (props) => {
  const { t } = useTranslation();
  const [colorName, setColorName] = React.useState<string>("");


  return (
    <>
      <ColorSelect
        update={props.update}
        color={props.color}
        prefixMaps={props.prefixMaps}
        setColor={props.setColor}
        setColorName={setColorName}
      />
      <FullWidthTextField
        type="text"
        label={t("editor.prefixmap.voiceColor")}
        value={colorName}
        onChange={(e) => setColorName(e.target.value)}
        disabled={!props.update}
      />
      <AddButton
        update={props.update}
        colorName={colorName}
        prefixMaps={props.prefixMaps}
        setPrefixMaps={props.setPrefixMaps}
        setPrefix={props.setPrefix}
        setSuffix={props.setSuffix}
        setSelected={props.setSelected}
        setColor={props.setColor}
      />
      <ChangeButton
        update={props.update}
        color={props.color}
        colorName={colorName}
        prefixMaps={props.prefixMaps}
        setPrefixMaps={props.setPrefixMaps}
        setPrefix={props.setPrefix}
        setSuffix={props.setSuffix}
        setSelected={props.setSelected}
        setColor={props.setColor}
        setColorName={setColorName}
      />
      <DeleteButton
        update={props.update}
        color={props.color}
        prefixMaps={props.prefixMaps}
        setPrefixMaps={props.setPrefixMaps}
        setPrefix={props.setPrefix}
        setSuffix={props.setSuffix}
        setSelected={props.setSelected}
        setColor={props.setColor}
        setColorName={setColorName}
      />
      <br />
      <br />
    </>
  );
};
export interface ColorAreaProps {
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
}
