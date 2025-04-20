import * as React from "react";

import Divider from "@mui/material/Divider";

import { Log } from "../../lib/Logging";
import { FileCheckFlags } from "./EditorView";
import { WavArea } from "../../components/Editor/FileCheck/WavArea";
import { OtoArea } from "../../components/Editor/FileCheck/OtoArea";
import { FrqArea } from "../../components/Editor/FileCheck/FrqArea";
import { RemoveFileArea } from "../../components/Editor/FileCheck/RemoveFileArea";
import { SelectRootDir } from "./FileCheck/SelectRootDir";

export const FileCheckPanel: React.FC<FileCheckPanelProps> = (props) => {
  const OnCheckBoxChange = (key1: string, key2: string) => {
    const f: FileCheckFlags = { ...props.flags };
    const newValue = key2 in f[key1] ? !f[key1][key2] : true;
    f[key1][key2] = newValue;
    Log.log(`flags.${key1}.${key2}の変更。${newValue}`, "FileCheckPanel");
    props.setFlags(f);
  };

  const OnAllClick = (key1) => {
    const f: FileCheckFlags = { ...props.flags };
    if (key1 === "remove") {
      f["remove"]["read"] = true;
      f["remove"]["uspec"] = true;
      f["remove"]["setparam"] = true;
      f["remove"]["vlabeler"] = true;
    } else if (key1 === "frq") {
      f["frq"]["frq"] = true;
      f["frq"]["pmk"] = true;
      f["frq"]["frc"] = true;
      f["frq"]["vs4ufrq"] = true;
      f["frq"]["world"] = true;
      f["frq"]["llsm"] = true;
      f["frq"]["mrq"] = true;
    } else if (key1 === "wav") {
      f["wav"]["stereo"] = true;
      f["wav"]["sampleRate"] = true;
      f["wav"]["depth"] = true;
      f["wav"]["dcoffset"] = true;
    }
    Log.log(`flags.${key1}をすべて変更。${true}`, "FileCheckPanel");
    props.setFlags(f);
  };

  return (
    <>
      <SelectRootDir
        rootDir={props.rootDir}
        setRootDir={props.setRootDir}
        directories={props.directories}
      />
      <Divider />
      <br />
      <RemoveFileArea
        flags={props.flags}
        OnCheckBoxChange={OnCheckBoxChange}
        OnAllClick={OnAllClick}
      />
      <Divider />
      <br />
      <FrqArea
        flags={props.flags}
        OnCheckBoxChange={OnCheckBoxChange}
        OnAllClick={OnAllClick}
      />
      <Divider />
      <br />
      <OtoArea flags={props.flags} OnCheckBoxChange={OnCheckBoxChange} />
      <Divider />
      <br />
      <WavArea
        flags={props.flags}
        OnCheckBoxChange={OnCheckBoxChange}
        OnAllClick={OnAllClick}
      />
    </>
  );
};

export interface FileCheckPanelProps {
  /** rootdir */
  rootDir: string;
  /** rootdirの変更 */
  setRootDir: React.Dispatch<React.SetStateAction<string>>;
  /** ファイル一覧 */
  files: string[];
  /** フォルダ一覧 */
  directories: string[];
  /** 書出し設定 */
  flags: FileCheckFlags;
  /** 書出し設定の更新 */
  setFlags: React.Dispatch<React.SetStateAction<FileCheckFlags>>;
}
