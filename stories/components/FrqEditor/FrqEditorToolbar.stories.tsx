import type { Meta, StoryObj } from "@storybook/react";
import { FrqEditorToolbar } from "../../../src/components/FrqEditor/FrqEditorToolbar";

const meta: Meta<typeof FrqEditorToolbar> = {
  title: "Components/FrqEditor/FrqEditorToolbar",
  component: FrqEditorToolbar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FrqEditorToolbar>;

export const NoSelection: Story = {
  args: {
    selectionCount: 0,
    onMultiplyBy2: () => console.log("multiply by 2"),
    onMultiplyBy3: () => console.log("multiply by 3"),
    onDivideBy2: () => console.log("divide by 2"),
    onDivideBy3: () => console.log("divide by 3"),
    onFileAverageToSelection: () => console.log("file average to selection"),
    onSelectionToFileAverage: () => console.log("selection to file average"),
    onLinearInterpolate: () => console.log("linear interpolate"),
    onSelectAll: () => console.log("select all"),
    onClearSelection: () => console.log("clear selection"),
    onSave: () => console.log("save"),
    onBack: () => console.log("back"),
  },
};

export const SomeSelected: Story = {
  args: {
    selectionCount: 15,
    onMultiplyBy2: () => console.log("multiply by 2"),
    onMultiplyBy3: () => console.log("multiply by 3"),
    onDivideBy2: () => console.log("divide by 2"),
    onDivideBy3: () => console.log("divide by 3"),
    onFileAverageToSelection: () => console.log("file average to selection"),
    onSelectionToFileAverage: () => console.log("selection to file average"),
    onLinearInterpolate: () => console.log("linear interpolate"),
    onSelectAll: () => console.log("select all"),
    onClearSelection: () => console.log("clear selection"),
    onSave: () => console.log("save"),
    onBack: () => console.log("back"),
  },
};

export const ManySelected: Story = {
  args: {
    selectionCount: 128,
    onMultiplyBy2: () => console.log("multiply by 2"),
    onMultiplyBy3: () => console.log("multiply by 3"),
    onDivideBy2: () => console.log("divide by 2"),
    onDivideBy3: () => console.log("divide by 3"),
    onFileAverageToSelection: () => console.log("file average to selection"),
    onSelectionToFileAverage: () => console.log("selection to file average"),
    onLinearInterpolate: () => console.log("linear interpolate"),
    onSelectAll: () => console.log("select all"),
    onClearSelection: () => console.log("clear selection"),
    onSave: () => console.log("save"),
    onBack: () => console.log("back"),
  },
};
