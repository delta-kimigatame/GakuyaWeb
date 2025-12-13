import { Log } from "../lib/Logging";
import { GenerateFrqRequest } from "../services/GenerateFrq";
import { Frq } from "../lib/UtauFrq";
import { waitForWorkerMessage } from "./worker";

let workerIdCounter = 0;

export class GenerateFrqWorker {
  private worker: Worker;
  public isReady: boolean = false;
  private readyPromise: Promise<void>;
  constructor() {
    Log.info(
      "generate frq workerのロード開始",
      "generateFrqWorker.GenerateFrqWorker"
    );
    this.worker = new Worker(
      new URL("../worker/GenerateFrq.ts", import.meta.url),
      {
        type: "module",
      }
    );

    // "init-started" メッセージを受信した場合にログを出力するリスナーを追加
    this.worker.addEventListener("message", (event: MessageEvent) => {
      if (event.data && event.data.type === "debug") {
        Log.debug(
          `generate frq workerからのデバッグメッセージ:${event.data.data}`,
          "generateFrqWorker.GenerateFrqWorker"
        );
      } else if (event.data && event.data.type === "error") {
        Log.warn(
          `generate frq workerからのエラーメッセージ:${JSON.stringify(
            event.data.error
          )}`,
          "generateFrqWorker.GenerateFrqWorker"
        );
      }
    });
    // ready 状態を管理する Promise を作成
    this.readyPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.worker.removeEventListener("message", handler);
        Log.error(
          `generate frq workerの初期化タイムアウト`,
          "generateFrqWorker.GenerateFrqWorker"
        );
        // reject(new Error("generate frq workerの初期化がタイムアウトしました"));
      }, 60000);
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === "ready") {
          clearTimeout(timeout);
          Log.info(
            "generate frq workerのロード完了",
            "generateFrqWorker.GenerateFrqWorker"
          );
          this.isReady = true;
          this.worker.removeEventListener("message", handler);
          resolve();
        } else if (event.data && event.data.type === "error") {
          clearTimeout(timeout);
          Log.warn(
            `generate frq workerからのエラーメッセージ:${JSON.stringify(
              event.data.error
            )}`,
            "generateFrqWorker.GenerateFrqWorker"
          );
          // reject(new Error("generate frq workerでエラーが発生しました"));
        }
      };
      this.worker.addEventListener("message", handler);
    });
  }
  /**
   * Worker の初期化完了を待ちます。
   * @returns Promise<void> - 初期化完了時に解決される Promise
   */
  public async waitUntilReady(): Promise<void> {
    return this.readyPromise;
  }

  public async processGenerateFrq(
    request: GenerateFrqRequest
  ): Promise<Frq | null> {
    // Worker の初期化が完了していることを保証
    await this.waitUntilReady();
    Log.info(`frq生成request準備`, "generateFrqWorker.GenerateFrqWorker");
    const workerRequest: GenerateFrqRequest = {
      data: request.data,
      sample_rate: request.sample_rate,
      perSamples: request.perSamples
    };
    // 一意なリクエスト ID を生成
    const requestId = workerIdCounter++;
    const responsePromise = waitForWorkerMessage(
      this.worker,
      (data) => data.id === requestId
    );
    Log.debug(
      `workerにfrq生成リクエスト送信:sample_rate=${workerRequest.sample_rate}, perSamples=${workerRequest.perSamples}, dataLength=${workerRequest.data.length}、requestId:${requestId}`,
      "generateFrqWorker.GenerateFrqWorker"
    );
    this.worker.postMessage({ id: requestId, request: workerRequest }, { transfer: [workerRequest.data.buffer] });
    // Worker からのレスポンスを待ち、結果を返す
    const response = await responsePromise;
    if (response.error) {
      Log.error(
        `requestId:${requestId}、${response.error}`,
        "generateFrqWorker.GenerateFrqWorker"
      );
      throw new Error(response.error);
    }
    Log.info(
      `frq生成完了。requestId:${requestId}`,
      "generateFrqWorker.GenerateFrqWorker"
    );
    if (response.result === null) {
      Log.warn(
        `frq生成に失敗しました。requestId:${requestId}`,
        "generateFrqWorker.GenerateFrqWorker"
      );
      return null;
    }
    const frq = new Frq({ 
      frq: response.result, 
      data: response.data,
      perSamples: workerRequest.perSamples 
    });
    frq.autoCorrectFrequency();
    // 返された結果は Float64Array として受け取る
    return frq;
  }
}
