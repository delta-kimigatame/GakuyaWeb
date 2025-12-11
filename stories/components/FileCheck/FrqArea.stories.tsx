import type { Meta, StoryObj } from "@storybook/react";
import { FrqArea } from "../../../src/components/Editor/FileCheck/FrqArea";

const meta = {
  title: "Components/FileCheck/FrqArea",
  component: FrqArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FrqArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllChecked: Story = {
  args: {
    flags: {
      remove: {},
      frq: {
        frq: true,
        pmk: true,
        frc: true,
        vs4ufrq: true,
        world: true,
        llsm: true,
        mrq: true,
      },
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
      remove: {},
      frq: {
        frq: false,
        pmk: false,
        frc: false,
        vs4ufrq: false,
        world: false,
        llsm: false,
        mrq: false,
      },
      oto: { root: false },
      wav: {},
    },
    OnCheckBoxChange: () => {},
    OnAllClick: () => {},
  },
};
