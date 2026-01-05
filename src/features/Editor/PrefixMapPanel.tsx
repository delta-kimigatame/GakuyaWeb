import * as React from "react";
import { useTranslation } from "react-i18next";

import { PaletteMode } from "@mui/material";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { Divider } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

import { CommonCheckBox } from "../../components/Common/CommonCheckBox";
import { FullWidthSelect } from "../../components/Common/FullWidthSelect";

import { PrefixMap, NoteNumToTone } from "../../lib/PrefixMap";
import { Log } from "../../lib/Logging";
import { ValueArea } from "../../components/Editor/Prefixmap/ValueArea";
import { SelectArea } from "../../components/Editor/Prefixmap/SelectArea";
import { ColorArea } from "../../components/Editor/Prefixmap/ColorArea";
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
      Log.info(`prefix.mapが存在しないため生成しました。`, "PrefixMapPanel");
    }
  };

  /**
   * エンコーディング変更時の処理
   */
  const onEncodingChange = (e: SelectChangeEvent) => {
    props.setPrefixMapEncoding(e.target.value);
    if (props.onReload) {
      props.onReload(props.prefixMapPath, e.target.value);
    }
  };

  /**
   * ファイルパス変更時の処理
   */
  const onFilePathChange = (e: SelectChangeEvent) => {
    props.setPrefixMapPath(e.target.value);
    if (props.onReload) {
      props.onReload(e.target.value, props.prefixMapEncoding);
    }
  };

  // zip内の全prefix.mapファイルを取得
  const prefixMapFiles = React.useMemo(() => {
    if (!props.files) return [];
    return props.files
      .filter((f) => f.toLowerCase().endsWith("prefix.map"))
      .sort();
  }, [props.files]);

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

      {/* ファイル選択セレクトボックス */}
      {prefixMapFiles.length > 0 && (
        <>
          <FullWidthSelect
            label={t("editor.prefixmap.selectFile")}
            value={props.prefixMapPath}
            onChange={onFilePathChange}
            disabled={!props.update}
          >
            {prefixMapFiles.map((path) => (
              <MenuItem key={path} value={path}>
                {path}
              </MenuItem>
            ))}
          </FullWidthSelect>
          <br />
        </>
      )}

      {/* エンコーディング選択セレクトボックス */}
      <FullWidthSelect
        label={t("editor.prefixmap.encoding")}
        value={props.prefixMapEncoding}
        onChange={onEncodingChange}
        disabled={!props.update}
      >
        <MenuItem value="SJIS">Shift-JIS</MenuItem>
        <MenuItem value="utf-8">UTF-8</MenuItem>
        <MenuItem value="gb18030">GB18030</MenuItem>
        <MenuItem value="gbk">GBK</MenuItem>
        <MenuItem value="big5">BIG5</MenuItem>
        <MenuItem value="windows-1252">WINDOWS-1252</MenuItem>
      </FullWidthSelect>
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
  /** prefix.mapの文字コード */
  prefixMapEncoding: string;
  /** prefix.mapの文字コードの変更処理 */
  setPrefixMapEncoding: React.Dispatch<React.SetStateAction<string>>;
  /** 読み込むprefix.mapのパス */
  prefixMapPath: string;
  /** 読み込むprefix.mapのパス変更処理 */
  setPrefixMapPath: React.Dispatch<React.SetStateAction<string>>;
  /** zip内のファイル一覧 */
  files?: string[];
  /** prefix.map再読み込み時のコールバック */
  onReload?: (path: string, encoding: string) => void;
}
