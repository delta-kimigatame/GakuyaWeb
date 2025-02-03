import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import { BasePaper } from "../Common/BasePaper";

/**
 * トップビューに表示する、更新履歴
 * @returns トップビューに表示する、更新履歴
 */
export const HistoryPaper: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <BasePaper
        title={t("top.history")}
        body={
          <Box sx={{ m: 1, p: 1 }}>
            {(t("top.changelog", { returnObjects: true }) as Array<string>).map(
              (l) => (
                <>
                  <Typography variant="body2">{l}</Typography>
                  <Divider />
                </>
              )
            )}
          </Box>
        }
      />
    </>
  );
};