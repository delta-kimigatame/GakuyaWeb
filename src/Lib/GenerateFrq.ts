import { World } from "tsworld";
import { Frq } from "./UtauFrq";

/**
 * 
 * @param world 予めInitializeをしたworld
 * @param data wavの波形データ、モノラルで絶対値1が最大の小数データ
 * @param sample_rate default 44100,wavのサンプリング周波数
 * @param perSamples default 256, frqの分析間隔
 * @returns frqデータ
 */
export const GenerateFrq = (
  world: World,
  data: Float64Array,
  sample_rate: number = 44100,
  perSamples: number = 256
): Frq | null => {
  const f0 = world.Harvest(data, sample_rate, perSamples / sample_rate);
  if (f0) {
    const frq = new Frq({ frq: f0.f0, data: data, perSamples: perSamples });
    frq.CalcAverageFrq();
    return frq;
  } else {
    return null;
  }
};
