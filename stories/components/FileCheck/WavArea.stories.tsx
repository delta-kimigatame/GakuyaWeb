import type { Meta, StoryObj } from "@storybook/react";
import { WavArea } from "../../../src/components/Editor/FileCheck/WavArea";

const meta = {
  title: "Components/FileCheck/WavArea",
  component: WavArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WavArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllChecked: Story = {
  args: {
    flags: {
      remove: {},
      frq: {},
      oto: { root: false },
      wav: {
        stereo: true,
        sampleRate: true,
        depth: true,
        dcoffset: true,
      },
    },
    OnCheckBoxChange: () => {},
    OnAllClick: () => {},
  },
};

export const Default: Story = {
  args: {
    flags: {
      remove: {},
      frq: {},
      oto: { root: false },
      wav: {
        stereo: false,
        sampleRate: false,
        depth: false,
        dcoffset: false,
      },
    },
    OnCheckBoxChange: () => {},
    OnAllClick: () => {},
  },
};
