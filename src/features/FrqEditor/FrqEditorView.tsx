import React from "react";
import { Box, Dialog, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { Frq } from "../../lib/UtauFrq";
import { FrqDataTable } from "../../components/FrqEditor/FrqDataTable";
import { FrqFreqCanvas } from "../../components/FrqEditor/FrqFreqCanvas";
import { FrqFreqCanvasLabel } from "../../components/FrqEditor/FrqFreqCanvasLabel";
import { FrqAmpCanvas } from "../../components/FrqEditor/FrqAmpCanvas";
import { FrqEditorToolbar } from "../../components/FrqEditor/FrqEditorToolbar";
import { AverageFreqDisplay } from "../../components/FrqEditor/AverageFreqDisplay";
import { FRQ_CONSTANTS } from "../../settings/frqConstants";
import { hzToTone } from "../../utils/FreqToTone";
import {
  ArraySelection,
  createEmptySelection,
  getSelectedIndices,
  selectRange,
  clearSelection as clearArraySelection,
} from "../../utils/ArraySelection";
import type { GenerateFrqWorkerPool } from "../../services/workerPool";
import { Log } from "../../lib/Logging";

interface FrqEditorViewProps {
  wavFileName: string;
  frq: Frq;
  workerPool: GenerateFrqWorkerPool | null;
  mode: "light" | "dark";
  onSave: (updatedFrq: Frq) => void;
  onRegenerate: () => void;
  onBack: () => void;
  open: boolean;
}

export const FrqEditorView: React.FC<FrqEditorViewProps> = ({
  wavFileName,
  frq,
  workerPool,
  mode,
  onSave,
  onRegenerate,
  onBack,
  open,
}) => {
  const { t } = useTranslation();
  const [selection, setSelection] = React.useState<ArraySelection>(
    createEmptySelection()
  );
  const [editedFrq, setEditedFrq] = React.useState<Frq>(frq);
  const [isDialogReady, setIsDialogReady] = React.useState(false);
  
  // スクロール同期用のref
  const freqYScrollRef = React.useRef<HTMLDivElement>(null); // 周波数グラフのY軸スクロール
  const freqXScrollRef = React.useRef<HTMLDivElement>(null); // 周波数グラフのX軸スクロール
  const ampScrollRef = React.useRef<HTMLDivElement>(null);
  const ampContainerRef = React.useRef<HTMLDivElement>(null);
  const labelRef = React.useRef<{ updateScroll: (scrollTop: number) => void }>(null); // ラベルの直接制御用
  
  // 音量グラフコンテナの高さを取得
  const [ampContainerHeight, setAmpContainerHeight] = React.useState<number>(100);
  

  
  // Canvas高さ計算
  const minTone = hzToTone(FRQ_CONSTANTS.MIN_HZ);
  const maxTone = hzToTone(FRQ_CONSTANTS.MAX_HZ);
  const toneRange = maxTone - minTone;
  const pixelsPerSemitone = 20;
  const canvasHeight = Math.ceil(toneRange * pixelsPerSemitone);
  const labelWidth = FRQ_CONSTANTS.FREQ_LABEL_WIDTH;
  
  React.useEffect(() => {
    if (ampContainerRef.current) {
      const height = ampContainerRef.current.clientHeight;
      setAmpContainerHeight(height);
      Log.debug(`音量グラフコンテナの高さ: ${height}px`, 'FrqEditorView');
    }
  }, []);

  // X軸スクロール同期（周波数グラフと音量グラフ）- 双方向
  const handleFreqXScroll = React.useCallback(() => {
    if (freqXScrollRef.current && ampScrollRef.current) {
      ampScrollRef.current.scrollLeft = freqXScrollRef.current.scrollLeft;
    }
  }, []);

  const handleAmpScroll = React.useCallback(() => {
    if (ampScrollRef.current && freqXScrollRef.current) {
      freqXScrollRef.current.scrollLeft = ampScrollRef.current.scrollLeft;
    }
  }, []);

  // Y軸スクロール処理（ラベル同期用）- 直接DOM操作
  const handleFreqYScroll = React.useCallback((scrollTop: number) => {
    labelRef.current?.updateScroll(scrollTop);
  }, []);
  
  // 初期表示時に平均周波数を中心に表示
  React.useEffect(() => {
    if (!isDialogReady || !freqYScrollRef.current) return;
    
    const scrollContainer = freqYScrollRef.current;
    const containerHeight = scrollContainer.clientHeight;
    const scrollHeight = scrollContainer.scrollHeight;
    
    // スクロール可能な範囲がない場合は何もしない
    if (scrollHeight <= containerHeight) return;
    
    // 平均周波数をトーン値に変換（A0基準）
    const avgHz = editedFrq.frqAverage;
    if (avgHz <= 0) return;
    
    // hzToTone相当の計算（A0_HZ = 27.5）
    const A0_HZ = 27.5;
    const SEMITONES_PER_OCTAVE = 12;
    const avgTone = SEMITONES_PER_OCTAVE * Math.log2(avgHz / A0_HZ);
    
    // 表示範囲のトーン値（MIN_HZ = 55, MAX_HZ = 880）
    const MIN_HZ = 55;
    const MAX_HZ = 880;
    const minTone = SEMITONES_PER_OCTAVE * Math.log2(MIN_HZ / A0_HZ);
    const maxTone = SEMITONES_PER_OCTAVE * Math.log2(MAX_HZ / A0_HZ);
    const toneRange = maxTone - minTone;
    
    // 平均周波数の相対位置（0～1）
    // キャンバスは上端が高周波数（maxTone）、下端が低周波数（minTone）
    // 高周波数ほどrelativePositionが小さく（上部）、低周波数ほど大きく（下部）
    const relativePosition = (maxTone - avgTone) / toneRange;
    
    // キャンバス全体での平均周波数のY座標
    const avgPositionInCanvas = scrollHeight * relativePosition;
    
    // 平均周波数が中心に来るスクロール位置
    // scrollTop = 平均周波数の位置 - コンテナ高さの半分
    const targetScrollTop = avgPositionInCanvas - containerHeight / 2;
    
    // スクロール範囲内にクランプ
    const maxScrollTop = scrollHeight - containerHeight;
    const clampedScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
    
    scrollContainer.scrollTop = clampedScrollTop;
    Log.info(`平均周波数(${avgHz.toFixed(2)}Hz)を中心にスクロールしました: ${clampedScrollTop.toFixed(0)}px`, 'FrqEditorView');
  }, [isDialogReady, editedFrq.frqAverage]); // ダイアログ準備完了時に実行

  // 選択されているインデックスを取得
  const selectedIndices = React.useMemo(
    () => getSelectedIndices(selection),
    [selection]
  );

  // 選択範囲の平均周波数を計算
  const selectionAverageFreq = React.useMemo(() => {
    if (selectedIndices.length === 0) return null;
    const sum = selectedIndices.reduce(
      (acc, idx) => acc + editedFrq.frq[idx],
      0
    );
    return sum / selectedIndices.length;
  }, [selectedIndices, editedFrq]);



  // 編集操作: 2倍
  const handleMultiplyBy2 = React.useCallback(() => {
    if (selectedIndices.length === 0) return;
    const newFrqArray = Array.from(editedFrq.frq);
    selectedIndices.forEach((idx) => {
      newFrqArray[idx] *= 2;
    });
    setEditedFrq(
      new Frq({
        frq: Float64Array.from(newFrqArray),
        amp: editedFrq.amp,
        perSamples: editedFrq.perSamples,
        frqAverage: editedFrq.frqAverage,
      })
    );
    Log.info(`選択範囲(${selectedIndices.length}点)を2倍にしました`, 'FrqEditorView');
  }, [selectedIndices, editedFrq]);

  // 編集操作: 3倍
  const handleMultiplyBy3 = React.useCallback(() => {
    if (selectedIndices.length === 0) return;
    const newFrqArray = Array.from(editedFrq.frq);
    selectedIndices.forEach((idx) => {
      newFrqArray[idx] *= 3;
    });
    setEditedFrq(
      new Frq({
        frq: Float64Array.from(newFrqArray),
        amp: editedFrq.amp,
        perSamples: editedFrq.perSamples,
        frqAverage: editedFrq.frqAverage,
      })
    );
    Log.info(`選択範囲(${selectedIndices.length}点)を3倍にしました`, 'FrqEditorView');
  }, [selectedIndices, editedFrq]);

  // 編集操作: 1/2
  const handleDivideBy2 = React.useCallback(() => {
    if (selectedIndices.length === 0) return;
    const newFrqArray = Array.from(editedFrq.frq);
    selectedIndices.forEach((idx) => {
      newFrqArray[idx] /= 2;
    });
    setEditedFrq(
      new Frq({
        frq: Float64Array.from(newFrqArray),
        amp: editedFrq.amp,
        perSamples: editedFrq.perSamples,
        frqAverage: editedFrq.frqAverage,
      })
    );
    Log.info(`選択範囲(${selectedIndices.length}点)を1/2にしました`, 'FrqEditorView');
  }, [selectedIndices, editedFrq]);

  // 編集操作: 1/3
  const handleDivideBy3 = React.useCallback(() => {
    if (selectedIndices.length === 0) return;
    const newFrqArray = Array.from(editedFrq.frq);
    selectedIndices.forEach((idx) => {
      newFrqArray[idx] /= 3;
    });
    setEditedFrq(
      new Frq({
        frq: Float64Array.from(newFrqArray),
        amp: editedFrq.amp,
        perSamples: editedFrq.perSamples,
        frqAverage: editedFrq.frqAverage,
      })
    );
    Log.info(`選択範囲(${selectedIndices.length}点)を1/3にしました`, 'FrqEditorView');
  }, [selectedIndices, editedFrq]);

  // 編集操作: ファイル全体の平均周波数を選択範囲に適用する
  const handleFileAverageToSelection = React.useCallback(() => {
    if (selectedIndices.length === 0) return;
    const newFrqArray = Array.from(editedFrq.frq);
    selectedIndices.forEach((idx) => {
      newFrqArray[idx] = editedFrq.frqAverage;
    });
    setEditedFrq(
      new Frq({
        frq: Float64Array.from(newFrqArray),
        amp: editedFrq.amp,
        perSamples: editedFrq.perSamples,
        frqAverage: editedFrq.frqAverage,
      })
    );
    Log.info(`選択範囲(${selectedIndices.length}点)に平均周波数(${editedFrq.frqAverage.toFixed(2)}Hz)を適用しました`, 'FrqEditorView');
  }, [selectedIndices, editedFrq]);

  // 編集操作: 選択範囲の平均値をファイル全体の平均周波数にする
  const handleSelectionToFileAverage = React.useCallback(() => {
    if (selectionAverageFreq === null) return;
    setEditedFrq(
      new Frq({
        frq: editedFrq.frq,
        amp: editedFrq.amp,
        perSamples: editedFrq.perSamples,
        frqAverage: selectionAverageFreq,
      })
    );
    Log.info(`選択範囲の平均値(${selectionAverageFreq.toFixed(2)}Hz)をファイルの平均周波数に設定しました`, 'FrqEditorView');
  }, [editedFrq, selectionAverageFreq]);

  // 編集操作: 線形補完
  const handleLinearInterpolate = React.useCallback(() => {
    if (selectedIndices.length <= 1) return;
    const newFrqArray = Array.from(editedFrq.frq);
    const startIdx = selectedIndices[0];
    const endIdx = selectedIndices[selectedIndices.length - 1];
    const startValue = newFrqArray[startIdx];
    const endValue = newFrqArray[endIdx];
    const steps = endIdx - startIdx;
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      newFrqArray[startIdx + i] = startValue + (endValue - startValue) * ratio;
    }
    
    setEditedFrq(
      new Frq({
        frq: Float64Array.from(newFrqArray),
        amp: editedFrq.amp,
        perSamples: editedFrq.perSamples,
        frqAverage: editedFrq.frqAverage,
      })
    );
    Log.info(`選択範囲(${startIdx}-${endIdx})を線形補完しました`, 'FrqEditorView');
  }, [selectedIndices, editedFrq]);

  // 選択操作: 全選択
  const handleSelectAll = React.useCallback(() => {
    setSelection(selectRange(0, editedFrq.frq.length - 1, editedFrq.frq.length));
    Log.info(`全データポイント(${editedFrq.frq.length}点)を選択しました`, 'FrqEditorView');
  }, [editedFrq]);

  // 選択操作: 選択解除
  const handleClearSelection = React.useCallback(() => {
    setSelection(clearArraySelection());
    Log.info(`選択を解除しました`, 'FrqEditorView');
  }, []);

  // ファイル全体の平均周波数変更
  const handleAverageFreqChange = React.useCallback((newAverage: number) => {
    setEditedFrq(
      new Frq({
        frq: editedFrq.frq,
        amp: editedFrq.amp,
        perSamples: editedFrq.perSamples,
        frqAverage: newAverage,
      })
    );
    Log.info(`ファイル全体の平均周波数を${newAverage.toFixed(2)}Hzに変更しました`, 'FrqEditorView');
  }, [editedFrq]);

  // 保存
  const handleSave = React.useCallback(() => {
    onSave(editedFrq);
  }, [editedFrq, onSave]);

  // 再生成
  const handleRegenerate = React.useCallback(() => {
    onRegenerate();
  }, [onRegenerate]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onBack}
      TransitionProps={{
        onEntered: () => setIsDialogReady(true),
        onExit: () => setIsDialogReady(false),
      }}
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'background.default',
        }
      }}
    >
      {/* ヘッダーバー */}
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <Typography sx={{ ml: 0, flex: 1 }} variant="h6" component="div">
            {wavFileName}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onBack}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 64px)", // AppBarの高さを引く
          overflowY: "hidden",
        }}
      >
      {/* Canvas群（周波数・音量） - 十字レイアウト */}
      <Box
        sx={{
          height: "50vh", // 周波数40vh + 音量10vh
          borderBottom: 1,
          borderColor: "divider",
          display: "grid",
          gridTemplateColumns: `${labelWidth}px 1fr`,
          gridTemplateRows: "40vh 10vh",
        }}
      >
        {/* 左上: 周波数ラベル - overflow: hidden */}
        <Box sx={{ overflow: "hidden", borderRight: 1, borderBottom: 1, borderColor: "divider" }}>
          <FrqFreqCanvasLabel
            ref={labelRef}
            height={canvasHeight}
            mode={mode}
            scrollTop={0}
          />
        </Box>

        {/* 右上: 周波数グラフ - overflowY: scroll, overflowX: hidden */}
        <Box
          sx={{
            overflowY: "hidden", // スクロールはFrqFreqCanvas内部で管理
            overflowX: "hidden",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <FrqFreqCanvas
            frq={editedFrq}
            selection={selection}
            mode={mode}
            onYScroll={handleFreqYScroll}
            onXScroll={handleFreqXScroll}
            yScrollContainerRef={freqYScrollRef}
            xScrollContainerRef={freqXScrollRef}
          />
        </Box>

        {/* 左下: 空 */}
        <Box sx={{ borderRight: 1, borderColor: "divider", bgcolor: mode === 'dark' ? 'grey.900' : 'background.paper' }} />

        {/* 右下: 音量グラフ - overflowX: scroll */}
        <Box
          ref={ampScrollRef}
          onScroll={handleAmpScroll}
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <Box ref={ampContainerRef} sx={{ height: "100%" }}>
            <FrqAmpCanvas
              frq={editedFrq}
              containerHeight={ampContainerHeight}
              mode={mode}
            />
          </Box>
        </Box>
      </Box>

      {/* 平均周波数 (幅100%) */}
      <Box
        sx={{
          flex: "0 0 auto",
          p: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <AverageFreqDisplay
          averageFreq={editedFrq.frqAverage}
          onAverageFreqChange={handleAverageFreqChange}
        />
      </Box>

      {/* データテーブル (残りのスペースを占有) */}
      <Box sx={{ flex: "1 1 auto", overflow: "hidden" }}>
        <FrqDataTable
          frq={editedFrq}
          selection={selection}
          onSelectionChange={setSelection}
          onSelectAll={(selectAll) => {
            if (selectAll) {
              handleSelectAll();
            } else {
              handleClearSelection();
            }
          }}
          mode={mode}
        />
      </Box>

      {/* ツールバー (最下部、幅100%) */}
      <Box sx={{ flex: "0 0 auto" }}>
        <FrqEditorToolbar
          selectionCount={selectedIndices.length}
          onMultiplyBy2={handleMultiplyBy2}
          onMultiplyBy3={handleMultiplyBy3}
          onDivideBy2={handleDivideBy2}
          onDivideBy3={handleDivideBy3}
          onFileAverageToSelection={handleFileAverageToSelection}
          onSelectionToFileAverage={handleSelectionToFileAverage}
          onLinearInterpolate={handleLinearInterpolate}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onRegenerate={handleRegenerate}
          onSave={handleSave}
          onBack={onBack}
        />
      </Box>
    </Box>
    </Dialog>
  );
};
