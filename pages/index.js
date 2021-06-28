import { Canvas, useFrame, useThree } from "@react-three/fiber";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { firebaseConfig } from "../vfx-cms/CONFIG";
import { ENRuntime, getCodes } from "../vfx-runtime/ENRuntime";

export async function getStaticProps(context) {
  return {
    props: {
      graphA: await getEffectNodeData(`-MdBQtfGPXXPkl-NuEoW`), //
    },
  };
}

export default function IndexPage({ graphA }) {
  return (
    <div className="w-full h-full">
      <Canvas dpr={[1, 3]}>
        {graphA && <ContentA json={graphA}></ContentA>}
      </Canvas>
    </div>
  );
}

function ContentA({ json }) {
  let three = useThree();
  let graph = useRef();

  useEffect(() => {
    graph.current = new ENRuntime({ json, codes: getCodes() });

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

  return null;
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
