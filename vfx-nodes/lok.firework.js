import { Vector3 } from "three";
// import { InteractionUI } from "../vfx-library/InteractionUI";
import { SpiritGeo } from "../vfx-library/SpiritGeo";
export async function effect({ mini, node }) {
  let tracker = new Vector3();
  let wiggle = new SpiritGeo({
    mini: mini,
    tracker,
  });

  let mounter = await mini.ready.mounter;
  let mouse = await mini.ready.mouse;
  let viewport = await mini.ready.viewport;

  mounter.add(wiggle.o3d);
  mini.onLoop(() => {
    let vp = viewport.getCurrentViewport();
    tracker.x = mouse.x * vp.width;
    tracker.y = mouse.y * vp.height;
    tracker.z = 0;
  });
}
