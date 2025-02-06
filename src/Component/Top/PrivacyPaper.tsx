import * as React from "react";
import { useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { BasePaper } from "../Common/BasePaper";

/**
 * トップビューに表示する、プライバシーポリシー
 * @returns トップビューに表示する、プライバシーポリシー
 */
export const PrivacyPaper: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <BasePaper
        title={t("top.privacy")}
        body={<><Typography variant="caption">
        <ul>
          <li>{t("top.privacyAnalytics")}</li>
          <li>{t("top.privacyCookie")}</li>
        </ul>
      </Typography>
        </>}
      />
    </>
  );
};