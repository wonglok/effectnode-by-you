import { Euler, Vector3 } from "three";
import { makeShallowStore } from "../vfx-runtime/ENUtils";

export const getDefaultMapState = () => ({
  //
  roomView: {
    target: new Vector3(),
    position: new Vector3(0, 100, 100),
  },

  //
  topView: {
    target: new Vector3(),
    position: new Vector3(0, 100, 0),
  },

  viewMode: "roomView",
});
export const ENMapState = makeShallowStore(getDefaultMapState());
