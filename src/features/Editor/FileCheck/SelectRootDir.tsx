import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { Log } from "../../../lib/Logging";
import { FullWidthSelect } from "../../../components/Common/FullWidthSelect";

export const SelectRootDir: React.FC<SelectRootDirProps> = (props) => {
  const { t } = useTranslation();

  const OnChangeRootDir = (e: SelectChangeEvent) => {
    props.setRootDir(e.target.value);
    Log.info(
      `rootDirの変更。${props.rootDir}->${e.target.value}`,
      "FileCheckPanel"
    );
  };

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
    </>
  );
};

export interface SelectRootDirProps {
  /** rootdir */
  rootDir: string;
  /** rootdirの変更 */
  setRootDir: React.Dispatch<React.SetStateAction<string>>;
  /** フォルダ一覧 */
  directories: string[];
}
