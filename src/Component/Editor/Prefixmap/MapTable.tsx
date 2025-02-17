import * as React from "react";
import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";

import { PaletteMode } from "@mui/material";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { PrefixMap, NoteNumToTone } from "../../../Lib/PrefixMap";
import { Log } from "../../../Lib/Logging";

const mapWriter = new Array<number>();
for (let i = 107; i >= 24; i--) {
  mapWriter.push(i);
}
export const MapTable: React.FC<MapTableProps> = (props) => {
  const { t } = useTranslation();
  const variant = "caption";

  /**
   * tableの行をクリックした際の処理
   * @param e
   * @param i 行番号をnotenumで
   */
  const OnTableRowClick = (e, i) => {
    if (props.selected.includes(i)) {
      const selected_ = props.selected.filter((n) => n !== i);
      props.setSelected(selected_);
      Log.log(`選択中の列。${selected_.join()}`, "PrefixMapPanel");
      if (selected_.length === 0) {
        props.setPrefix("");
        props.setSuffix("");
      }
    } else {
      const selected_ = props.selected.slice();
      selected_.push(i);
      props.setSelected(selected_);
      Log.log(`選択中の列。${selected_.join()}`, "PrefixMapPanel");
      if (selected_.length === 1) {
        props.setPrefix(props.prefixMaps[props.color].GetValue(i).prefix);
        props.setSuffix(props.prefixMaps[props.color].GetValue(i).suffix);
      }
    }
  };

  return (
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
                backgroundColor: props.selected.includes(i)
                  ? "#33c9dc"
                  : props.mode === "light"
                  ? "#EEEEEE"
                  : "#313C42",
              }}
            >
              <StyledTableCell size={"small"}>
                <Typography variant={variant}>
                  {props.prefixMaps[props.color].GetValue(i).tone}
                </Typography>
              </StyledTableCell>
              <StyledTableCell size={"small"}>
                <Typography variant={variant}>
                  {props.prefixMaps[props.color].GetValue(i).prefix}
                </Typography>
              </StyledTableCell>
              <StyledTableCell size={"small"}>
                <Typography variant={variant}>
                  {props.prefixMaps[props.color].GetValue(i).suffix}
                </Typography>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export interface MapTableProps {
  /** prefix.map */
  prefixMaps: { string?: PrefixMap };
  /** ファイル更新の要否 */
  update: boolean;
  /**ダークモードかライトモードか */
  mode: PaletteMode;
  /** 現在のボイスカラー */
  color: string;
  /** 選択中の音高 */
  selected: Array<number>;
  /** prefix値の変更 */
  setPrefix: React.Dispatch<React.SetStateAction<string>>;
  /** suffix値の変更 */
  setSuffix: React.Dispatch<React.SetStateAction<string>>;
  /** 選択している値*/
  setSelected: React.Dispatch<React.SetStateAction<Array<number>>>;
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
