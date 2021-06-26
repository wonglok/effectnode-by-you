import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/router";

//
import { ENState } from "./ENState";
import { ENControls } from "./ENControls";

//
// import { Text } from "@react-three/drei";
import { ENCore } from "./ENBuildings";
import { ENHDRI } from "./ENHDRI";
import { useEffect } from "react";

export function ENLogicGraph() {
  let router = useRouter();

  useEffect(() => {
    ENState.canvasID = router.query.canvasID;
  }, [router.query.canvasID]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        dpr={(typeof window !== "undefined" && window.devicePixelRatio) || 1.0}
      >
        <LogicContent></LogicContent>
      </Canvas>

      {/*  */}
      <HTMLs></HTMLs>
    </div>
  );

  //
  // return <div>Canvas ID: {router.query.canvasID}</div>;
}

function HTMLs() {
  ENState.makeKeyReactive("overlay");

  return (
    <>
      {ENState.overlay === "main" && (
        <div className="w-full h-full absolute top-0 left-0 bg-white  bg-opacity-95">
          {/*  */}
          123
        </div>
      )}
    </>
  );
}

// ENState
function LogicContent() {
  return (
    <group>
      {/*  */}
      <ENControls></ENControls>

      <directionalLight
        position={[10, 10, -10]}
        args={["#ffffff", 0.5]}
      ></directionalLight>

      <directionalLight
        position={[-10, 10, 10]}
        args={["#ffffff", 0.5]}
      ></directionalLight>

      <ENHDRI></ENHDRI>

      <ENCore></ENCore>
      {/* <Text color="#000000">Loading...</Text> */}
    </group>
  );
}

//
