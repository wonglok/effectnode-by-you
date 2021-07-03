import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import axios from "axios";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { firebaseConfig } from "../vfx-cms/CONFIG";
import { Bloomer } from "../vfx-library/Bloomer";
import { InteractionUI } from "../vfx-library/InteractionUI";
import { ENRuntime, getCodes } from "../vfx-runtime/ENRuntime";
import { getGPUTier } from "detect-gpu";

export async function getStaticProps(context) {
  return {
    props: {
      graphA: await getEffectNodeData(`-MdBQtfGPXXPkl-NuEoW`), //
    },
  };
}

export default function IndexPage({ graphA }) {
  let ref = useRef();

  let [dpr, setDPR] = useState([1, 3]);
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
        <Suspense fallback={null}>
          {graphA && <ContentA json={graphA}></ContentA>}
        </Suspense>

        <Bloomer></Bloomer>

        <OrbitControls enableRotate={false} enablePan={false}></OrbitControls>
      </Canvas>
    </div>
  );
}

function ContentA({ json }) {
  let three = useThree();
  let graph = useRef();
  let [myInst, setCompos] = useState(() => {
    return <group></group>;
  });

  useEffect(() => {
    graph.current = new ENRuntime({ json, codes: getCodes() });

    graph.current.mini.get("MyOwnComponentABC").then((v) => {
      setCompos(v);
    });

    return () => {
      graph.current.clean();
    };
  }, []);

  useFrame(() => {
    if (graph.current) {
      for (let kn in three) {
        graph.current.mini.set(kn, three[kn]);
      }
      graph.current.mini.work();
    }
  });

  return <>{myInst}</>;
}

export async function getEffectNodeData(graphID) {
  return axios({
    method: "GET",
    url: `${firebaseConfig.databaseURL}canvas/${graphID}.json`,
  }).then(
    (response) => {
      let ans = false;
      for (let kn in response.data) {
        if (!ans) {
          ans = response.data[kn];
        }
      }
      if (ans) {
        let connections = [];

        for (let kn in ans.connections) {
          connections.push({
            _fid: kn,
            data: ans.connections[kn],
          });
        }

        let nodes = [];
        for (let kn in ans.nodes) {
          nodes.push({
            _fid: kn,
            data: ans.nodes[kn],
          });
        }

        return {
          connections,
          nodes,
        };
      } else {
        return false;
      }
    },
    () => {
      return false;
    }
  );
}
