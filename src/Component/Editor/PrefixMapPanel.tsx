import * as React from "react";
import { useTranslation } from "react-i18next";

import { PaletteMode } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Divider } from "@mui/material";

import { CommonCheckBox } from "../Common/CommonCheckBox";

import { PrefixMap, NoteNumToTone } from "../../Lib/PrefixMap";
import { Log } from "../../Lib/Logging";
import { ValueArea } from "./Prefixmap/ValueArea";
import { SelectArea } from "./Prefixmap/SelectArea";
import { ColorArea } from "./Prefixmap/ColorArea";
import { MapTable } from "./Prefixmap/MapTable";

export const PrefixMapPanel: React.FC<PrefixMapPanelProps> = (props) => {
  const { t } = useTranslation();
  const [color, setColor] = React.useState<string>("");
  const [selected, setSelected] = React.useState<Array<number>>([]);
  const [prefix, setPrefix] = React.useState<string>("");
  const [suffix, setSuffix] = React.useState<string>("");

  /**
   * prefix.mapの更新要否を切り替えた際の処理
   */
  const OnChangeUpdate = () => {
    const newValue = !props.update;
    props.setUpdate(newValue);
    if (newValue && Object.keys(props.prefixMaps).length === 0) {
      const p = new PrefixMap();
      const ps: { string?: PrefixMap } = {};
      ps[""] = p;
      props.setPrefixMaps(ps);
      Log.log(`prefix.mapが存在しないため生成しました。`, "PrefixMapPanel");
    }
  };

  return (
    <Box>
      <CommonCheckBox
        checked={props.update}
        setChecked={OnChangeUpdate}
        label={t("editor.prefixmap.check")}
      />
      <br />
      <Typography variant="caption">
        {t("editor.prefixmap.description")}
        <br />
        {t("editor.prefixmap.description2")}
      </Typography>
      <br />
      {Object.keys(props.prefixMaps).length !== 0 && (
        <Box sx={{ display: "flex", m: 1, ml: 0 }}>
          <Box sx={{ flex: 1, flexGrow: 1 }}>
            <MapTable
              prefixMaps={props.prefixMaps}
              update={props.update}
              mode={props.mode}
              color={color}
              selected={selected}
              setPrefix={setPrefix}
              setSuffix={setSuffix}
              setSelected={setSelected}
            />
          </Box>
          <Box sx={{ width: 100, m: 0 }}>
            <ColorArea
              update={props.update}
              color={color}
              prefixMaps={props.prefixMaps}
              setPrefixMaps={props.setPrefixMaps}
              setPrefix={setPrefix}
              setSuffix={setSuffix}
              setSelected={setSelected}
              setColor={setColor}
            />
            <Divider />
            <SelectArea 
              update={props.update}
              setPrefix={setPrefix}
              setSuffix={setSuffix}
              setSelected={setSelected}
            />
            <Divider />
            <ValueArea
              update={props.update}
              color={color}
              selected={selected}
              prefixMaps={props.prefixMaps}
              setPrefixMaps={props.setPrefixMaps}
              prefix={prefix}
              suffix={suffix}
              setPrefix={setPrefix}
              setSuffix={setSuffix}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
export interface PrefixMapPanelProps {
  /** prefix.map */
  prefixMaps: { string?: PrefixMap };
  /** prefix.mapの変更 */
  setPrefixMaps: React.Dispatch<React.SetStateAction<{ string?: PrefixMap }>>;
  /** ファイル更新の要否 */
  update: boolean;
  /** ファイル更新要否の変更処理 */
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  /**ダークモードかライトモードか */
  mode: PaletteMode;
}
