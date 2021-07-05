import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { ENRuntime, getCodes } from "./ENRuntime";

export function ENLogicGraph({ json, componentName = "myCompos" }) {
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
