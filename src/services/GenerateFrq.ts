import { World } from "tsworld";

export class GenerateFrq {
  private world: World;

  constructor() {}
  async initialize(): Promise<void> {
    return new Promise(async (resolve) => {
      this.world = new World();
      await this.world.Initialize();
      resolve();
    });
  }

  async generateWorker(
    GenerateFrqRequest: GenerateFrqRequest
  ): Promise<Float64Array | null> {
    return new Promise((resolve) => {
      const f0 = this.world.Harvest(
        GenerateFrqRequest.data,
        GenerateFrqRequest.sample_rate,
        (GenerateFrqRequest.perSamples / GenerateFrqRequest.sample_rate) * 1000
      );
      if (f0) {
        resolve(f0.f0);
      } else {
        resolve(null);
      }
    });
  }
}

export type GenerateFrqRequest = {
  data: Float64Array;
  sample_rate: number;
  perSamples: number;
};
