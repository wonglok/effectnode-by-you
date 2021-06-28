export function NoBloomRenderLoop() {
  let run = ({ gl, scene, camera }, dt) => {
    gl.autoClear = false;
    gl.clear();
    gl.render(scene, camera);
  };

  useFrame((state, dt) => {
    run(state, dt);
  }, 1000);

  return null;
}
