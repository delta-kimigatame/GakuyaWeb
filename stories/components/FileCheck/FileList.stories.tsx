import type { Meta, StoryObj } from "@storybook/react";
import { FileList } from "../../../src/components/Editor/FileCheck/FileList";

const meta = {
  title: "Components/FileCheck/FileList",
  component: FileList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FileList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDeletedFiles: Story = {
  args: {
    rootDir: "",
    files: [
      "あ.wav",
      "あ.frq",
      "あ.pmk",
      "い.wav",
      "い.frq",
      "う.wav",
      "う.frq",
      "$read",
      "oto.ini",
      "oto.uspec",
    ],
    flags: {
      remove: {
        read: true,
        uspec: true,
        setparam: false,
        vlabeler: false,
      },
      frq: {
        frq: false,
        pmk: true,
        frc: false,
        vs4ufrq: false,
        world: false,
        llsm: false,
        mrq: false,
      },
      oto: { root: false },
      wav: {
        stereo: false,
        sampleRate: false,
        depth: false,
        dcoffset: false,
      },
    },
  },
};

export const NoDeletedFiles: Story = {
  args: {
    rootDir: "",
    files: [
      "あ.wav",
      "あ_wav.frq",
      "い.wav",
      "い_wav.frq",
      "う.wav",
      "う_wav.frq",
      "oto.ini",
    ],
    flags: {
      remove: {
        read: false,
        uspec: false,
        setparam: false,
        vlabeler: false,
      },
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
      wav: {
        stereo: false,
        sampleRate: false,
        depth: false,
        dcoffset: false,
      },
    },
  },
};
