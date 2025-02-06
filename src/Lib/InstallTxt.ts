/**
 * UTAUの音源用install.txtファイルを扱う
 */

export class InstallTxt {
  /** UTAU音源であればvoiceset固定 */
  private archiveType_: string = "voiceset";

  /** 解凍先フォルダ */
  private folder_: string;

  /** インストールしたいファイルが入っているフォルダ */
  private contentsDir_?: string;

  /** インストール時に表示される一行の説明 */
  private description_?: string;

  /** UTAU音源であればvoiceset固定 */
  get archiveType(): string {
    return this.archiveType_;
  }

  /** 解凍先フォルダ */
  get folder(): string {
    return this.folder_;
  }
  /** インストールしたいファイルが入っているフォルダ */
  get contentsDir(): string {
    return this.contentsDir_;
  }
  /** インストール時に表示される一行の説明 */
  get description(): string {
    return this.description_;
  }
  /**
   *
   * @param values
   */
  constructor(values: InstallTxtValue) {
    if (!values.txt && !values.folder) {
      throw new Error("txtかfolderのどちらかが必要です");
    }
    if (values.txt) {
      values = this.ParseTxt(values.txt);
    }
    this.folder_ = values.folder;
    if (values.contentsDir) {
      this.contentsDir_ = values.contentsDir;
    }
    if (values.description) {
      this.description_ = values.description;
    }
  }

  private ParseTxt(txt: string): InstallTxtValue {
    /** install.txtを1行毎に格納したArray */
    const lines: Array<string> = txt.replace(/\r/g, "").split("\n");
    const values: InstallTxtValue = { folder: "" };
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("type=")) {
      } else if (lines[i].startsWith("folder=")) {
        values.folder = lines[i].replace("folder=", "");
      } else if (lines[i].startsWith("contentsdir=")) {
        values.contentsDir = lines[i].replace("contentsdir=", "");
      } else if (lines[i].startsWith("description=")) {
        values.description = lines[i].replace("description=", "");
      }
    }
    return values;
  }

  OutputTxt(): string {
    const txt =
      "type=voiceset\n" +
      "folder=" +
      this.folder_ +
      "\n" +
      (this.contentsDir_ ? "contentsdir=" + this.contentsDir_ + "\n" : "") +
      (this.description_ ? "description=" + this.description_ + "\n" : "");
    return txt;
  }
}

export interface InstallTxtValue {
  /** 読み込んだテキストデータ */
  txt?: string;
  /** 解凍先フォルダ */
  folder?: string;
  /** インストールしたいファイルが入っているフォルダ */
  contentsDir?: string;
  /** インストール時に表示される一行の説明 */
  description?: string;
}
