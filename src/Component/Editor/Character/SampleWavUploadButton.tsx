import * as React from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";

import { CharacterTxt } from "../../../Lib/CharacterTxt";


import { Log } from "../../../Lib/Logging";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const SampleWavUploadButton: React.FC<SampleWavUploadButtonProps> = (
  props
) => {
  const { t } = useTranslation();
  /** 隠し表示する<input>へのref */
  const inputRef = React.useRef(null);
  /** sample音声を読み込んだファイル */
  const [readFile, setReadFile] = React.useState<File | null>(null);
  /** 外部から読み込んだサンプル音声をdataurlに変換したもの */
  const [wavSrc, setWavSrc] = React.useState<string>("");

  /**
   * inputのファイルが変更した際のイベント \
   * nullやファイル数が0の時は何もせず終了する。 \
   * ファイルが含まれている場合、1つ目のファイルを`readFile`に代入する。
   * @param e
   */
  const OnFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files.length === 0) return;
    setReadFile(e.target.files[0]);
    Log.log(
      `音声ファイル読み込み。${e.target.files[0].name}`,
      "SampleWavUploadButton"
    );
  };
  /**
   * ボタンをクリックした際の処理 \
   * 隠し要素であるinputのクリックイベントを発火する。
   */
  const OnButtonClick = () => {
    inputRef.current.click();
  };

  /** 外部からサンプル音声を読み込んだ際の処理 */
  React.useEffect(() => {
    if (readFile !== null) {
      setWavSrc(URL.createObjectURL(readFile));
      readFile.arrayBuffer().then((buf) => {
        props.setSampleBuf(buf);
      });
    }
  }, [readFile]);

  return (
    <>
      <input
        type="file"
        onChange={OnFileChange}
        hidden
        ref={inputRef}
        accept="audio/wav"
      ></input>
      <FullWidthButton onClick={OnButtonClick} color="primary">
        {t("editor.character.field.uploadSample")}
      </FullWidthButton>
      {wavSrc !== "" && (
        <>
          <audio src={wavSrc} controls style={{ margin: 8 }}></audio>
          <br />
        </>
      )}
    </>
  );
};

export interface SampleWavUploadButtonProps {
  /** サンプル音声のアップロード */
  setSampleBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
}
