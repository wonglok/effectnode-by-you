import {
  MapControls,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ENFloor } from "./ENFloor";
import { ENMapState, getDefaultMapState } from "./ENMapState";
import { AddableItemsHTML, ENLayoutDevDisplay } from "./ENGraphManager";
import { getID, useAutoEvent } from "../vfx-runtime/ENUtils";

export function ENLayoutEditor() {
  // auto reset
  useEffect(() => {
    let ms = getDefaultMapState();
    for (let kn in ms) {
      ENMapState[kn] = ms[kn];
    }
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <div
        style={{ height: `calc(56px)` }}
        className="w-full bg-gray-100  border-b border-solid relative flex items-center justify-between"
      >
        <div className="px-1">
          <CursorMode></CursorMode>
        </div>
        <div className="px-1"></div>
        <div className="px-1">
          <ViewSettings></ViewSettings>
        </div>

        {/*  */}
      </div>
      <div
        style={{ height: `calc(100% - 56px)` }}
        className="w-full relative flex items-stretch justify-start"
      >
        <div className="h-full bg-gray-200" style={{ minWidth: `285px` }}>
          {/*  */}
          <LeftSidebarContent></LeftSidebarContent>
        </div>
        <div style={{ minWidth: `calc(100% - 285px * 2)` }}>
          <LayoutCanvas></LayoutCanvas>
        </div>
        <div className="h-full bg-gray-200" style={{ minWidth: `285px` }}>
          {/*  */}
          <RightSidebarContent></RightSidebarContent>
        </div>
        {/*  */}
      </div>
    </div>
  );
}

// mounter.current //

function LayoutCanvas() {
  let ref = useRef();

  useEffect(() => {
    if (ref.current) {
      let fnc = () => {};
      ref.current.addEventListener("wheel", fnc, { passive: false });

      return () => {
        ref.current.removeEventListener("wheel", fnc);
      };
    }
  }, []);

  //
  return (
    <div ref={ref} className="w-full h-full relative">
      <Canvas
        dpr={(typeof window !== "undefined" && window.devicePixelRatio) || 1.0}
      >
        <GLContent></GLContent>
        <ENLayoutDevDisplay></ENLayoutDevDisplay>
      </Canvas>
    </div>
  );
}

function GLContent() {
  ENMapState.makeKeyReactive("viewMode");

  return (
    <group>
      {ENMapState.viewMode === "topView" && <TopView></TopView>}
      {ENMapState.viewMode === "roomView" && <RoomView></RoomView>}
      {ENMapState.viewMode === "orbitView" && <OribtView></OribtView>}

      <ENFloor></ENFloor>
    </group>
  );
}

function LeftSidebarContent() {
  ENMapState.makeKeyReactive("cursorMode");

  return (
    <div>
      {ENMapState.cursorMode === "add" && <AddableItemsHTML></AddableItemsHTML>}
    </div>
  );
}

function RightSidebarContent() {
  //
  return <div>Content Outline</div>;
}

function CursorMode() {
  ENMapState.makeKeyReactive("cursorMode");

  return (
    <div className="">
      <div
        className={`inline-block border cursor-pointer px-3 py-1 m-1 ${
          ENMapState.cursorMode === "pan" ? "bg-green-200" : "bg-white"
        }`}
        onClick={() => {
          ENMapState.cursorMode = "pan";
        }}
      >
        Pan Around
      </div>
      <div
        className={`inline-block border cursor-pointer px-3 py-1 m-1 ${
          ENMapState.cursorMode === "add" ? "bg-green-200" : "bg-white"
        }`}
        onClick={() => {
          ENMapState.cursorMode = "add";
        }}
      >
        Add Item
      </div>
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
      <div
        className="inline-block p-2 m-1 border bg-white cursor-pointer"
        onClick={() => {
          //
          ENMapState.viewMode = "orbitView";
        }}
      >
        Orbit View
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

function OribtView() {
  let controls = useRef();
  let camera = useRef();
  useCamRig({ controls, camera, viewMode: "orbitView" });

  return (
    <group>
      <PerspectiveCamera
        ref={camera}
        far={10000}
        near={0.1}
        fov={45}
        makeDefault
      ></PerspectiveCamera>
      <OrbitControls
        ref={controls}
        dampingFactor={0.05}
        enabled={true}
      ></OrbitControls>
    </group>
  );
}
