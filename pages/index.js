import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Bloomer } from "../vfx-library/Bloomer";
import { InteractionUI } from "../vfx-library/InteractionUI";
import { getGPUTier } from "detect-gpu";
import { ENLogicGraphAutoLoad } from "../vfx-runtime/ENLogicGraph";

export default function IndexPage({ buildTimeCahce }) {
  let ref = useRef();

  //
  let [dpr, setDPR] = useState([1, 3]);

  //
  useEffect(() => {
    return InteractionUI.fixTouchScreen({ target: ref.current });
  }, []);

  return (
    <div ref={ref} className="w-full h-full">
      <Canvas
        onCreated={({ gl }) => {
          getGPUTier({ glContext: gl.getContext() }).then((v) => {
            // ipad
            if (v.gpu === "apple a9x gpu") {
              setDPR([1, 1]);
              return;
            }
            if (v.fps < 30) {
              setDPR([1, 1]);
              return;
            }

            if (v.tier >= 3) {
              setDPR([1, 3]);
            } else if (v.tier >= 2) {
              setDPR([1, 2]);
            } else if (v.tier >= 1) {
              setDPR([1, 1]);
            } else if (v.tier < 1) {
              setDPR([1, 0.75]);
            }
          });
        }}
        dpr={dpr}
      >
        <ENLogicGraphAutoLoad
          graphID={`-MdBQtfGPXXPkl-NuEoW`}
        ></ENLogicGraphAutoLoad>

        <Bloomer></Bloomer>

        <OrbitControls enableRotate={false} enablePan={false}></OrbitControls>
      </Canvas>

      <div className="absolute top-0 right-0">
        <a href="https://docs.effectnode.com/" target="_blank">
          <button className="m-3 text-sm bg-white border p-3">Docs</button>
        </a>
        <a href="https://effectnode.com/" target="_blank">
          <button className="m-3 text-sm bg-white border p-3">Home</button>
        </a>
      </div>
    </div>
  );
}
