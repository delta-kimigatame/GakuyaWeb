import * as React from "react";

import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export const CommonCheckBox: React.FC<{
  checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  disabled?: boolean;
}> = (props) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={props.checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            props.setChecked(e.target.checked);
          }}
          disabled={props.disabled}
        />
      }
      label={props.label}
    />
  );
};
