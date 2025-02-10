import * as React from "react";
import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";

import { PaletteMode } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Divider } from "@mui/material";

import { CommonCheckBox } from "../Common/CommonCheckBox";

import { PrefixMap,NoteNumToTone } from "../../Lib/PrefixMap";
import { Log } from "../../Lib/Logging";
import { FullWidthButton } from "../Common/FullWidthButton";
import { FullWidthSelect } from "../Common/FullWidthSelect";
import { FullWidthTextField } from "../Common/FullWidthTextField";

const mapWriter = new Array<number>();
for (let i = 107; i >= 24; i--) {
  mapWriter.push(i);
}
export const PrefixMapPanel: React.FC<PrefixMapPanelProps> = (props) => {
  const { t } = useTranslation();
  const [color, setColor] = React.useState<string>("");
  const [colorName, setColorName] = React.useState<string>("");
  const [selected, setSelected] = React.useState<Array<number>>([]);
  const [prefix, setPrefix] = React.useState<string>("");
  const [suffix, setSuffix] = React.useState<string>("");
  const variant = "caption";

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

  /**
   * tableの行をクリックした際の処理
   * @param e
   * @param i 行番号をnotenumで
   */
  const OnTableRowClick = (e, i) => {
    if (selected.includes(i)) {
      const selected_ = selected.filter((n) => n !== i);
      setSelected(selected_);
      Log.log(`選択中の列。${selected_.join()}`, "PrefixMapPanel");
      if(selected_.length===0){
        setPrefix("")
        setSuffix("")
      }
    } else {
      const selected_ = selected.slice();
      selected_.push(i);
      setSelected(selected_);
      Log.log(`選択中の列。${selected_.join()}`, "PrefixMapPanel");
      if(selected_.length===1){
        setPrefix(props.prefixMaps[color].GetValue(i).prefix)
        setSuffix(props.prefixMaps[color].GetValue(i).suffix)
      }
    }
  };

  /**
   * voicecolorを変更した際の処理
   */
  const OnChangeColor = (e: SelectChangeEvent) => {
    setColor(e.target.value);
    setColorName(e.target.value);
    Log.log(`Voice Colorの切替。${e.target.value}`, "PrefixMapPanel");
  };

  /**
   * 追加ボタンを押した際の処理
   */
  const OnAddClick = () => {
    const p = new PrefixMap();
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    ps[colorName] = p;
    props.setPrefixMaps(ps);
    Log.log(`voice colorの追加${colorName}`, "PrefixMapPanel");
    setColor(colorName);
    setSelected(new Array());
    setPrefix("")
    setSuffix("")
  };
  /**
   * 変更ボタンを押した際の処理
   */
  const OnChangeClick = () => {
    const p = new PrefixMap();
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    ps[colorName] = new PrefixMap(ps[color].OutputMap());
    delete ps[color];
    props.setPrefixMaps(ps);
    Log.log(`voice colorの変更${color}->${colorName}`, "PrefixMapPanel");
    setColor(colorName);
    setSelected(new Array());
    setPrefix("")
    setSuffix("")
  };
  /**
   * 削除ボタンを押した際の処理
   */
  const OnDeleteClick = () => {
    const p = new PrefixMap();
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    delete ps[color];
    props.setPrefixMaps(ps);
    Log.log(`voice colorの削除${color}`, "PrefixMapPanel");
    setColor("");
    setColorName("");
    setSelected(new Array());
    setPrefix("")
    setSuffix("")
  };
  /**
   * すべて選択ボタンを押した際の処理
   */
  const OnAllClick = () => {
    Log.log(`全て選択`, "PrefixMapPanel");
    setSelected(mapWriter.slice());
  };
  /**
   * すべて選択解除を押した際の処理
   */
  const OnCancelClick = () => {
    Log.log(`選択解除`, "PrefixMapPanel");
    setSelected(new Array());
    setPrefix("")
    setSuffix("")
  };
  /**
   * 選択した要素に値を設定
   */
  const OnSetClick = () => {
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    for (let i=0;i<selected.length;i++){
        Log.log(`${color}の${NoteNumToTone(selected[i])}の値更新。prefix:${prefix}、suffix:${suffix}`, "PrefixMapPanel");
        ps[color].SetValue({tone:NoteNumToTone(selected[i]),prefix:prefix,suffix:suffix})
    }
    props.setPrefixMaps(ps)
  };
  /**
   * 選択した要素に値を削除
   */
  const OnClearClick = () => {
    const ps: { string?: PrefixMap } = { ...props.prefixMaps };
    for (let i=0;i<selected.length;i++){
        Log.log(`${color}の${NoteNumToTone(selected[i])}の値更新。prefix:、suffix:`, "PrefixMapPanel");
        ps[color].SetValue({tone:NoteNumToTone(selected[i]),prefix:"",suffix:""})
    }
    props.setPrefixMaps(ps)
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
            <TableContainer component={Paper}>
              <Table size={"small"}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell size={"small"}>
                      <Typography variant={variant}>
                        {t("editor.prefixmap.header.tone")}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell size={"small"}>
                      <Typography variant={variant}>
                        {t("editor.prefixmap.header.prefix")}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell size={"small"}>
                      <Typography variant={variant}>
                        {t("editor.prefixmap.header.suffix")}
                      </Typography>
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mapWriter.map((i) => (
                    <TableRow
                      onClick={(e) => {
                        OnTableRowClick(e, i);
                      }}
                      sx={{
                        backgroundColor: selected.includes(i)
                          ? "#33c9dc"
                          : props.mode === "light"
                          ? "#EEEEEE"
                          : "#313C42",
                      }}
                    >
                      <StyledTableCell size={"small"}>
                        <Typography variant={variant}>
                          {props.prefixMaps[color].GetValue(i).tone}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell size={"small"}>
                        <Typography variant={variant}>
                          {props.prefixMaps[color].GetValue(i).prefix}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell size={"small"}>
                        <Typography variant={variant}>
                          {props.prefixMaps[color].GetValue(i).suffix}
                        </Typography>
                      </StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ width: 100, m: 0 }}>
            <FullWidthSelect
              label={t("editor.prefixmap.voiceColor")}
              value={color}
              onChange={OnChangeColor}
              disabled={!props.update}
            >
              {Object.keys(props.prefixMaps).map((c) => (
                <MenuItem value={c}>{c}</MenuItem>
              ))}
            </FullWidthSelect>
            <FullWidthTextField
              type="text"
              label={t("editor.prefixmap.voiceColor")}
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              disabled={!props.update}
            />
            <FullWidthButton
              color="inherit"
              disabled={!props.update || colorName === ""}
              onClick={OnAddClick}
            >
              {t("editor.prefixmap.add")}
            </FullWidthButton>
            <FullWidthButton
              color="inherit"
              disabled={!props.update || color === "" || color === colorName}
              onClick={OnChangeClick}
            >
              {t("editor.prefixmap.change")}
            </FullWidthButton>
            <FullWidthButton
              color="inherit"
              disabled={!props.update || color === ""}
              onClick={OnDeleteClick}
            >
              {t("editor.prefixmap.delete")}
            </FullWidthButton>
            <br />
            <br />
            <Divider />
            <FullWidthButton
              color="inherit"
              disabled={!props.update}
              onClick={OnAllClick}
            >
              <Typography variant="caption">
                {t("editor.prefixmap.all")}
              </Typography>
            </FullWidthButton>
            <FullWidthButton
              color="inherit"
              disabled={!props.update}
              onClick={OnCancelClick}
            >
              <Typography variant="caption">
                {t("editor.prefixmap.cancel")}
              </Typography>
            </FullWidthButton>
            <br />
            <br />
            <Divider />
            <FullWidthTextField
              type="text"
              label={t("editor.prefixmap.header.prefix")}
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              disabled={!props.update || selected.length===0}
            />
            <FullWidthTextField
              type="text"
              label={t("editor.prefixmap.header.suffix")}
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              disabled={!props.update || selected.length===0}
            />
            <FullWidthButton
              color="inherit"
              disabled={!props.update || selected.length===0}
              onClick={OnSetClick}
            >
              <Typography variant="caption">
                {t("editor.prefixmap.set")}
              </Typography>
            </FullWidthButton>
            <FullWidthButton
              color="inherit"
              disabled={!props.update || selected.length===0}
              onClick={OnClearClick}
            >
              <Typography variant="caption">
                {t("editor.prefixmap.clear")}
              </Typography>
            </FullWidthButton>
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

/**
 * style付きtablecell
 */
const StyledTableCell = styled(TableCell)({
  textWrap: "nowrap",
  p: 1,
  width: "33.3%",
  overflowX: "hidden",
});
