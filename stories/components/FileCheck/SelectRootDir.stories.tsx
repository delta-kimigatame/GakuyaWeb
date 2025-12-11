import type { Meta, StoryObj } from "@storybook/react";
import { SelectRootDir } from "../../../src/features/Editor/FileCheck/SelectRootDir";

const meta = {
  title: "Components/FileCheck/SelectRootDir",
  component: SelectRootDir,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SelectRootDir>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rootDir: "",
    setRootDir: () => {},
    directories: ["", "subfolder1", "subfolder2"],
  },
};

export const WithSubfolder: Story = {
  args: {
    rootDir: "subfolder1",
    setRootDir: () => {},
    directories: ["", "subfolder1", "subfolder2"],
  },
};
