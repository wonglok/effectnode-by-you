import { MapControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { ENFloor } from "./ENFloor";
import { ENMapState, getDefaultMapState } from "./ENMapState";

export function ENLayoutEditor() {
  return (
    <div className="h-full w-full relative flex items-stretch justify-start">
      {/*  */}
      <div className="h-full bg-gray-200" style={{ minWidth: `285px` }}>
        {/*  */}
        <HTMLContent></HTMLContent>
      </div>
      {/*  */}
      <div style={{ minWidth: `calc(100% - 285px * 2)` }}>
        <LayoutCanvas></LayoutCanvas>
      </div>
      {/*  */}
      <div className="h-full bg-gray-200" style={{ minWidth: `285px` }}>
        {/*  */}
      </div>
      {/*  */}
    </div>
  );
}

//

function LayoutCanvas() {
  useEffect(() => {
    let ms = getDefaultMapState();
    for (let kn in ms) {
      ENMapState[kn] = ms[kn];
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        dpr={(typeof window !== "undefined" && window.devicePixelRatio) || 1.0}
      >
        <LayouContent></LayouContent>
      </Canvas>
    </div>
  );
}

function LayouContent() {
  ENMapState.makeKeyReactive("viewMode");

  return (
    <group>
      {ENMapState.viewMode === "topView" && <TopView></TopView>}
      {ENMapState.viewMode === "roomView" && <RoomView></RoomView>}
      <ENFloor></ENFloor>
    </group>
  );
}

function HTMLContent() {
  return (
    <div>
      <ViewSettings></ViewSettings>
    </div>
  );
}

function ViewSettings() {
  return (
    <div>
      <div
        className="inline-block p-2 m-1 border bg-white cursor-pointer"
        onClick={() => {
          //
          ENMapState.viewMode = "topView";
        }}
      >
        Top View
      </div>
      <div
        className="inline-block p-2 m-1 border bg-white cursor-pointer"
        onClick={() => {
          //
          ENMapState.viewMode = "roomView";
        }}
      >
        Room View
      </div>
    </div>
  );
}

let useCamRig = ({ viewMode, controls, camera }) => {
  ENMapState.makeKeyReactive(viewMode);

  let isReady = useRef(false);
  let { scene } = useThree();
  useEffect(() => {
    return () => {
      scene.visible = false;
    };
  }, []);

  useFrame(() => {
    if (controls.current && isReady.current) {
      ENMapState[viewMode].position.copy(controls.current.object.position);
      ENMapState[viewMode].target.copy(controls.current.target);
      scene.visible = true;
    } else if (controls.current && !isReady.current) {
      controls.current.object.position.copy(ENMapState[viewMode].position);
      controls.current.target.copy(ENMapState[viewMode].target);
      isReady.current = true;
    }
  });
};

function TopView() {
  let controls = useRef();
  let camera = useRef();
  useCamRig({ controls, camera, viewMode: "topView" });

  return (
    <group>
      <PerspectiveCamera
        ref={camera}
        far={10000}
        near={0.1}
        fov={35}
        makeDefault
      ></PerspectiveCamera>
      <MapControls
        ref={controls}
        dampingFactor={0.05}
        enabled={true}
      ></MapControls>
    </group>
  );
}

function RoomView() {
  let controls = useRef();
  let camera = useRef();
  useCamRig({ controls, camera, viewMode: "roomView" });

  return (
    <group>
      <PerspectiveCamera
        ref={camera}
        far={10000}
        near={0.1}
        fov={45}
        makeDefault
      ></PerspectiveCamera>
      <MapControls
        ref={controls}
        dampingFactor={0.05}
        enabled={true}
      ></MapControls>
    </group>
  );
}
