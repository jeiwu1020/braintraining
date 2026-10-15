import { chooseWall } from "./ai";
self.onmessage = (event) => {
  const { id, state } = event.data;
  try {
    self.postMessage({ id, ...chooseWall(state) });
  } catch {
    self.postMessage({ id, error: "無法計算" });
  }
};
