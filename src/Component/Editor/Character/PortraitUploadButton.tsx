import * as React from "react";
import { useTranslation } from "react-i18next";

import { Log } from "../../../Lib/Logging";
import { FullWidthButton } from "../../Common/FullWidthButton";

export const PortraitUploadButton: React.FC<PortraitUploadButtonProps> = (
  props
) => {
  const { t } = useTranslation();
  /** 隠し表示する<input>へのref */
  const inputRef = React.useRef(null);
  /** 立ち絵を読み込んだファイル */
  const [readFile, setReadFile] = React.useState<File | null>(null);
  /** 外部から読み込んだ立ち絵をdataurlに変換したもの */
  const [portraitSrc, setPortraitSrc] = React.useState<string>("");

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
      `立ち絵読み込み。${e.target.files[0].name}`,
      "PortraitUploadButton"
    );
  };
  /**
   * ボタンをクリックした際の処理 \
   * 隠し要素であるinputのクリックイベントを発火する。
   */
  const OnButtonClick = () => {
    inputRef.current.click();
  };

  /** 外部から立ち絵を読み込んだ際の処理 */
  React.useEffect(() => {
    if (readFile !== null) {
      setPortraitSrc(URL.createObjectURL(readFile));
      readFile.arrayBuffer().then((buf) => {
        props.setPortraitBuf(buf);
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
        accept="image/png"
      ></input>
      <FullWidthButton onClick={OnButtonClick} color="primary">
        {t("editor.characterYaml.PortraitUpload")}
      </FullWidthButton>
      {portraitSrc !== "" && (
        <>
          <img
            src={portraitSrc}
            style={{
              margin: 8,
              maxWidth: "100%",
              opacity: props.opacity,
            }}
          />
          <br />
        </>
      )}
    </>
  );
};

export interface PortraitUploadButtonProps {
  /** サンプル音声のアップロード */
  setPortraitBuf: React.Dispatch<React.SetStateAction<ArrayBuffer>>;
  /** 透明度 */
  opacity: number;
}
