import { chooseWall } from "./ai";
self.onmessage = (event) => {
  const { id, state, options } = event.data;
  try {
    self.postMessage({ id, ...chooseWall(state, undefined, undefined, options) });
  } catch {
    self.postMessage({ id, error: "無法計算" });
  }
};
