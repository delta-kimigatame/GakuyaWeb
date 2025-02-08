import * as React from "react";
import JSZip from "jszip";

import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";

import { LoadZipDialogContent } from "./LoadZipDialogContent";
import { LoadZipDialogTitle } from "./LoadZipDialogTitle";

import { Log } from "../../Lib/Logging";

/**
 * zip読込待ちダイアログ \
 * ファイル名の一覧を表示し、必要に応じて読込文字コードを変更する機能を有する。
 * @param props {@link LoadZipDialogProps}
 * @returns zip読込待ちダイアログ
 */
export const LoadZipDialog: React.FC<LoadZipDialogProps> = (props) => {
  /** 読込待ち判定用 */
  const [processing, setProcessing] = React.useState<boolean>(false);
  /** zipファイル。文字コードを確認するために仮で展開するため、親コンポーネントとは独立してデータを保持する。 */
  const [zipFiles, setZipFiles] = React.useState<{
    [key: string]: JSZip.JSZipObject;
  } | null>(null);
  /** zipのファイル名を解釈するための文字コード */
  const [encoding, setEncoding] = React.useState<string>("utf-8");

  /**
   * zipを指定した文字コードで解凍する
   * @param file 読み込んだファイル
   * @param encoding 文字コード
   */
  const LoadZip = (file: File, encoding: string = "utf-8") => {
    const zip = new JSZip();
    const td = new TextDecoder(encoding);
    Log.log(`zip読込。文字コード:${encoding}`,"LoadZipDialog")
    props.setZipFileName(file.name);
    zip
      .loadAsync(file, {
        decodeFileName: (fileNameBinary: Uint8Array) =>
          td.decode(fileNameBinary),
      })
      .then((z) => {
        setProcessing(false);
        setZipFiles(z.files);
        Log.log(`zip読込完了`,"LoadZipDialog")
      });
  };

  /** ファイルが変更された際の処理。 */
  React.useEffect(() => {
    if (props.file === null) {
      props.setDialogOpen(false);
    } else {
      setProcessing(true);
      LoadZip(props.file);
    }
  }, [props.file]);

  return (
    <>
      <Dialog
        onClose={() => {
          props.setDialogOpen(false);
        }}
        open={props.dialogOpen}
        fullScreen
      >
        <LoadZipDialogTitle setDialogOpen={props.setDialogOpen} />
        <Divider />
        <LoadZipDialogContent
          file={props.file}
          processing={processing}
          encoding={encoding}
          zipFiles={zipFiles}
          LoadZip={LoadZip}
          setDialogOpen={props.setDialogOpen}
          setProcessing={setProcessing}
          setEncoding={setEncoding}
          setZipFiles={props.setZipFiles}
        />
      </Dialog>
    </>
  );
};

export interface LoadZipDialogProps {
  /** 読み込んだファイル */
  file: File | null;
  /** ダイアログを表示するか否か */
  dialogOpen: boolean;
  /** ダイアログを表示するか否かを設定する。閉じる際に使用 */
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** zipファイルを設定する。読込完了を上位コンポーネントに返すために使用 */
  setZipFiles: React.Dispatch<
    React.SetStateAction<{
      [key: string]: JSZip.JSZipObject;
    } | null>
  >;
  /** 読み込んだファイル名を変更する処理 */
  setZipFileName: React.Dispatch<React.SetStateAction<string>>;
}
