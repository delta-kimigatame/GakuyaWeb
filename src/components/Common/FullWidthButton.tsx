import * as React from "react";

import Button from "@mui/material/Button";

export const FullWidthButton: React.FC<{
  onClick?;
  disabled?: boolean;
  children:React.ReactNode;
  color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
  testId?:string
}> = (props) => {
  const onClick = props.onClick ? props.onClick : () => {};
  const color = props.color ? props.color : "inherit";
  return (
    <Button
      fullWidth
      variant="contained"
      sx={{ m: 1 }}
      onClick={onClick}
      size="large"
      color={color}
      disabled={props.disabled}
      data-testid={props.testId}
    >
      {props.children}
    </Button>
  );
};