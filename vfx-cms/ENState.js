import { Vector3 } from "three";
import { makeShallowStore } from "../vfx-runtime/ENUtils";
export const ENState = makeShallowStore({
  listing: [],
  listingReload: 0,

  //
  canvasID: false,

  // overlay
  overlay: "",

  // position
  movementXY: { x: 0, y: 0 },
  cursorMode: "ready",
  cursorAt: new Vector3(),
  isDown: false,
});
