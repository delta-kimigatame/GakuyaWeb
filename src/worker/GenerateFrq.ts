import { GenerateFrq } from "../services/GenerateFrq";
import { GenerateFrqRequest } from "../services/GenerateFrq";

let generateFrq: GenerateFrq | null = null;

const initializeWorker=async():Promise<void>=>{
  postMessage({ type: "init-started" });
  postMessage({ type: "debug", data: "init-started" });
  try {
    postMessage({ type: "debug", data: "creating GenerateFrq instance" });
    generateFrq = new GenerateFrq();

    postMessage({ type: "debug", data: "calling generateFrq.initialize" });
    await generateFrq.initialize();

    postMessage({ type: "ready" });
  } catch (e) {
    postMessage({ type: "error", error: String(e) });
  }
};

/**
 * メッセージイベントリスナー
 * メインスレッドから送られてくるメッセージを受信し、GenerateFrqRequest を処理します。
 * 各メッセージには一意の id が付与され、結果またはエラーが同じ id とともに返されます。
 *
 * @param {MessageEvent} event - メインスレッドからのメッセージイベント
 */
self.addEventListener("message", async (event: MessageEvent) => {
  const { id, request } = event.data as {
    id: number;
    request: GenerateFrqRequest;
  };
  if (generateFrq === null) {
    postMessage({
      id,
      type: "error",
      error: "Worker not initialized",
    });
    return;
  }
  try {
    const result: Float64Array | null = await Promise.resolve(
      generateFrq.generateWorker(request)
    );
    if (result) {
      // dataも一緒に返す（両方ともTransferable）
      postMessage({ 
        id, 
        result, 
        data: request.data 
      }, { transfer: [result.buffer, request.data.buffer] });
    } else {
      postMessage({ id, result: null, data: null });
    }
  } catch (error) {
    postMessage({
      id,
      type: "error",
      error: error instanceof Error ? error.message : error,
    });
  }
});

initializeWorker().catch((err) => {
  postMessage({
    type: "error",
    error: err instanceof Error ? err.message : err,
  });
});
