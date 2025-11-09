import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { SelectChangeEvent } from "@mui/material/Select";

import { NormalizeJP } from "../../utils/FilenameNormalize";
import { FullWidthButton } from "../../components/Common/FullWidthButton";
import { FullWidthSelect } from "../../components/Common/FullWidthSelect";

import { Log } from "../../lib/Logging";

/**
 * zip読込待ちダイアログの操作ボタン部分
 * @param props {@link LoadZipButtonAreaProps}
 * @returns zip読込待ちダイアログの操作ボタン部分
 */
export const LoadZipButtonArea: React.FC<LoadZipButtonAreaProps> = (props) => {
  const { t } = useTranslation();
  /** 処理中判定 */
  const [processing, setProcessing] = React.useState<boolean>(false);

  /**
   * ボタンを押した際の処理 \
   * zipファイルの再生成を発火する。
   */
  const OnSubmitClick = () => {
    if (props.zipFiles === null) return;
    const newZip = new JSZip();
    Log.info(`zipファイル名正規化開始`, "LoadZipButtonArea");
    setProcessing(true)
    ZipExtract(props.zipFiles, 0, newZip);
  };

  /**
   * 文字コードの選択を変更した際の処理。 \
   * 指定した文字コードでzipを再読み込みする。
   * @param e
   */
  const OnSelectChange = (e: SelectChangeEvent) => {
    props.setEncoding(e.target.value);
    props.setProcessing(true);
    props.setZipFiles(null);
    Log.info(`zip読込文字コード変更:${e.target.value}`, "LoadZipButtonArea");
    props.LoadZip(props.file, e.target.value);
  };

  /**
   * utf-8-macをutf-8に変換したzipファイルを再帰呼出しで生成する。
   * @param files zip内のファイル一覧
   * @param index 読み込むファイルのインデックス
   * @param newZip 新しく生成するzip
   */
  const ZipExtract = (
    files: { [key: string]: JSZip.JSZipObject },
    index: number,
    newZip: JSZip
  ) => {
    const k = Object.keys(files)[index];
    files[k].async("arraybuffer").then((result) => {
      newZip.file(k.normalize("NFC"), result);
      if (index < Object.keys(files).length - 1) {
        ZipExtract(files, index + 1, newZip);
      } else {
        Log.info(`zipファイル名正規化終了`, "LoadZipButtonArea");
        props.setZipFiles(newZip.files);
        setProcessing(false)
        props.setDialogOpen(false);
      }
    });
  };

  return (
    <>
      <FullWidthButton onClick={OnSubmitClick} disabled={processing} testId="loadZipSubbmitButton">
        {processing?<CircularProgress color="inherit" size={20} />:t("loadZipDialog.submit")}
      </FullWidthButton>
      <br />
      <FullWidthSelect
        label={t("loadZipDialog.encoding")}
        value={props.encoding}
        onChange={OnSelectChange}
        disabled={processing}
      >
        <MenuItem value={"utf-8"}>UTF-8</MenuItem>
        <MenuItem value={"Shift-Jis"}>Shift-JIS</MenuItem>
      </FullWidthSelect>
      <Divider />
    </>
  );
};

export interface LoadZipButtonAreaProps {
  /** 読み込んだファイル */
  file: File | null;
  /** zipのファイル名を解釈するための文字コード */
  encoding: string;
  /** 仮に読み込んだzipファイル。 */
  zipFiles: {
    [key: string]: JSZip.JSZipObject;
  } | null;
  /** zipを読み込む処理 */
  LoadZip: (file: File, encoding?: string) => void;
  /** ダイアログを表示するか否かを設定する。閉じる際に使用 */
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** 読込待ち判定用を変更する。 */
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  /** zipのファイル名を解釈するための文字コードを変更する。 */
  setEncoding: React.Dispatch<React.SetStateAction<string>>;
  /** 仮に読み込んだzipファイルを変更する。 */
  setZipFiles: React.Dispatch<
    React.SetStateAction<{
      [key: string]: JSZip.JSZipObject;
    } | null>
  >;
}
