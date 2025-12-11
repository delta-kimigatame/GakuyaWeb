import type { Meta, StoryObj } from "@storybook/react";
import { PrefixMapPanel } from "../../../src/features/Editor/PrefixMapPanel";
import { PrefixMap } from "../../../src/lib/PrefixMap";
import React from "react";
import { PaletteMode } from "@mui/material";

const meta: Meta<typeof PrefixMapPanel> = {
  title: "Components/PrefixMapPanel",
  component: PrefixMapPanel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PrefixMapPanel>;

/**
 * prefix.mapを作成しない場合の初期状態です。
 * チェックボックスがオフの場合、何も表示されません。
 */
export const Empty: Story = {
  render: () => {
    const [prefixMaps, setPrefixMaps] = React.useState<{ string?: PrefixMap }>(
      {}
    );
    const [update, setUpdate] = React.useState(false);

    return (
      <div style={{ width: "800px", height: "600px" }}>
        <PrefixMapPanel
          prefixMaps={prefixMaps}
          setPrefixMaps={setPrefixMaps}
          update={update}
          setUpdate={setUpdate}
          mode={"light" as PaletteMode}
        />
      </div>
    );
  },
};

/**
 * suffix推奨の典型的な多音階音源の例です。
 * 低音域(C1-B4)にsuffix="_C3"、高音域(C5-B7)にsuffix="_G4"を設定しています。
 * これは現在の標準的な使い方です。
 */
export const BasicWithSuffix: Story = {
  render: () => {
    const map = new PrefixMap();
    // 低音域: C1-B4にsuffix="_C3"
    map.SetRangeValues("C1-B4", "", "_C3");
    // 高音域: C5-B7にsuffix="_G4"
    map.SetRangeValues("C5-B7", "", "_G4");

    const [prefixMaps, setPrefixMaps] = React.useState(
      { "": map } as any
    );
    const [update, setUpdate] = React.useState(true);

    return (
      <div style={{ width: "800px", height: "600px" }}>
        <PrefixMapPanel
          prefixMaps={prefixMaps}
          setPrefixMaps={setPrefixMaps}
          update={update}
          setUpdate={setUpdate}
          mode={"light" as PaletteMode}
        />
      </div>
    );
  },
};

/**
 * 前方互換性のため残されているprefix使用例です。
 * 現在ではsuffixの使用が推奨されますが、古い音源ではprefix方式が使われています。
 */
export const LegacyWithPrefix: Story = {
  render: () => {
    const map = new PrefixMap();
    // 低音域: C1-B4にprefix="L"
    map.SetRangeValues("C1-B4", "L", "");
    // 高音域: C5-B7にprefix="H"
    map.SetRangeValues("C5-B7", "H", "");

    const [prefixMaps, setPrefixMaps] = React.useState(
      { "": map } as any
    );
    const [update, setUpdate] = React.useState(true);

    return (
      <div style={{ width: "800px", height: "600px" }}>
        <PrefixMapPanel
          prefixMaps={prefixMaps}
          setPrefixMaps={setPrefixMaps}
          update={update}
          setUpdate={setUpdate}
          mode={"light" as PaletteMode}
        />
      </div>
    );
  },
};

/**
 * OpenUtau/UTAlet専用のVoice Color機能を使用した例です。
 * 本家UTAUでは使えません。
 * 複数の声色(normal, strong)をsuffixで区別しています。
 */
export const WithVoiceColor: Story = {
  render: () => {
    const normalMap = new PrefixMap();
    normalMap.voiceColor = "normal";
    normalMap.SetRangeValues("C1-B7", "", "_C4");

    const strongMap = new PrefixMap();
    strongMap.voiceColor = "strong";
    strongMap.SetRangeValues("C1-B7", "", "_C4_strong");

    // PrefixMapPanelはcolorをpropsで受け取らず内部でuseStateしているため、
    // 初期表示で空文字キーを探そうとしてエラーになります。
    // 回避策として空文字キーも追加します。
    const defaultMap = new PrefixMap();
    defaultMap.SetRangeValues("C1-B7", "", "");

    const [prefixMaps, setPrefixMaps] = React.useState(
      {
        "": defaultMap,
        normal: normalMap,
        strong: strongMap,
      } as any
    );
    const [update, setUpdate] = React.useState(true);

    return (
      <div style={{ width: "800px", height: "600px" }}>
        <PrefixMapPanel
          prefixMaps={prefixMaps}
          setPrefixMaps={setPrefixMaps}
          update={update}
          setUpdate={setUpdate}
          mode={"light" as PaletteMode}
        />
      </div>
    );
  },
};
