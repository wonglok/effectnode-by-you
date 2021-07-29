import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bloomer } from "../vfx-library/Bloomer";
import { InteractionUI } from "../vfx-library/InteractionUI";
import { getGPUTier } from "detect-gpu";
import { ENLogicGraphAutoLoad } from "../vfx-runtime/ENLogicGraph";
// import anime from ;

export default function IndexPage() {
  let ref = useRef();

  let [dpr, setDPR] = useState([1, 3]);

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
          {/* content-firework */}
          <ENLogicGraphAutoLoad
            graphID={"-Mdt9_VlG9tbWg1yUiuo"}
          ></ENLogicGraphAutoLoad>

          <Bloomer></Bloomer>

          <OrbitControls enableRotate={false} enablePan={false}></OrbitControls>
        </Canvas>
      </div>
      <div className="absolute top-0 right-0">
        <a
          href="/examples"
          onClick={(ev) => {
            ev.preventDefault();
            import(/* webpackPreload: true */ "animejs/lib/anime.es.js").then(
              ({ default: anime }) => {
                anime({
                  targets: `body`,
                  opacity: 0,
                  duration: 1000,
                  easing: "easeInOutQuad",
                  complete: () => {
                    window.location.assign("/examples");
                  },
                });
              }
            );
          }}
        >
          <button className="m-3 text-sm bg-white border p-3">Examples</button>
        </a>

        <a href="/effectnode" target="_blank">
          <button className="m-3 text-sm bg-white border p-3">CMS</button>
        </a>

        <a href="https://docs.effectnode.com/" target="_blank">
          <button className="m-3 text-sm bg-white border p-3">
            Docs &#8599;
          </button>
        </a>
        <a href="https://effectnode.com/" target="_blank">
          <button className="m-3 text-sm bg-white border p-3">
            Home &#8599;
          </button>
        </a>
      </div>
    </>
  );
}
