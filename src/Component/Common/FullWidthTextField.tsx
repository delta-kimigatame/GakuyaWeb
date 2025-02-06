import * as React from "react";

import TextField from "@mui/material/TextField";

export const FullWidthTextField: React.FC<{
  onChange;
  value;
  label;
  type: React.HTMLInputTypeAttribute;
}> = (props) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      sx={{
        m: 1,
      }}
      type={props.type}
      label={props.label}
      value={props.value}
      onChange={props.onChange}
    />
  );
};