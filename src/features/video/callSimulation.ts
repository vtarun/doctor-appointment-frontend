export type CallPhase = "pre-join" | "connecting" | "waiting" | "connected" | "reconnecting" | "failed" | "ended";
export type MediaSettings = { microphone: boolean; camera: boolean };
export type CallEvent = "join" | "ready" | "arrive" | "depart" | "interrupt" | "recover" | "fail" | "leave";

const transitions: Record<CallPhase, Partial<Record<CallEvent, CallPhase>>> = {
  "pre-join": { join: "connecting" },
  connecting: { ready: "waiting", fail: "failed", leave: "ended" },
  waiting: { arrive: "connected", fail: "failed", leave: "ended" },
  connected: { depart: "waiting", interrupt: "reconnecting", fail: "failed", leave: "ended" },
  reconnecting: { recover: "connected", fail: "failed", leave: "ended" },
  failed: { join: "connecting", leave: "ended" },
  ended: { join: "connecting" },
};

export const simulatedCall = {
  transition: (phase: CallPhase, event: CallEvent) => transitions[phase][event] ?? phase,
  toggleMedia: (settings: MediaSettings, device: keyof MediaSettings): MediaSettings =>
    ({ ...settings, [device]: !settings[device] }),
  // Simulated state only. These operations never request device access or send media.
  next: (phase: CallPhase): CallEvent | undefined =>
    phase === "connecting" ? "ready" : phase === "reconnecting" ? "recover" : undefined,
};
