import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { getGPUTier } from "detect-gpu";
import { useEffect, useRef, useState } from "react";
import { Bloomer } from "../vfx-library/Bloomer";
import { InteractionUI } from "../vfx-library/InteractionUI";
import { ENLogicGraphAutoLoad } from "../vfx-runtime/ENLogicGraph";

export default function RainNoodle() {
  let ref = useRef();
  let [dpr, setDPR] = useState([1, 3]);
  let [ok, setOK] = useState(false);

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
              setOK(true);
              return;
            }

            //
            if (v.fps < 30) {
              setDPR([1, 1]);
              setOK(true);
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

            setOK(true);
            return;
          });
        }}
        dpr={dpr}
      >
        {/* simulated-rain-noodle */}
        {ok && (
          <ENLogicGraphAutoLoad
            graphID={"-MffvLPL6dIsUEIf7GJ-"}
          ></ENLogicGraphAutoLoad>
        )}

        <Bloomer></Bloomer>

        {/* <OrbitControls></OrbitControls> */}
      </Canvas>
    </div>
  );
}
