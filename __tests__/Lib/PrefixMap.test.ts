import { describe, expect, it } from "vitest";
import {
  PrefixMap,
  ToneToNoteNum,
  NoteNumToTone,
} from "../../src/Lib/PrefixMap";

describe("NoteNumToTone", () => {
  it("NoteNumToTone", () => {
    expect(NoteNumToTone(24)).toBe("C1");
    expect(NoteNumToTone(25)).toBe("C#1");
    expect(NoteNumToTone(26)).toBe("D1");
    expect(NoteNumToTone(27)).toBe("D#1");
    expect(NoteNumToTone(28)).toBe("E1");
    expect(NoteNumToTone(29)).toBe("F1");
    expect(NoteNumToTone(30)).toBe("F#1");
    expect(NoteNumToTone(31)).toBe("G1");
    expect(NoteNumToTone(32)).toBe("G#1");
    expect(NoteNumToTone(33)).toBe("A1");
    expect(NoteNumToTone(34)).toBe("A#1");
    expect(NoteNumToTone(35)).toBe("B1");
    expect(NoteNumToTone(36)).toBe("C2");
    expect(NoteNumToTone(60)).toBe("C4");
    expect(NoteNumToTone(107)).toBe("B7");
  });
});

describe("ToneToNoteNum", () => {
  it("ToneToNoteNum", () => {
    expect(ToneToNoteNum("C1")).toBe(24);
    expect(ToneToNoteNum("C#1")).toBe(25);
    expect(ToneToNoteNum("D1")).toBe(26);
    expect(ToneToNoteNum("D#1")).toBe(27);
    expect(ToneToNoteNum("E1")).toBe(28);
    expect(ToneToNoteNum("F1")).toBe(29);
    expect(ToneToNoteNum("F#1")).toBe(30);
    expect(ToneToNoteNum("G1")).toBe(31);
    expect(ToneToNoteNum("G#1")).toBe(32);
    expect(ToneToNoteNum("A1")).toBe(33);
    expect(ToneToNoteNum("A#1")).toBe(34);
    expect(ToneToNoteNum("B1")).toBe(35);
    expect(ToneToNoteNum("C2")).toBe(36);
    expect(ToneToNoteNum("C4")).toBe(60);
    expect(ToneToNoteNum("B7")).toBe(107);
    expect(ToneToNoteNum("C♯4")).toBe(61);
    expect(ToneToNoteNum("Db4")).toBe(61);
    expect(ToneToNoteNum("D♭4")).toBe(61);
  });
});

