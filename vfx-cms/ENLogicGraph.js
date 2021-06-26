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
import { ENHtml } from "./ENHtmls";
import { ENDisplayCursor } from "./ENDisplayCursor";

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
        {/*  */}
        <LogicContent></LogicContent>
      </Canvas>

      {/*  */}
      <ENHtml></ENHtml>
    </div>
  );

  //
  // return <div>Canvas ID: {router.query.canvasID}</div>;
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

      <ENDisplayCursor></ENDisplayCursor>
      {/* <Text color="#000000">Loading...</Text> */}
    </group>
  );
}

//
