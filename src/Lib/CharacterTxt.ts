/**
 * UTAUの音源用character.txtファイルを扱う
 */

export class CharacterTxt {
  /** UTAU音源の名前 */
  private name_: string;

  /** アイコン画像への相対パス */
  private image_: string;

  /** sample音声への相対パス */
  private sample_?: string;

  /** 管理人の名義 */
  private author_?: string;

  /** webページ */
  private web_?: string;

  /** バージョン */
  private version_?: string;

  /** UTAU音源の名前 */
  get name(): string {
    return this.name_;
  }

  /** アイコン画像への相対パス */
  get image(): string {
    return this.image_;
  }
  /** sample音声への相対パス */
  get sample(): string {
    return this.sample_;
  }
  /** 管理人の名義 */
  get author(): string {
    return this.author_;
  }
  /** webページ */
  get web(): string {
    return this.web_;
  }
  /** バージョン */
  get version(): string {
    return this.version_;
  }
  /**
   *
   * @param values
   */
  constructor(values: CharacterTxtValue) {
    if (!values.txt && !values.name) {
      throw new Error("txtかnameのどちらかが必要です");
    }
    if (values.txt) {
      values = this.ParseTxt(values.txt);
    }
    this.name_ = values.name;
    if (values.image) {
      this.image_ = values.image;
    }
    if (values.sample) {
      this.sample_ = values.sample;
    }
    if (values.author) {
      this.author_ = values.author;
    }
    if (values.web) {
      this.web_ = values.web;
    }
    if (values.version) {
      this.version_ = values.version;
    }
  }

  /**
   *
   * @param txt character.txt
   * @returns character.txtから読み取られたパラメーター
   */
  private ParseTxt(txt: string): CharacterTxtValue {
    /** character.txtを1行毎に格納したArray */
    const lines: Array<string> = txt.replace(/\r/g, "").split("\n");
    const values: CharacterTxtValue = { name: "" };
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("name=")) {
        values.name = lines[i].replace("name=", "");
      } else if (lines[i].startsWith("image=")) {
        values.image = lines[i].replace("image=", "");
      } else if (lines[i].startsWith("sample=")) {
        values.sample = lines[i].replace("sample=", "");
      } else if (lines[i].startsWith("author=")) {
        values.author = lines[i].replace("author=", "");
      } else if (lines[i].startsWith("web=")) {
        values.web = lines[i].replace("web=", "");
      } else if (lines[i].startsWith("version=")) {
        values.version = lines[i].replace("version=", "");
      } else if (lines[i].startsWith("name:")) {
        values.name = lines[i].replace("name:", "");
      } else if (lines[i].startsWith("image:")) {
        values.image = lines[i].replace("image:", "");
      } else if (lines[i].startsWith("sample:")) {
        values.sample = lines[i].replace("sample:", "");
      } else if (lines[i].startsWith("author:")) {
        values.author = lines[i].replace("author:", "");
      } else if (lines[i].startsWith("web:")) {
        values.web = lines[i].replace("web:", "");
      } else if (lines[i].startsWith("version:")) {
        values.version = lines[i].replace("version:", "");
      }
    }
    return values;
  }

  OutputTxt(): string {
    const txt =
      "name=" +
      this.name_ +
      "\n" +
      (this.image_ ? "image=" + this.image_ + "\n" : "") +
      (this.sample_ ? "sample=" + this.sample_ + "\n" : "") +
      (this.author_ ? "author=" + this.author_ + "\n" : "") +
      (this.web_ ? "web=" + this.web_ + "\n" : "") +
      (this.version_ ? "version=" + this.version_ + "\n" : "");
    return txt;
  }
}

export interface CharacterTxtValue {
  /** 読み込んだテキストデータ */
  txt?: string;
  /** UTAU音源の名前 */
  name?: string;
  /** アイコン画像への相対パス */
  image?: string;
  /** sample音声への相対パス */
  sample?: string;
  /** 管理人の名義 */
  author?: string;
  /** webページ */
  web?: string;
  /** バージョン */
  version?: string;
}
