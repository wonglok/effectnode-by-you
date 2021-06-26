// import { useRouter } from "next/router";
import { Canvas } from "@react-three/fiber";

export function ENLogicGraph() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        dpr={(typeof window !== "undefined" && window.devicePixelRatio) || 1.0}
      >
        <LogicContent></LogicContent>
      </Canvas>
    </div>
  );
  // return <div>Canvas ID: {router.query.canvasID}</div>;
}

function LogicContent() {
  // let router = useRouter();
  return <group></group>;
}
