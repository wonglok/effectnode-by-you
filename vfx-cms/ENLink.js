import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, Vector3 } from "three";
import { getGeo } from "./ENDisplayCursor";
import { ENState } from "./ENState";

export function ENLink({ link }) {
  // getGeo()

  const { LineMaterial } = require("three/examples/jsm/lines/LineMaterial");
  // const { LineGeometry } = require("three/examples/jsm/lines/LineGeometry");
  const { Line2 } = require("three/examples/jsm/lines/Line2");
  const lineMat = useMemo(() => {
    const material = new LineMaterial({
      transparent: true,
      color: new Color("#00ffff"),
      linewidth: 0.0015,
      opacity: 1.0,
      dashed: true,
      vertexColors: false,
    });

    return material;
  }, []);
  let works = useRef({});

  let { scene } = useThree();

  let mesh = useMemo(() => {
    //

    let inputV3 = new Vector3();
    let outputV3 = new Vector3();

    let lineGeo = getGeo({ a: inputV3, b: outputV3 });

    const mesh = new Line2(lineGeo, lineMat);
    mesh.computeLineDistances();

    return mesh;
  }, []);

  useEffect(() => {
    let inputV3 = new Vector3();
    let outputV3 = new Vector3();

    let sig = "";
    works.current.updateLine = () => {
      let inputO3 = scene.getObjectByName(link.data.input._id);
      let outputO3 = scene.getObjectByName(link.data.output._id);

      if (inputO3 && outputO3) {
        inputO3.getWorldPosition(inputV3);
        outputO3.getWorldPosition(outputV3);

        if (sig !== inputV3.length() + outputV3.length()) {
          sig = inputV3.length() + outputV3.length();
          let lineGeo = getGeo({ a: inputV3, b: outputV3 });
          mesh.geometry = lineGeo;
        }
      }
    };

    //
  }, []);

  useFrame(() => {
    Object.values(works.current).forEach((w) => w());
  });

  return (
    <group>
      <primitive object={mesh}></primitive>
    </group>
  );
}
