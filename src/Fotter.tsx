import * as React from "react";

import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeOptions } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import XIcon from "@mui/icons-material/X";

import { XButton } from "./XButton";
import { setting } from "./settings/setting";

/**
 * フッタ
 * @param props {@link FooterProps}
 * @returns フッタ
 */
export const Footer: React.FC<FooterProps> = (props) => {
  const theme = props.theme;
  const { t } = useTranslation();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  return (
    <>
      <Divider />
      <Box
        sx={{
          justifyContent: "space-between",
          display: matches ? "flex" : "block",
          p: 2,
        }}
      >
        <Box sx={{ flex: 1, order: 1 }}>
          <Typography>
            <Link
              variant="body2"
              color="inherit"
              href={setting.developerXUrl}
            >
              {t("footer.developerx")}
            </Link>{" "}
            <br />
            <Link variant="body2" color="inherit" href={setting.githubUrl}>
              {t("footer.github")}
            </Link>{" "}
            <br />
            <Link variant="body2" color="inherit" href={setting.discordUrl}>
              {t("footer.discord")}
            </Link>{" "}
            <br />
            <br />
          </Typography>
        </Box>
        <Box
          sx={{
            textAlign: matches ? "right" : "left",
            flex: 1,
            order: matches ? 3 : 2,
          }}
        >
          <Typography variant="caption">
            {t("footer.disclaimer")}
            <br />
            <br />
            {t("footer.disclaimer2")}
          </Typography>
          <br />
          <br />
        </Box>
        <Box
          sx={{
            textAlign: matches ? "center" : "left",
            flex: 1,
            order: matches ? 2 : 3,
          }}
        >
          <Typography variant="body2">
            きみがため
            <br />
            <br />
          </Typography>
          <XButton
            startIcon={<XIcon />}
            href={
              "https://twitter.com/intent/tweet?text=" +
              setting.siteName +
              " - " +
              setting.productName +
              "- " +
              setting.productUrl
            }
            target="blank_"
          >
            {t("xbutton.share")}
          </XButton>
        </Box>
      </Box>
    </>
  );
};

export interface FooterProps {
  /** テーマ設定 */
  theme:ThemeOptions;
};