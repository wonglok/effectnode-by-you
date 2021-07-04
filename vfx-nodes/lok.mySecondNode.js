import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as SpiritGeo from "../vfx-library/SpiritGeo";
export function effect({ mini, node }) {
  node.in0.stream((v) => {
    console.log(v);
  });
  SpiritGeo.example({ mini });

  mini.set("myCompos", <MyCompos></MyCompos>);
}

function MyCompos() {
  let ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.01;
    }
  });

  return (
    <mesh ref={ref}>
      <boxBufferGeometry args={[3, 3, 3, 2, 2, 2]}></boxBufferGeometry>
      <meshBasicMaterial wireframe={true}></meshBasicMaterial>
    </mesh>
  );
}
