import {
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  // AdditiveBlending,
} from "three";

export class InteractionUI {
  static async hoverPlane({ mini }) {
    let raycaster = await mini.ready.raycaster;
    let mouse = await mini.ready.mouse;
    let camera = await mini.ready.camera;
    let scene = await mini.ready.scene;
    let viewport = await mini.ready.viewport;

    let geoPlane = new PlaneBufferGeometry(
      3.0 * viewport.width,
      3.0 * viewport.height,
      2,
      2
    );

    let matPlane = new MeshBasicMaterial({
      transparent: true,
      opacity: 0.25,
      color: 0xbababa,
    });

    let planeMesh = new Mesh(geoPlane, matPlane);
    planeMesh.position.z = -camera.position.z / 2;

    scene.add(planeMesh);
    mini.onClean(() => {
      scene.remove(planeMesh);
    });

    let temppos = new Vector3();
    mini.onLoop(() => {
      planeMesh.lookAt(camera.position);
      raycaster.setFromCamera(mouse, camera);
      let res = raycaster.intersectObject(planeMesh);
      if (res && res[0]) {
        temppos.copy(res[0].point);
      }
    });

    return temppos;
  }
}
