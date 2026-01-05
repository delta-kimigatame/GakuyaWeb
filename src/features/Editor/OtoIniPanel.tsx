import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { SelectChangeEvent } from "@mui/material/Select";

import { CommonCheckBox } from "../../components/Common/CommonCheckBox";
import { FullWidthSelect } from "../../components/Common/FullWidthSelect";
import { EncodeSelect } from "../Common/EncodeSelect";

/**
 * oto.iniの文字コードを変換する画面
 * @param props {@link OtoIniPanelProps}
 * @returns oto.iniの文字コードを変換する画面
 */
export const OtoIniPanel: React.FC<OtoIniPanelProps> = (props) => {
  const { t } = useTranslation();

  // zip内の全oto.iniファイルを取得
  const otoIniFiles = React.useMemo(() => {
    if (!props.files) return [];
    return props.files
      .filter((f) => f.toLowerCase().endsWith("oto.ini"))
      .sort();
  }, [props.files]);

  /**
   * エンコーディング変更時の処理
   */
  const onEncodingChange = (encoding: string) => {
    if (!props.selectedOtoPath) return;
    
    // Mapを更新
    const newEncodings = new Map(props.otoEncodings);
    newEncodings.set(props.selectedOtoPath, encoding);
    props.setOtoEncodings(newEncodings);
    
    // 再読み込み
    if (props.onReload) {
      props.onReload(props.selectedOtoPath, encoding);
    }
  };

  /**
   * ファイルパス変更時の処理
   */
  const onFilePathChange = (e: SelectChangeEvent) => {
    const newPath = e.target.value;
    props.setSelectedOtoPath(newPath);
    
    // 選択されたファイルのエンコーディングを取得（なければデフォルトのSJIS）
    const encoding = props.otoEncodings.get(newPath) || "SJIS";
    
    // 再読み込み
    if (props.onReload) {
      props.onReload(newPath, encoding);
    }
  };

  /**
   * 更新要否の変更
   */
  const onChangeUpdate = () => {
    props.setUpdate(!props.update);
  };

  // 現在選択されているファイルのエンコーディングを取得
  const currentEncoding = props.selectedOtoPath 
    ? props.otoEncodings.get(props.selectedOtoPath) || "SJIS"
    : "SJIS";

  return (
    <Box>
      <CommonCheckBox
        checked={props.update}
        setChecked={onChangeUpdate}
        label={t("editor.otoini.check")}
      />
      <br />
      <Typography variant="caption">
        {t("editor.otoini.description")}
      </Typography>
      <br />

      {otoIniFiles.length > 0 && (
        <>
          <FullWidthSelect
            label={t("editor.otoini.selectFile")}
            value={props.selectedOtoPath}
            onChange={onFilePathChange}
            disabled={!props.update}
          >
            {otoIniFiles.map((path) => (
              <MenuItem key={path} value={path}>
                {path}
              </MenuItem>
            ))}
          </FullWidthSelect>
          <br />
        </>
      )}

      {props.selectedOtoPath && (
        <>
          <EncodeSelect
            value={currentEncoding}
            onChange={onEncodingChange}
            disabled={!props.update}
          />
          <br />
          <Typography variant="caption" color="textSecondary">
            {t("editor.otoini.preview")}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={15}
            maxRows={25}
            value={props.otoContent}
            disabled={true}
            InputProps={{
              style: { fontFamily: "monospace", fontSize: "0.875rem" }
            }}
          />
        </>
      )}

      {otoIniFiles.length === 0 && (
        <Typography variant="body2" color="textSecondary">
          {t("editor.otoini.noFiles")}
        </Typography>
      )}
    </Box>
  );
};

export interface OtoIniPanelProps {
  /** ファイル一覧 */
  files: string[];
  /** 各oto.iniのパスとエンコーディングのマップ */
  otoEncodings: Map<string, string>;
  /** エンコーディングマップの変更処理 */
  setOtoEncodings: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  /** 現在選択されているoto.iniのパス */
  selectedOtoPath: string;
  /** 選択パスの変更処理 */
  setSelectedOtoPath: React.Dispatch<React.SetStateAction<string>>;
  /** 選択されているoto.iniの内容（プレビュー） */
  otoContent: string;
  /** プレビュー内容の変更処理 */
  setOtoContent: React.Dispatch<React.SetStateAction<string>>;
  /** 更新要否 */
  update: boolean;
  /** 更新要否の変更処理 */
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  /** 再読み込み時のコールバック */
  onReload?: (path: string, encoding: string) => void;
}
