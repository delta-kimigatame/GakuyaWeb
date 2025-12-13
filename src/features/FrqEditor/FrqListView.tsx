/**
 * 周波数表一覧画面
 * 全wavファイルのfrqサムネイルを一覧表示し、生成・編集への遷移を管理
 */

import React from 'react';
import { Box, Pagination, Typography, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FrqThumbnail } from '../../components/FrqEditor/FrqThumbnail';
import { FrqEditorView } from './FrqEditorView';
import { Frq } from '../../lib/UtauFrq';
import { FRQ_CONSTANTS } from '../../settings/frqConstants';
import { GenerateFrqWorkerPool } from '../../services/workerPool';
import { Wave } from 'utauwav';
import { Log } from '../../lib/Logging';

export interface ZipFiles {
  [fileName: string]: {
    async: (type: 'arraybuffer' | 'string' | 'blob') => Promise<ArrayBuffer | string | Blob>;
  };
}

export interface FrqListViewProps {
  /** zipファイルの内容 */
  zipFiles: ZipFiles;
  /** Worker Pool for FRQ generation */
  workerPool: GenerateFrqWorkerPool | null;
  /** 1ページあたりの表示件数 */
  itemsPerPage?: number;
  /** テーマモード */
  mode: 'light' | 'dark';
  /** 更新されたfrqを保存するコールバック */
  onFrqUpdate?: (wavFileName: string, frq: Frq) => void;
}

interface FrqState {
  frq: Frq | null;
  isGenerating: boolean;
  progress: number;
}

/**
 * 周波数表一覧ビュー
 */
