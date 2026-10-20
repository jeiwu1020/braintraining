import { chooseNight } from "./ai";
self.onmessage = (event) => {
  const { id, observation, seed, difficulty } = event.data;
  try {
    self.postMessage({
      id,
      action: { type: "pick", slot: chooseNight(observation, seed, difficulty) },
    });
  } catch {
    self.postMessage({ id, error: "無法計算" });
  }
};
