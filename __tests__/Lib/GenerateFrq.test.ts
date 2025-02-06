import { describe, test, expect } from 'vitest';
import { World } from "tsworld";
import {Wave} from "utauwav";
import fs from "fs";
import { GenerateFrq } from "../../src/Lib/GenerateFrq";

describe("frqの作成", () => {
  test("とりあえず落ちなければよし", async () => {
    const world = new World();
    await world.Initialize();
    const buffer = fs.readFileSync("./__tests__/test_data/testbase.wav");
    const ab = new ArrayBuffer(buffer.length);
    const safeData = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; i++) {
      safeData[i] = buffer[i];
    }
    const wav = new Wave(safeData.buffer);
    const ndata = wav.LogicalNormalize(1) as Array<number>;
    const frq = GenerateFrq(world, Float64Array.from(ndata), 44100, 256);
  }, { timeout: 30000 });
});
