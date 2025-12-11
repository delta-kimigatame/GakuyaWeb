import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import { LoadZipDialog } from "../../../src/features/LoadZipDialog/LoadZipDialog";
import JSZip from "jszip";

const meta = {
  title: "Components/LoadZipDialog/LoadZipDialog",
  component: LoadZipDialog,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoadZipDialog>;

export default meta;
type Story = StoryObj<typeof LoadZipDialog>;

/**
 * ダイアログを開いた状態（正常読み込み）
 * UTF-8エンコードのサンプルファイルで、ファイル名が正しく表示される例
 */
export const Opened: Story = {
  render: () => {
    const [dialogOpen, setDialogOpen] = useState(true);
    const [zipFiles, setZipFiles] = useState<{
      [key: string]: JSZip.JSZipObject;
    } | null>(null);
    const [zipFileName, setZipFileName] = useState<string>("");

    // UTF-8エンコードのサンプルzipファイルを作成
    const createSampleFile = async () => {
      const zip = new JSZip();
      zip.file("あ.wav", "dummy audio data");
      zip.file("い.wav", "dummy audio data");
      zip.file("う.wav", "dummy audio data");
      zip.file("oto.ini", "sample oto.ini content");
      zip.file("character.txt", "name=サンプル音源");
      
      const blob = await zip.generateAsync({ type: "blob" });
      return new File([blob], "sample_utf8.zip", { type: "application/zip" });
    };

    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleFile().then(setFile);
    }, []);

    if (!file) {
      return <div>Loading...</div>;
    }

    return (
      <LoadZipDialog
        file={file}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        setZipFiles={setZipFiles}
        setZipFileName={setZipFileName}
      />
    );
  },
};

/**
 * Shift-JISファイル名の文字化け（samples/sjis_CV_jp.zip）
 * デフォルトのUTF-8で読み込むため、ファイル名が文字化けする例
 */
export const CharacterCorruption: Story = {
  render: () => {
    const [dialogOpen, setDialogOpen] = useState(true);
    const [zipFiles, setZipFiles] = useState<{
      [key: string]: JSZip.JSZipObject;
    } | null>(null);
    const [zipFileName, setZipFileName] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
      // 実際のサンプルZIPファイルを読み込む
      fetch('samples/sjis_CV_jp.zip')
        .then(res => res.blob())
        .then(blob => {
          const sampleFile = new File([blob], 'sjis_CV_jp.zip', { type: 'application/zip' });
          setFile(sampleFile);
        });
    }, []);

    if (!file) {
      return <div>Loading...</div>;
    }

    return (
      <LoadZipDialog
        file={file}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        setZipFiles={setZipFiles}
        setZipFileName={setZipFileName}
      />
    );
  },
};
