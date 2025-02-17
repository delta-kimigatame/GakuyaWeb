import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { CommonCheckBox } from "../Common/CommonCheckBox";

import { Log } from "../../Lib/Logging";
import { FileCheckFlags, IsDelete } from "./EditorView";
import { FullWidthButton } from "../Common/FullWidthButton";
import { FullWidthSelect } from "../Common/FullWidthSelect";
import { BasePaper } from "../Common/BasePaper";

export const FileCheckPanel: React.FC<FileCheckPanelProps> = (props) => {
  const { t } = useTranslation();

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

  const OnChangeRootDir = (e: SelectChangeEvent) => {
    props.setRootDir(e.target.value);
    Log.log(
      `rootDirの変更。${props.rootDir}->${e.target.value}`,
      "FileCheckPanel"
    );
  };
  const sortedFiles = React.useMemo(() => {
    return props.files.filter((f) => f.startsWith(props.rootDir)).sort();
  }, [props.files]);

  return (
    <>
      <FullWidthSelect
        label={t("editor.file_check.contentsdir.title")}
        value={props.rootDir}
        onChange={OnChangeRootDir}
      >
        {props.directories.map((d) => (
          <MenuItem value={d}>{d}</MenuItem>
        ))}
      </FullWidthSelect>
      <Typography variant="caption">
        {t("editor.file_check.contentsdir.description")}
      </Typography>
      <br />
      <br />
      <Divider />
      <br />
      <Typography variant="h6">
        {t("editor.file_check.remove.title")}
      </Typography>
      <FullWidthButton
        color="inherit"
        onClick={() => {
          OnAllClick("remove");
        }}
      >
        <Typography variant="caption">{t("editor.file_check.all")}</Typography>
      </FullWidthButton>
      <CommonCheckBox
        checked={
          props.flags.remove.read === undefined
            ? false
            : props.flags.remove.read
        }
        setChecked={() => {
          OnCheckBoxChange("remove", "read");
        }}
        label={t("editor.file_check.remove.read")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.remove.uspec === undefined
            ? false
            : props.flags.remove.uspec
        }
        setChecked={() => {
          OnCheckBoxChange("remove", "uspec");
        }}
        label={t("editor.file_check.remove.uspec")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.remove.setparam === undefined
            ? false
            : props.flags.remove.setparam
        }
        setChecked={() => {
          OnCheckBoxChange("remove", "setparam");
        }}
        label={t("editor.file_check.remove.setparam")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.remove.vlabeler === undefined
            ? false
            : props.flags.remove.vlabeler
        }
        setChecked={() => {
          OnCheckBoxChange("remove", "vlabeler");
        }}
        label={t("editor.file_check.remove.vlabeler")}
      />
      <br />
      <br />
      <Divider />
      <br />
      <Typography variant="h6">{t("editor.file_check.frq.title")}</Typography>
      <Typography variant="caption">
        {t("editor.file_check.frq.description")}
      </Typography>
      <FullWidthButton
        color="inherit"
        onClick={() => {
          OnAllClick("frq");
        }}
      >
        <Typography variant="caption">{t("editor.file_check.all")}</Typography>
      </FullWidthButton>
      <CommonCheckBox
        checked={
          props.flags.frq.frq === undefined ? false : props.flags.frq.frq
        }
        setChecked={() => {
          OnCheckBoxChange("frq", "frq");
        }}
        label={t("editor.file_check.frq.frq")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.pmk === undefined ? false : props.flags.frq.pmk
        }
        setChecked={() => {
          OnCheckBoxChange("frq", "pmk");
        }}
        label={t("editor.file_check.frq.pmk")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.frc === undefined ? false : props.flags.frq.frc
        }
        setChecked={() => {
          OnCheckBoxChange("frq", "frc");
        }}
        label={t("editor.file_check.frq.frc")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.vs4ufrq === undefined
            ? false
            : props.flags.frq.vs4ufrq
        }
        setChecked={() => {
          OnCheckBoxChange("frq", "vs4ufrq");
        }}
        label={t("editor.file_check.frq.vs4ufrq")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.world === undefined ? false : props.flags.frq.world
        }
        setChecked={() => {
          OnCheckBoxChange("frq", "world");
        }}
        label={t("editor.file_check.frq.world")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.llsm === undefined ? false : props.flags.frq.llsm
        }
        setChecked={() => {
          OnCheckBoxChange("frq", "llsm");
        }}
        label={t("editor.file_check.frq.llsm")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.frq.mrq === undefined ? false : props.flags.frq.mrq
        }
        setChecked={() => {
          OnCheckBoxChange("frq", "mrq");
        }}
        label={t("editor.file_check.frq.mrq")}
      />
      <br />
      <br />
      <Divider />
      <br />
      <Typography variant="h6">{t("editor.file_check.oto.title")}</Typography>
      <CommonCheckBox
        checked={props.flags.oto.root}
        setChecked={() => {
          OnCheckBoxChange("oto", "root");
        }}
        label={t("editor.file_check.oto.root")}
      />
      <br />
      <br />
      <Divider />
      <br />
      <Typography variant="h6">{t("editor.file_check.wav.title")}</Typography>
      <Typography variant="caption">
        {t("editor.file_check.wav.description")}
      </Typography>
      <FullWidthButton
        color="inherit"
        onClick={() => {
          OnAllClick("wav");
        }}
      >
        <Typography variant="caption">{t("editor.file_check.all")}</Typography>
      </FullWidthButton>
      <CommonCheckBox
        checked={
          props.flags.wav.stereo === undefined ? false : props.flags.wav.stereo
        }
        setChecked={() => {
          OnCheckBoxChange("wav", "stereo");
        }}
        label={t("editor.file_check.wav.stereo")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.wav.sampleRate === undefined
            ? false
            : props.flags.wav.sampleRate
        }
        setChecked={() => {
          OnCheckBoxChange("wav", "sampleRate");
        }}
        label={t("editor.file_check.wav.sampleRate")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.wav.depth === undefined ? false : props.flags.wav.depth
        }
        setChecked={() => {
          OnCheckBoxChange("wav", "depth");
        }}
        label={t("editor.file_check.wav.depth")}
      />
      <br />
      <br />
      <CommonCheckBox
        checked={
          props.flags.wav.dcoffset === undefined
            ? false
            : props.flags.wav.dcoffset
        }
        setChecked={() => {
          OnCheckBoxChange("wav", "dcoffset");
        }}
        label={t("editor.file_check.wav.dcoffset")}
      />
      <br />
      <br />
      <Divider />
      <br />
      <BasePaper
        title={t("editor.file_check.file_list")}
        body={
          <Box sx={{ maxHeight: 300, overflowY: "scroll" }}>
            {sortedFiles.map((f) => (
              <>
                <Typography
                  variant="caption"
                  color={IsDelete(f, props.flags) ? "error" : "inherit"}
                >
                  {f}
                </Typography>
                <Divider />
              </>
            ))}
          </Box>
        }
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
