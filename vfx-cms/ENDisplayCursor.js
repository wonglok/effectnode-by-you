import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { ENState } from "./ENState";

export function ENDisplayCursor() {
  ENState.makeKeyReactive("cursorMode");
  let gp = useRef();

  useEffect(() => {
    //
    //
    //
    //
  }, []);

  useFrame(() => {
    if (gp.current) {
      gp.current.position.copy(ENState.cursorAt);
    }
  });
  return (
    <group visible={!("ontouchstart" in window)} ref={gp}>
      <mesh>
        <sphereBufferGeometry args={[1.35, 32, 32]}></sphereBufferGeometry>
        <meshStandardMaterial
          roughness={0.3}
          metalness={1}
        ></meshStandardMaterial>
      </mesh>

      {ENState.cursorMode === "addCodeBlock" && (
        <group rotation-x={Math.PI * -0.25} position-y={3}>
          <Text
            color={"#000000"}
            fontSize={0.7}
            maxWidth={200}
            lineHeight={1}
            textAlign={"center"}
            font="/font/Cronos-Pro-Light_12448.ttf"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#ffffff"
          >{`Click to add`}</Text>
        </group>
      )}
    </group>
  );
}
