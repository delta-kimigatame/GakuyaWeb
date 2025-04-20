import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import { FileCheckFlags, IsDelete } from "../../../features/Editor/EditorView";
import { BasePaper } from "../../Common/BasePaper";

export const FileList: React.FC<FileListProps> = (props) => {
  const { t } = useTranslation();

  const sortedFiles = React.useMemo(() => {
    return props.files.filter((f) => f.startsWith(props.rootDir)).sort();
  }, [props.files]);
  const colorFields = React.useMemo(() => {
    let c = {};
    sortedFiles.forEach((f) => {
      c[f] = IsDelete(f, props.flags) ? "error" : "inherit";
    });
    return c;
  }, [sortedFiles]);

  return (
    <>
      <Box>
        {sortedFiles.map((f) => (
          <>
            <Typography variant="caption" color={colorFields[f]}>
              {f}
            </Typography>
            <Divider />
          </>
        ))}
      </Box>
    </>
  );
};

export interface FileListProps {
  /** rootdir */
  rootDir: string;
  /** ファイル一覧 */
  files: string[];
  /** 書出し設定 */
  flags: FileCheckFlags;
}
