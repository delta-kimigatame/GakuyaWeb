import type { Meta, StoryObj } from "@storybook/react";
import { AverageFreqDisplay } from "../../../src/components/FrqEditor/AverageFreqDisplay";

const meta: Meta<typeof AverageFreqDisplay> = {
  title: "Components/FrqEditor/AverageFreqDisplay",
  component: AverageFreqDisplay,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AverageFreqDisplay>;

export const Standard: Story = {
  args: {
    averageFreq: 440.0,
    onAverageFreqChange: (newAvg) => console.log("New average:", newAvg),
  },
};

export const HighPrecision: Story = {
  args: {
    averageFreq: 523.2511306011972,
    onAverageFreqChange: (newAvg) => console.log("New average:", newAvg),
  },
};

export const LowFrequency: Story = {
  args: {
    averageFreq: 82.40689341534614,
    onAverageFreqChange: (newAvg) => console.log("New average:", newAvg),
  },
};

export const HighFrequency: Story = {
  args: {
    averageFreq: 1046.5023243427503,
    onAverageFreqChange: (newAvg) => console.log("New average:", newAvg),
  },
};

export const VeryHighPrecision: Story = {
  args: {
    averageFreq: 261.6255653005986,
    onAverageFreqChange: (newAvg) => console.log("New average:", newAvg),
  },
};
