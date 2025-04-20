import * as React from "react";
import { useTranslation } from "react-i18next";

import { FullWidthButton } from "../../../components/Common/FullWidthButton";

import { OutputBitmap } from "../../../lib/UtauBitmap";
import { utauIcon } from "../../../settings/setting";
import { Log } from "../../../lib/Logging";

export const Png2BmpCanvas: React.FC<Png2BmpCanvasProps> = (props) => {
  const { t } = useTranslation();
  /** 隠し表示する<input>へのref */
  const inputRef = React.useRef(null);
  /** 変換後のbitmapのdataurl */
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);
  /** 読み込んだファイル */
  const [readFile, setReadFile] = React.useState<File | null>(null);
  /** 変換用キャンバスの設定 */
  const context = document.createElement("canvas").getContext("2d");
  context.canvas.width = utauIcon.width;
  context.canvas.height = utauIcon.height;
  React.useEffect(() => {
    if (readFile !== null) {
      const objectUrl = URL.createObjectURL(readFile);
      const img = new Image();
      img.src = objectUrl;
      img.onload = () => {
        Log.log(`画像読込完了。サイズ[${img.naturalWidth},${img.naturalHeight}]`, "Png2BmpCanvas");
        const maxSize = Math.max(img.naturalWidth, img.naturalHeight);
        const afterWidth = Math.floor(
          (img.naturalWidth * utauIcon.width) / maxSize
        );
        const afterHeight = Math.floor(
          (img.naturalHeight * utauIcon.height) / maxSize
        );
        context.drawImage(
          img,
          0,
          0,
          img.naturalWidth,
          img.naturalHeight,
          Math.floor((utauIcon.width - afterWidth) / 2),
          Math.floor((utauIcon.height - afterHeight) / 2),
          afterWidth,
          afterHeight
        );
        Log.log(`canvasに描画`, "Png2BmpCanvas");
        const pixelInfo: Array<{ r: number; g: number; b: number }> =
          new Array();
        for (let i = utauIcon.height - 1; i >= 0; i--) {
          for (let j = 0; j < utauIcon.width; j++) {
            const value = context.getImageData(j, i, 1, 1);
            pixelInfo.push({
              r: value.data[0],
              g: value.data[1],
              b: value.data[2],
            });
          }
        }
        Log.log(`pixelデータ取得`, "Png2BmpCanvas");
        const bitmapBuf = OutputBitmap(
          utauIcon.width,
          utauIcon.height,
          utauIcon.depth,
          pixelInfo
        );
        Log.log(`bitmapに変換`, "Png2BmpCanvas");
        const bitmapBlob = new Blob([bitmapBuf], { type: "image/bmp" });
        const newUrl = URL.createObjectURL(bitmapBlob);
        setImgSrc(newUrl);
        props.setImgBuf(bitmapBuf)
      };
    }
  }, [readFile]);

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
    Log.log(`ファイル読み込み。${e.target.files[0].name}`, "Png2BmpCanvas");
  };
  /**
   * ボタンをクリックした際の処理 \
   * 隠し要素であるinputのクリックイベントを発火する。
   */
  const OnButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <>
      <input
        type="file"
        onChange={OnFileChange}
        hidden
        ref={inputRef}
        accept="image/png,image/jpeg,image/gif,image/bmp"
      ></input>
      <FullWidthButton onClick={OnButtonClick} color="primary">{t("editor.character.convertBmp")}</FullWidthButton>
      {imgSrc !== null && <img src={imgSrc} />}
    </>
  );
};

export interface Png2BmpCanvasProps {
  /** 変換後の画像を親オブジェクトに伝える処理 */
  setImgBuf: React.Dispatch<React.SetStateAction<ArrayBuffer | null>>;
}
