import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

/**
 * Xに共有するボタンを作るための色を設定したstyledコンポーネント
 */
export const XButton:any = styled(Button)(({ theme }) => ({
    color: '#FFFFFF',
    backgroundColor: '#101010',
    '&:hover': {
        backgroundColor: '#303030'
    }
}))