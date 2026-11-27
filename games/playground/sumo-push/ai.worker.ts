import { chooseSumoPush } from "./ai";

self.onmessage = (e: MessageEvent) => {
  const { id, state, options } = e.data;
  try {
    const action = chooseSumoPush(state, options);
    self.postMessage({ id, action, depth: options?.difficulty === "challenge" ? 2 : 1 });
  } catch (err) {
    self.postMessage({ id, error: err instanceof Error ? err.message : "AI error" });
  }
};