export const FrqListView: React.FC<FrqListViewProps> = ({
  zipFiles,
  workerPool,
  itemsPerPage = FRQ_CONSTANTS.DEFAULT_ITEMS_PER_PAGE,
  mode,
  onFrqUpdate,
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [frqStates, setFrqStates] = React.useState<Map<string, FrqState>>(new Map());
  const [containerHeight, setContainerHeight] = React.useState(0);
  
  // 編集画面の状態管理
  const [editingWavFile, setEditingWavFile] = React.useState<string | null>(null);
  const editingFrq = editingWavFile ? frqStates.get(editingWavFile)?.frq : null;

  // wavファイルのリストを取得
  const wavFiles = React.useMemo(() => {
    return Object.keys(zipFiles).filter((name) => name.toLowerCase().endsWith('.wav'));
  }, [zipFiles]);

  // frqファイルの存在を確認
  const frqFileMap = React.useMemo(() => {
    const map = new Map<string, string>();
    Object.keys(zipFiles).forEach((name) => {
      if (name.toLowerCase().endsWith('.frq')) {
        const wavName = name.slice(0, -4).replace(/_wav$/, '') + '.wav';
        map.set(wavName, name);
      }
    });
    return map;
  }, [zipFiles]);

  // 初期化：全wavファイルの状態を初期化
  React.useEffect(() => {
    const initializeFrqs = async () => {
      const newStates = new Map<string, FrqState>();

      for (const wavName of wavFiles) {
        const frqFileName = frqFileMap.get(wavName);
        if (frqFileName) {
          // frqファイルが存在する場合は読み込み
          try {
            const frqBuffer = await zipFiles[frqFileName].async('arraybuffer');
            const frq = new Frq({ buf: frqBuffer as ArrayBuffer });
            newStates.set(wavName, { frq, isGenerating: false, progress: 1 });
          } catch (error) {
            Log.error(`${wavName}のfrq読み込みに失敗: ${error}`, 'FrqListView.initializeFrqs');
            newStates.set(wavName, { frq: null, isGenerating: false, progress: 0 });
          }
        } else {
          newStates.set(wavName, { frq: null, isGenerating: false, progress: 0 });
        }
      }

      setFrqStates(newStates);
    };

    initializeFrqs();
  }, [wavFiles, frqFileMap, zipFiles]);

  // workerPoolを使ったfrq生成
  const generateFrqWithWorkerPool = async (wavName: string) => {
    if (!workerPool) {
      Log.error(`workerPoolが初期化されていません`, 'FrqListView.generateFrqWithWorkerPool');
      return;
    }

    try {
      const wavBuffer = await zipFiles[wavName].async('arraybuffer');
      const wav = new Wave(wavBuffer as ArrayBuffer);
      const ndata = Float64Array.from(wav.LogicalNormalize(1));

      const request = {
        data: ndata,
        sample_rate: 44100,
        perSamples: 256,
      };

      const frq = await workerPool.runGenerateFrq(request, 0);

      if (frq) {
        setFrqStates((prev) => {
          const newStates = new Map(prev);
          newStates.set(wavName, { frq, isGenerating: false, progress: 1 });
          return newStates;
        });

        onFrqUpdate?.(wavName, frq);
        Log.gtag("GenerateFrqEditor");
        Log.info(`${wavName}の周波数表を生成しました`, 'FrqListView.generateFrqWithWorkerPool');
      } else {
        setFrqStates((prev) => {
          const newStates = new Map(prev);
          newStates.set(wavName, { frq: null, isGenerating: false, progress: 0 });
          return newStates;
        });
        Log.error(`${wavName}の周波数表生成に失敗しました`, 'FrqListView.generateFrqWithWorkerPool');
      }
    } catch (error) {
      Log.error(`${wavName}の周波数表生成中にエラー: ${error}`, 'FrqListView.generateFrqWithWorkerPool');
      setFrqStates((prev) => {
        const newStates = new Map(prev);
        newStates.set(wavName, { frq: null, isGenerating: false, progress: 0 });
        return newStates;
      });
    }
  };

  // コンテナの高さを計算（画面の70%を使用）
  React.useEffect(() => {
    const updateHeight = () => {
      const windowHeight = window.innerHeight;
      const targetHeight = windowHeight * 0.7; // 画面の70%
      const headerHeight = 64; // ヘッダーの高さ
      const paginationHeight = 60; // ページネーションの高さ
      const padding = 32;
      setContainerHeight(targetHeight - headerHeight - paginationHeight - padding);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // ページネーション計算
  const totalPages = Math.ceil(wavFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, wavFiles.length);
  const currentPageFiles = wavFiles.slice(startIndex, endIndex);

  // 現在のページに表示されているファイルのfrq生成を開始
  React.useEffect(() => {
    if (!workerPool) return;

    workerPool.clearTasks();

    for (const wavName of currentPageFiles) {
      const state = frqStates.get(wavName);
      if (state && !state.frq && !state.isGenerating) {
        setFrqStates((prev) => {
          const newStates = new Map(prev);
          newStates.set(wavName, { frq: null, isGenerating: true, progress: 0 });
          return newStates;
        });
        generateFrqWithWorkerPool(wavName);
      }
    }
  }, [currentPageFiles, workerPool, frqStates]);

  // サムネイルの高さを計算（itemsPerPage基準で固定）
  const thumbnailHeight = containerHeight > 0 
    ? Math.max(
        FRQ_CONSTANTS.MIN_THUMBNAIL_HEIGHT,
        (containerHeight - (itemsPerPage - 1) * 16) / itemsPerPage
      )
    : FRQ_CONSTANTS.MIN_THUMBNAIL_HEIGHT;

  const handleThumbnailClick = (wavName: string) => {
    const state = frqStates.get(wavName);
    if (!state) return;

    if (state.frq && !state.isGenerating) {
      setEditingWavFile(wavName);
      Log.gtag("EditFrq");
    }
  };

  // 編集画面から戻る
  const handleBack = () => {
    setEditingWavFile(null);
  };

  // 編集内容を保存
  const handleSave = (updatedFrq: Frq) => {
    if (!editingWavFile) return;

    setFrqStates((prev) => {
      const newStates = new Map(prev);
      newStates.set(editingWavFile, { frq: updatedFrq, isGenerating: false, progress: 1 });
      return newStates;
    });

    onFrqUpdate?.(editingWavFile, updatedFrq);
    
    setEditingWavFile(null);
    
    Log.gtag("SaveFrq");
    Log.info(`${editingWavFile}の周波数表を保存しました`, 'FrqListView.handleSave');
  };

  // 周波数表を再生成
  const handleRegenerate = async () => {
    if (!editingWavFile) return;

    // 編集画面を閉じる
    setEditingWavFile(null);

    // 生成中状態にする
    setFrqStates((prev) => {
      const newStates = new Map(prev);
      newStates.set(editingWavFile, { frq: null, isGenerating: true, progress: 0 });
      return newStates;
    });

    // frqを再生成
    await generateFrqWithWorkerPool(editingWavFile);
    
    Log.gtag("RegenerateFrq");
    Log.info(`${editingWavFile}の周波数表を再生成しました`, 'FrqListView.handleRegenerate');
  };

  // 編集画面を表示中の場合
  if (editingWavFile && editingFrq) {
    return (
      <FrqEditorView
        wavFileName={editingWavFile}
        frq={editingFrq}
        workerPool={workerPool}
        mode={mode}
        onSave={handleSave}
        onRegenerate={handleRegenerate}
        onBack={handleBack}
        open={true}
      />
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '70vh', p: 2 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('editor.frq_editor.list.files_count', {
            count: wavFiles.length,
            start: startIndex + 1,
            end: endIndex,
          })}
        </Typography>
      </Box>

      {/* サムネイル一覧 */}
      <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        {currentPageFiles.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              wavファイルが見つかりません
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentPageFiles.map((wavName) => {
              const state = frqStates.get(wavName);
              return (
                <FrqThumbnail
                  key={wavName}
                  wavFileName={wavName}
                  frqData={state?.frq || null}
                  width={0} // 100%幅なので0でOK
                  height={thumbnailHeight}
                  mode={mode}
                  isGenerating={state?.isGenerating || false}
                  onClick={() => handleThumbnailClick(wavName)}
                />
              );
            })}
          </Box>
        )}
      </Box>

      {/* ページネーション */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
    </>
  );
};
