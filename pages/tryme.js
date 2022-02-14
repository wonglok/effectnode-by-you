import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloomer } from "../vfx-library/Bloomer";
import { ENLogicGraphAutoLoad } from "../vfx-runtime/ENLogicGraph";

export default function TryMe() {
  let REPLACE_ME = `-MvpfxG3QZ37safQAPJS	`;
  return (
    <Canvas dpr={3}>
      {/* content-sphere */}
      <ENLogicGraphAutoLoad graphID={REPLACE_ME}></ENLogicGraphAutoLoad>

      <Bloomer></Bloomer>

      <OrbitControls enableRotate={false} enablePan={false}></OrbitControls>
    </Canvas>
  );
}
