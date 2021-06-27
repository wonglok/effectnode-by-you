import { meshBounds, Text, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
// import { Color } from "three";
import { MathUtils } from "three";
import { ShaderCubeChrome } from "../vfx-library/ShaderCubeChrome";
import { ENState } from "./ENState";

//

export function Laptop({ ...props }) {
  let { nodes, materials } = useGLTF(
    `/items-glb/mac-draco.glb`,
    `/items-glb/gltf/`
  );

  const group = useRef();

  const { gl } = useThree();

  const rainbow = useMemo(() => {
    let rainbow = new ShaderCubeChrome({
      renderer: gl,
      res: 128,
    });
    return rainbow;
  }, []);

  useEffect(() => {
    //
  }, []);

  useFrame((st, dt) => {
    const t = st.clock.getElapsedTime();
    rainbow.compute({ time: t, computeEnvMap: false });
  });

  // Make it float
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // group.current.rotation.x = MathUtils.lerp(
    //   group.current.rotation.x,
    //   Math.cos(t / 2) / 10 + 0.25,
    //   0.1
    // );

    // group.current.rotation.y = MathUtils.lerp(
    //   group.current.rotation.y,
    //   Math.sin(t / 4) / 10,
    //   0.1
    // );

    group.current.rotation.z = MathUtils.lerp(
      group.current.rotation.z,
      Math.sin(t / 4) / 20,
      0.1
    );

    group.current.position.y = MathUtils.lerp(
      group.current.position.y,
      (-5 + Math.sin(t)) / 5,
      0.1
    );
  });

  return (
    <group
      raycast={meshBounds}
      onPointerEnter={() => {
        //
        ENState.hovering = "object";
      }}
      onPointerLeave={() => {
        //
        ENState.hovering = "floor";
      }}
      //
      onPointerDown={(e) => {
        e.stopPropagation();
        e.target.setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        ENState.overlay = "main";
        ENState.hovering = "overlay";

        e.stopPropagation();
        e.target.releasePointerCapture(e.pointerId);
      }}
      ref={group}
      {...props}
      dispose={null}
    >
      <pointLight position-x={0} position-z={-2} position-y={2}></pointLight>
      <group rotation-x={Math.PI * 0.0} position={[0, -0.04, 0.41]}>
        <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          {/*  */}
          <mesh
            material={materials.aluminium}
            geometry={nodes["Cube008"].geometry}
          />

          {/*  */}
          <mesh
            material={materials["matte.001"]}
            geometry={nodes["Cube008_1"].geometry}
          />

          {/*  */}
          <mesh geometry={nodes["Cube008_2"].geometry}>
            {/* <mesh position={[0, 0.05, -0.09]}>

              <planeBufferGeometry args={[]}></planeBufferGeometry>
            </mesh> */}
            <meshBasicMaterial map={rainbow.out.texture}></meshBasicMaterial>
            {/* <Text position={[0, 0.05, -0.09]}>123</Text> */}
          </mesh>
        </group>
      </group>

      <group position={[0, 3, 1]} rotation-x={Math.PI * -0.25}>
        <Text
          color={"#000000"}
          fontSize={1.3}
          maxWidth={200}
          lineHeight={1}
          textAlign={"center"}
          font="/font/Cronos-Pro-Light_12448.ttf"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#ffffff"
        >{`Click to start`}</Text>
      </group>

      {/*  */}
      <mesh geometry={nodes.keyboard.geometry} position={[1.79, 0, 3.45]}>
        <meshStandardMaterial color="#222222"></meshStandardMaterial>
      </mesh>

      {/*  */}
      <group position={[0, -0.1, 3.39]}>
        <mesh
          material={materials.aluminium}
          geometry={nodes["Cube002"].geometry}
        />
        <mesh
          material={materials.trackpad}
          geometry={nodes["Cube002_1"].geometry}
        />
      </group>

      {/*  */}
      <mesh geometry={nodes.touchbar.geometry} position={[0, -0.03, 1.2]}>
        <meshStandardMaterial color="#222222"></meshStandardMaterial>
      </mesh>
    </group>
  );
}

export function ENCore() {
  //
  //

  return (
    <group>
      <Suspense fallback={null}>
        <group position-y={3}>
          <Laptop></Laptop>
        </group>
      </Suspense>
    </group>
  );
}
