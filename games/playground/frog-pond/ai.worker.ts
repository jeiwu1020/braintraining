import { chooseFrogPond } from "./ai";

self.onmessage = (e: MessageEvent) => {
  const { id, state, options } = e.data;
  try {
    const action = chooseFrogPond(state, options);
    self.postMessage({ id, action, depth: options?.difficulty === "challenge" ? 3 : 1 });
  } catch (err) {
    self.postMessage({ id, error: err instanceof Error ? err.message : "AI error" });
  }
};
