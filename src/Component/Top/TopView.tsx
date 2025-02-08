import * as React from "react";
import JSZip from "jszip";

import { PrivacyPaper } from "./PrivacyPaper";
import { RulePaper } from "./RulePaper";
import { TopPaper } from "./TopPaper";
import { HistoryPaper } from "./HistoryPaper";

/**
 * zipデータを読み込む前の画面
 * @param props {@link TopViewProps}
 * @returns zipデータを読み込む前の画面
 */
export const TopView: React.FC<TopViewProps> = (props) => {
  return (
    <>
      <TopPaper
        readZip={props.readZip}
        setReadZip={props.setReadZip}
        setZipFileName={props.setZipFileName}
      />
      <RulePaper />
      <PrivacyPaper />
      <HistoryPaper />
    </>
  );
};

export interface TopViewProps {
  /** 読み込んだzipのデータ */
  readZip: { [key: string]: JSZip.JSZipObject } | null;
  /** 読み込んだzipのデータを登録する処理 */
  setReadZip: React.Dispatch<
    React.SetStateAction<{
      [key: string]: JSZip.JSZipObject;
    } | null>
  >;
  /** 読み込んだファイル名を変更する処理 */
  setZipFileName: React.Dispatch<React.SetStateAction<string>>;
  /** zipのファイル名 */
  zipFileName:string
}