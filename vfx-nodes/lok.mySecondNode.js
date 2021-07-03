import * as SpiritGeo from "../vfx-library/SpiritGeo";
export function effect({ mini, node }) {
  node.in0.stream((v) => {
    console.log(v);
  });
  SpiritGeo.example({ mini });

  mini.set(
    "MyOwnComponentABC",
    <mesh>
      <boxBufferGeometry args={[3, 3, 3, 2, 2, 2]}></boxBufferGeometry>
      <meshBasicMaterial wireframe={true}></meshBasicMaterial>
    </mesh>
  );
}
