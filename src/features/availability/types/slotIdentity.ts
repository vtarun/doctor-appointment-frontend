import type { Slot } from "./index";

export const sameSlot = (left: Slot | null, right: Slot) =>
  left?.startTime === right.startTime && left.endTime === right.endTime;
