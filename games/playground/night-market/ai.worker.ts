import { chooseNight } from "./ai";
self.onmessage = (event) => {
  const { id, observation, seed } = event.data;
  try {
    self.postMessage({
      id,
      action: { type: "pick", slot: chooseNight(observation, seed) },
    });
  } catch {
    self.postMessage({ id, error: "無法計算" });
  }
};
