import { Mesh, MeshBasicMaterial, SphereBufferGeometry } from "three";

export async function effect({ mini, node }) {
  let scene = await mini.ready.scene;
  console.log(scene);
  let camera = await mini.ready.camera;
  console.log(camera);

  camera.position.z = 10;
  camera.lookAt(0, 0, 0);

  let geo = new SphereBufferGeometry(3, 32, 32);
  let mat = new MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
  let mesh = new Mesh(geo, mat);
  scene.add(mesh);

  //
  mini.onClean(() => {
    scene.remove(mesh);
  });

  //
}
