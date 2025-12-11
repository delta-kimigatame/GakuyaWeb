import type { Meta, StoryObj } from "@storybook/react";
import { RemoveFileArea } from "../../../src/components/Editor/FileCheck/RemoveFileArea";

const meta = {
  title: "Components/FileCheck/RemoveFileArea",
  component: RemoveFileArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RemoveFileArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllChecked: Story = {
  args: {
    flags: {
      remove: {
        read: true,
        uspec: true,
        setparam: true,
        vlabeler: true,
      },
      frq: {},
      oto: { root: false },
      wav: {},
    },
    OnCheckBoxChange: () => {},
    OnAllClick: () => {},
  },
};

export const Default: Story = {
  args: {
    flags: {
      remove: {
        read: false,
        uspec: false,
        setparam: false,
        vlabeler: false,
      },
      frq: {},
      oto: { root: false },
      wav: {},
    },
    OnCheckBoxChange: () => {},
    OnAllClick: () => {},
  },
};
