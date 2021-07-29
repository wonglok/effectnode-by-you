import { Canvas } from "@react-three/fiber";
import { getGPUTier } from "detect-gpu";
import { useState } from "react";
import { Bloomer } from "../vfx-library/Bloomer";
import { ENLogicGraphAutoLoad } from "../vfx-runtime/ENLogicGraph";

export default function RainNoodle() {
  let [dpr, setDPR] = useState([1, 3]);
  let [ok, setOK] = useState(false);
  return (
    <div className="w-full h-full">
      <Canvas
        onCreated={({ gl }) => {
          getGPUTier({ glContext: gl.getContext() }).then((v) => {
            // ipad
            if (v.gpu === "apple a9x gpu") {
              setDPR([1, 1]);
              return;
            }

            //
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

            setOK(true);
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
      </Canvas>
    </div>
  );
}
