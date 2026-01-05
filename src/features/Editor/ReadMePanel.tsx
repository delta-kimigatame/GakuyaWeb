import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { SelectChangeEvent } from "@mui/material/Select";

import { CommonCheckBox } from "../../components/Common/CommonCheckBox";
import { FullWidthSelect } from "../../components/Common/FullWidthSelect";

/**
 * readmeを編集する画面
 * @param props {@link ReadMePanelProps}
 * @returns readmeを編集する画面
 */
export const ReadMePanel: React.FC<ReadMePanelProps> = (props) => {
  const { t } = useTranslation();

  /**
   * エンコーディング変更時の処理
   */
  const onEncodingChange = (e: SelectChangeEvent) => {
    props.setReadmeEncoding(e.target.value);
    if (props.onReload) {
      props.onReload(props.readmePath, e.target.value);
    }
  };

  /**
   * ファイルパス変更時の処理
   */
  const onFilePathChange = (e: SelectChangeEvent) => {
    props.setReadmePath(e.target.value);
    if (props.onReload) {
      props.onReload(e.target.value, props.readmeEncoding);
    }
  };

  // zip内の全readme.txtファイルを取得
  const readmeFiles = React.useMemo(() => {
    if (!props.files) return [];
    return props.files
      .filter((f) => f.toLowerCase().endsWith("readme.txt"))
      .sort();
  }, [props.files]);

  return (
    <Box>
      <CommonCheckBox
        checked={props.update}
        setChecked={props.setUpdate}
        label={t("editor.readme.check")}
      />
      <br />
      <Typography variant="caption">
        {t("editor.readme.description")}
      </Typography>
      <br />
      
      {/* ファイル選択セレクトボックス */}
      {readmeFiles.length > 0 && (
        <>
          <FullWidthSelect
            label={t("editor.readme.selectFile")}
            value={props.readmePath}
            onChange={onFilePathChange}
            disabled={!props.update}
          >
            {readmeFiles.map((path) => (
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
        label={t("editor.readme.encoding")}
        value={props.readmeEncoding}
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

      <TextField
        fullWidth
        multiline
        minRows={20}
        value={props.readme}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          props.setReadme(e.target.value);
        }}
        disabled={!props.update}
      />
    </Box>
  );
};

export interface ReadMePanelProps {
  /** readmeファイルの中身 */
  readme: string;
  /** readmeファイルの変更処理 */
  setReadme: React.Dispatch<React.SetStateAction<string>>;
  /** ファイル更新の要否 */
  update: boolean;
  /** ファイル更新要否の変更処理 */
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  /** readme.txtの文字コード */
  readmeEncoding: string;
  /** readme.txtの文字コードの変更処理 */
  setReadmeEncoding: React.Dispatch<React.SetStateAction<string>>;
  /** 読み込むreadme.txtのパス */
  readmePath: string;
  /** 読み込むreadme.txtのパス変更処理 */
  setReadmePath: React.Dispatch<React.SetStateAction<string>>;
  /** zip内のファイル一覧 */
  files?: string[];
  /** readme再読み込み時のコールバック */
  onReload?: (path: string, encoding: string) => void;
}
