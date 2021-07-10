import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { ENRuntime, getCodes } from "./ENRuntime";
import useSWR from "swr";
import { getEffectNodeData } from "./ENUtils";

export function ENLogicGraphAutoLoad({
  graphID,
  componentName,
  progress = null,
}) {
  if (!graphID) {
    console.error("need graphID");
  }

  return (
    <Suspense fallback={progress}>
      <ENGraphLoader
        componentName={componentName}
        graphID={graphID}
      ></ENGraphLoader>
    </Suspense>
  );
}

export function ENLogicGraph({ json, componentName = "DefaultComponent" }) {
  let three = useThree();
  let graph = useRef();
  let [myInst, setCompos] = useState(() => {
    return <group></group>;
  });
  let mounter = useRef();

  useEffect(() => {
    graph.current = new ENRuntime({ json, codes: getCodes() });

    graph.current.mini.get(componentName).then((v) => {
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
      if (mounter.current) {
        graph.current.mini.set("mounter", mounter.current);
      }
      graph.current.mini.work();
    }
  });

  return (
    <>
      <group ref={mounter}>{myInst}</group>
    </>
  );
}

//

function ENGraphLoader({ graphID, componentName = "DefaultComponent" }) {
  let { data, error } = useSWR(`${graphID}`, async (id) => {
    let data = await getEffectNodeData(id);
    return data;
  });

  if (!data) {
    return <group></group>;
  }

  if (error) {
    console.log(error);
    return <group></group>;
  }

  return (
    <ENLogicGraph json={data} componentName={componentName}></ENLogicGraph>
  );
}

export { getEffectNodeData };
export function ENGraphJsonRunner({
  json,
  componentName = "DefaultComponent",
}) {
  //

  return (
    <ENLogicGraph json={json} componentName={componentName}></ENLogicGraph>
  );
}
