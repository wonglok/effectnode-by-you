import { Mesh, MeshBasicMaterial, SphereBufferGeometry } from "three";

export async function effect({ mini, node }) {
  let mounter = await mini.ready.mounter;
  // let camera = await mini.ready.camera;

  // camera.position.z = 10;
  // camera.lookAt(0, 0, 0);

  let geo = new SphereBufferGeometry(30, 32, 32);
  let mat = new MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  let mesh = new Mesh(geo, mat);
  mounter.add(mesh);

  mini.onLoop((st, dt) => {
    mesh.rotation.y += dt * 0.1;
  });

  mini.onClean(() => {
    mounter.remove(mesh);
  });

  node.out0.pulse({
    mesh,
  });
}
