import { chooseMaster } from "./masterAi";
self.onmessage = (e) => {
  try {
    self.postMessage({
      id: e.data.id,
      action: {
        type: "pick",
        slot: chooseMaster(e.data.observation, e.data.seed, e.data.difficulty),
      },
    });
  } catch {
    self.postMessage({ id: e.data.id, error: true });
  }
};
