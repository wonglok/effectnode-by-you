import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bloomer } from "../../vfx-library/Bloomer";
import { InteractionUI } from "../../vfx-library/InteractionUI";
import { getGPUTier } from "detect-gpu";
import {
  ENGraphJsonRunner,
  getEffectNodeData,
} from "../../vfx-runtime/ENLogicGraph";
// import anime from ;

let graphIDs = {
  fireworks: "-Mdt9_VlG9tbWg1yUiuo",
};

export default function IndexPage({ fireworks }) {
  let ref = useRef();

  let [dpr, setDPR] = useState([1, 3]);

  console.log("fireworks", fireworks);

  //
  useEffect(() => {
    return InteractionUI.fixTouchScreen({ target: ref.current });
  }, []);

  return (
    <>
      <div ref={ref} className="w-full h-full">
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
            });
          }}
          dpr={dpr}
        >
          {fireworks && (
            <ENGraphJsonRunner json={fireworks}></ENGraphJsonRunner>
          )}

          <Bloomer></Bloomer>

          <OrbitControls enableRotate={false} enablePan={false}></OrbitControls>
        </Canvas>
      </div>
    </>
  );
}

export async function getStaticProps(context) {
  let data = await getEffectNodeData(graphIDs.fireworks);

  if (!data) {
    return {
      props: {
        fireworks: false,
      },
    };
  }

  return {
    props: {
      fireworks: data,
    },
  };
}
