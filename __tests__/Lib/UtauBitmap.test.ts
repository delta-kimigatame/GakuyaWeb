import { describe, test, expect } from "vitest";
import { OutputBitmap } from "../../src/Lib/UtauBitmap";
import fs from "fs";

describe("bitmap生成", () => {
  test("all_red", () => {
    const data = new Array();
    for (let i = 0; i < 10000; i++) {
      data.push({ r: 255, g: 0, b: 0 });
    }
    const imgbuf = OutputBitmap(100, 100, 3, data);
    fs.writeFileSync(
        "./__tests__/test_result/all_red.bmp",
        new DataView(imgbuf)
      );
  });
  test("all_green", () => {
    const data = new Array();
    for (let i = 0; i < 10000; i++) {
      data.push({ r: 0, g: 255, b: 0 });
    }
    const imgbuf = OutputBitmap(100, 100, 3, data);
    fs.writeFileSync(
        "./__tests__/test_result/all_green.bmp",
        new DataView(imgbuf)
      );
  });
  test("all_blue", () => {
    const data = new Array();
    for (let i = 0; i < 10000; i++) {
      data.push({ r: 0, g: 0, b: 255 });
    }
    const imgbuf = OutputBitmap(100, 100, 3, data);
    fs.writeFileSync(
        "./__tests__/test_result/all_blue.bmp",
        new DataView(imgbuf)
      );
  });
});
