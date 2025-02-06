import * as React from "react";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export const BasePaper: React.FC<{ title: string; body }> = ({
  title,
  body,
}) => {
  return (
    <Paper elevation={2} sx={{ m: 1, p: 2 }}>
      <Typography variant="h6">{title}</Typography>
      <Divider />
      {body}
    </Paper>
  );
};