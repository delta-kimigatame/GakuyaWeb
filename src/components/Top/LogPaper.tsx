import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import { BasePaper } from "../Common/BasePaper";
import { Log } from "../../lib/Logging";

/**
 * トップビューに表示する、更新履歴
 * @returns トップビューに表示する、更新履歴
 */
export const LogPaper: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <BasePaper
        title={t("error.log")}
        body={
          <Box sx={{ m: 1, p: 1 }}>
            {Log.datas.map((l) => (
              <>
                <Typography variant="body2">{l}</Typography>
                <Divider />
              </>
            ))}
          </Box>
        }
      />
    </>
  );
};