describe("prefix.map", () => {
  it("empty_init", () => {
    const map = new PrefixMap();
    for (let i = ToneToNoteNum("C1"); i <= ToneToNoteNum("B7"); i++) {
      const valueFromNotenum = map.GetValue(i);
      expect(valueFromNotenum.tone).toBe(NoteNumToTone(i));
      expect(valueFromNotenum.prefix).toBe("");
      expect(valueFromNotenum.suffix).toBe("");
      const valueFromToneName = map.GetValue(NoteNumToTone(i));
      expect(valueFromToneName.tone).toBe(NoteNumToTone(i));
      expect(valueFromToneName.prefix).toBe("");
      expect(valueFromToneName.suffix).toBe("");
    }
  });
  it("change_value", () => {
    const map = new PrefixMap();
    map.SetValue({ tone: "B7", prefix: "pre", suffix: "" });
    map.SetValue({ tone: "A#7", prefix: "", suffix: "su" });
    for (let i = ToneToNoteNum("C1"); i <= ToneToNoteNum("B7"); i++) {
      const valueFromNotenum = map.GetValue(i);
      expect(valueFromNotenum.tone).toBe(NoteNumToTone(i));
      if (i === ToneToNoteNum("B7")) {
        expect(valueFromNotenum.prefix).toBe("pre");
        expect(valueFromNotenum.suffix).toBe("");
      } else if (i === ToneToNoteNum("A#7")) {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("su");
      } else {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("");
      }
    }
  });

  it("change_range_value", () => {
    const map = new PrefixMap();
    map.SetRangeValues("C7-B7", "pre", "");
    map.SetRangeValues("C6-B6", "", "su");
    map.SetRangeValues("C5-B5", "testp", "tests");
    for (let i = ToneToNoteNum("C1"); i <= ToneToNoteNum("B7"); i++) {
      const valueFromNotenum = map.GetValue(i);
      expect(valueFromNotenum.tone).toBe(NoteNumToTone(i));
      if (i >= ToneToNoteNum("C7")) {
        expect(valueFromNotenum.prefix).toBe("pre");
        expect(valueFromNotenum.suffix).toBe("");
      } else if (i >= ToneToNoteNum("C6")) {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("su");
      } else if (i >= ToneToNoteNum("C5")) {
        expect(valueFromNotenum.prefix).toBe("testp");
        expect(valueFromNotenum.suffix).toBe("tests");
      } else {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("");
      }
    }
  });

  it("output_empty", () => {
    const map = new PrefixMap();
    const output = map.OutputMap();
    for (let i = ToneToNoteNum("C1"); i <= ToneToNoteNum("B7"); i++) {
      expect(output).toContain(NoteNumToTone(i) + "\t\t");
    }
  });
  it("output_setValue", () => {
    const map = new PrefixMap();
    map.SetValue({ tone: "B7", prefix: "pre", suffix: "" });
    map.SetValue({ tone: "A#7", prefix: "", suffix: "su" });
    const output = map.OutputMap();
    for (let i = ToneToNoteNum("C1"); i <= ToneToNoteNum("B7"); i++) {
      if (i === ToneToNoteNum("B7")) {
        expect(output).toContain(NoteNumToTone(i) + "\tpre\t");
      } else if (i === ToneToNoteNum("A#7")) {
        expect(output).toContain(NoteNumToTone(i) + "\t\tsu");
      } else {
        expect(output).toContain(NoteNumToTone(i) + "\t\t");
      }
    }
  });
  it("output_setRangeValues", () => {
    const map = new PrefixMap();
    map.SetRangeValues("C7-B7", "pre", "");
    map.SetRangeValues("C6-B6", "", "su");
    map.SetRangeValues("C5-B5", "testp", "tests");
    const output = map.OutputMap();
    for (let i = ToneToNoteNum("C1"); i <= ToneToNoteNum("B7"); i++) {
      if (i >= ToneToNoteNum("C7")) {
        expect(output).toContain(NoteNumToTone(i) + "\tpre\t");
      } else if (i >= ToneToNoteNum("C6")) {
        expect(output).toContain(NoteNumToTone(i) + "\t\tsu");
      } else if (i >= ToneToNoteNum("C5")) {
        expect(output).toContain(NoteNumToTone(i) + "\ttestp\ttests");
      } else {
        expect(output).toContain(NoteNumToTone(i) + "\t\t");
      }
    }
  });
  it("load_empty_file", () => {
    const map = new PrefixMap();
    const output = map.OutputMap();
    const map2 = new PrefixMap(output);
    for (let i = ToneToNoteNum("C1"); i <= ToneToNoteNum("B7"); i++) {
      const valueFromNotenum = map2.GetValue(i);
      expect(valueFromNotenum.tone).toBe(NoteNumToTone(i));
      expect(valueFromNotenum.prefix).toBe("");
      expect(valueFromNotenum.suffix).toBe("");
      const valueFromToneName = map2.GetValue(NoteNumToTone(i));
      expect(valueFromToneName.tone).toBe(NoteNumToTone(i));
      expect(valueFromToneName.prefix).toBe("");
      expect(valueFromToneName.suffix).toBe("");
    }
  });
  it("load_file", () => {
    const map = new PrefixMap();
    map.SetRangeValues("C7-B7", "pre", "");
    map.SetRangeValues("C6-B6", "", "su");
    map.SetRangeValues("C5-B5", "testp", "tests");
    const output = map.OutputMap();
    const map2 = new PrefixMap(output);
    for (let i = ToneToNoteNum("C1"); i <= ToneToNoteNum("B7"); i++) {
      const valueFromNotenum = map2.GetValue(i);
      expect(valueFromNotenum.tone).toBe(NoteNumToTone(i));
      if (i >= ToneToNoteNum("C7")) {
        expect(valueFromNotenum.prefix).toBe("pre");
        expect(valueFromNotenum.suffix).toBe("");
      } else if (i >= ToneToNoteNum("C6")) {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("su");
      } else if (i >= ToneToNoteNum("C5")) {
        expect(valueFromNotenum.prefix).toBe("testp");
        expect(valueFromNotenum.suffix).toBe("tests");
      } else {
        expect(valueFromNotenum.prefix).toBe("");
        expect(valueFromNotenum.suffix).toBe("");
      }
    }
  });
  it("output_empty_for_OU", () => {
    const map = new PrefixMap();
    map.voiceColor="test"
    const output = map.OutputSubbanks();
    expect(output[0].color).toBe("test")
    expect(output[0].prefix).toBe("")
    expect(output[0].suffix).toBe("")
    expect(output[0].tone_ranges[0]).toBe("C1-B7")
  });
  it("output_range_for_OU", () => {
    const map = new PrefixMap();
    map.voiceColor="test"
    map.SetRangeValues("C7-B7", "pre", "");
    map.SetRangeValues("C6-B6", "", "su");
    map.SetRangeValues("C5-B5", "testp", "tests");
    const output = map.OutputSubbanks();
    expect(output[0].color).toBe("test")
    expect(output[0].prefix).toBe("")
    expect(output[0].suffix).toBe("")
    expect(output[0].tone_ranges[0]).toBe("C1-B4")
    expect(output[1].color).toBe("test")
    expect(output[1].prefix).toBe("testp")
    expect(output[1].suffix).toBe("tests")
    expect(output[1].tone_ranges[0]).toBe("C5-B5")
    expect(output[2].color).toBe("test")
    expect(output[2].prefix).toBe("")
    expect(output[2].suffix).toBe("su")
    expect(output[2].tone_ranges[0]).toBe("C6-B6")
    expect(output[3].color).toBe("test")
    expect(output[3].prefix).toBe("pre")
    expect(output[3].suffix).toBe("")
    expect(output[3].tone_ranges[0]).toBe("C7-B7")
  });
  it("output_range_for_OU_same_prefix_last", () => {
    const map = new PrefixMap();
    map.voiceColor="test"
    map.SetRangeValues("C6-B6", "", "su");
    const output = map.OutputSubbanks();
    expect(output[0].color).toBe("test")
    expect(output[0].prefix).toBe("")
    expect(output[0].suffix).toBe("")
    expect(output[0].tone_ranges[0]).toBe("C1-B5")
    expect(output[0].tone_ranges[1]).toBe("C7-B7")
    expect(output[1].color).toBe("test")
    expect(output[1].prefix).toBe("")
    expect(output[1].suffix).toBe("su")
    expect(output[1].tone_ranges[0]).toBe("C6-B6")
  })
  it("output_range_for_OU_same_prefix_last", () => {
    const map = new PrefixMap();
    map.voiceColor="test"
    map.SetRangeValues("C4-B4", "", "su");
    map.SetRangeValues("C6-B6", "", "su");
    const output = map.OutputSubbanks();
    expect(output[0].color).toBe("test")
    expect(output[0].prefix).toBe("")
    expect(output[0].suffix).toBe("")
    expect(output[0].tone_ranges[0]).toBe("C1-B3")
    expect(output[0].tone_ranges[1]).toBe("C5-B5")
    expect(output[0].tone_ranges[2]).toBe("C7-B7")
    expect(output[1].color).toBe("test")
    expect(output[1].prefix).toBe("")
    expect(output[1].suffix).toBe("su")
    expect(output[1].tone_ranges[0]).toBe("C4-B4")
    expect(output[1].tone_ranges[1]).toBe("C6-B6")
  })
});
