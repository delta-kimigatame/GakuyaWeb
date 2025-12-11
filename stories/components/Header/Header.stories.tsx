import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import { Header } from "../../../src/components/Header/Header";

const meta = {
  title: "Components/Header/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof Header>;

/**
 * デフォルト表示（メニュー閉じた状態）
 */
export const Default: Story = {
  args: {
    mode: "light",
    setMode: () => {},
    language: "ja",
    setLanguage: () => {},
    workersCount: 3,
    setWorkersCount: () => {},
    windowSize: [1200, 800],
  },
};

/**
 * ヘッダメニューが開いた状態
 */
export const Opened: Story = {
  render: () => {
    const [mode, setMode] = useState<"light" | "dark">("light");
    const [language, setLanguage] = useState("ja");
    const [workersCount, setWorkersCount] = useState(3);

    // useEffectを使ってメニューを自動で開く
    useEffect(() => {
      const timer = setTimeout(() => {
        const menuButton = document.querySelector<HTMLButtonElement>(
          'button[aria-label], button:has(svg[data-testid="MenuIcon"])'
        );
        if (menuButton) {
          menuButton.click();
        }
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    return (
      <Header
        mode={mode}
        setMode={setMode}
        language={language}
        setLanguage={setLanguage}
        workersCount={workersCount}
        setWorkersCount={setWorkersCount}
        windowSize={[1200, 800]}
      />
    );
  },
};
