import * as React from "react";
import { useTranslation } from "react-i18next";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

/**
 * ワーカー数設定メニュー
 * @param props {@link WorkersCountMenuProps}
 * @returns ワーカー数設定メニュー
 */
export const WorkersCountMenu: React.FC<WorkersCountMenuProps> = (props) => {
  const { t } = useTranslation();

  const handleWorkerCountChange = (event: any) => {
    const value = parseInt(event.target.value);
    props.setWorkersCount(value);
  };

  return (
    <MenuItem sx={{ display: 'flex', alignItems: 'center' }}>
      <ListItemIcon>
        <Avatar sx={{ width: 24, height: 24, fontSize: 16 }}>
          <WorkspacesIcon sx={{ fontSize: 14 }} />
        </Avatar>
      </ListItemIcon>
      <ListItemText>{t("menu.changeWorkersCount")}</ListItemText>
      <FormControl size="small" sx={{ minWidth: 60, marginLeft: 'auto' }}>
        <Select
          value={props.workersCount}
          onChange={handleWorkerCountChange}
          variant="standard"
          sx={{ fontSize: 14 }}
        >
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={6}>6</MenuItem>
          <MenuItem value={8}>8</MenuItem>
        </Select>
      </FormControl>
    </MenuItem>
  );
};

export interface WorkersCountMenuProps {
  /**ワーカー数 */
  workersCount: number;
  /**ワーカー数を変更する処理 */
  setWorkersCount: React.Dispatch<React.SetStateAction<number>>;
  /**メニューの表示制御 */
  setMenuAnchor: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
}
