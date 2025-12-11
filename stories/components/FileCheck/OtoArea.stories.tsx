import type { Meta, StoryObj } from "@storybook/react";
import { OtoArea } from "../../../src/components/Editor/FileCheck/OtoArea";

const meta = {
  title: "Components/FileCheck/OtoArea",
  component: OtoArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof OtoArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Checked: Story = {
  args: {
    flags: {
      remove: {},
      frq: {},
      oto: { root: true },
      wav: {},
    },
    OnCheckBoxChange: () => {},
  },
};

export const Default: Story = {
  args: {
    flags: {
      remove: {},
      frq: {},
      oto: { root: false },
      wav: {},
    },
    OnCheckBoxChange: () => {},
  },
};
