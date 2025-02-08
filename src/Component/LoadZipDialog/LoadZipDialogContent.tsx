import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";

import { LoadZipButtonArea } from "./LoadZipButtonArea";

/**
 * zip読込待ちダイアログのボディ部分
 * @param props {@link LoadZipDialogContentProps}
 * @returns zip読込待ちダイアログのボディ部分
 */
export const LoadZipDialogContent: React.FC<LoadZipDialogContentProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <DialogContent>
        <Box sx={{ p: 1 }}>
          <Box sx={{ pl: 1 }}>
            {props.processing ? (
              <Box sx={{ textAlign: "center", minHeight: 150 }}>
                <CircularProgress size={100} sx={{ maxWidth: "100%" }} />
              </Box>
            ) : props.zipFiles !== null ? (
              <>
                <LoadZipButtonArea
                  file={props.file}
                  encoding={props.encoding}
                  zipFiles={props.zipFiles}
                  LoadZip={props.LoadZip}
                  setDialogOpen={props.setDialogOpen}
                  setProcessing={props.setProcessing}
                  setEncoding={props.setEncoding}
                  setZipFiles={props.setZipFiles}
                />
                {Object.keys(props.zipFiles).map((f) => (
                  <>
                    <Typography variant="body2">{f}</Typography>
                    <Divider />
                  </>
                ))}
              </>
            ) : (
              <>
                <Typography variant="body2">
                  {t("loadZipDialog.error")}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
    </>
  );
};

export interface LoadZipDialogContentProps {
  /** 読み込んだファイル */
  file: File | null;
  /** 読込待ち判定用 */
  processing: boolean;
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
};
