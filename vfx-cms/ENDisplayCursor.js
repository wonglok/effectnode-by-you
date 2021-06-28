import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BufferAttribute, CatmullRomCurve3, Color, Vector3 } from "three";
import { ENState } from "./ENState";

export function ENDisplayCursor() {
  ENState.makeKeyReactive("cursorMode");

  let gp = useRef();

  useFrame(() => {
    if (gp.current) {
      gp.current.position.lerp(ENState.cursorAt, 0.5);
    }
  });
  return (
    <group visible={!("ontouchstart" in window)} ref={gp}>
      {ENState.cursorMode === "addCodeBlock" && (
        <group>
          <mesh position-y={1} rotation-x={Math.PI * 1}>
            <coneBufferGeometry args={[0.8, 2, 32, 1]}></coneBufferGeometry>
            <meshStandardMaterial
              color={"#bababa"}
              roughness={0.3}
              metalness={1}
            ></meshStandardMaterial>
          </mesh>

          <group rotation-x={Math.PI * -0.25} position-y={3}>
            <Text
              color={"#000000"}
              fontSize={0.7}
              maxWidth={200}
              lineHeight={1}
              textAlign={"center"}
              font="/font/Cronos-Pro-Light_12448.ttf"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.04}
              outlineColor="#ffffff"
            >{`Click to add`}</Text>
          </group>
        </group>
      )}
    </group>
  );
}

export const getGeo = ({ a, b, dotted = false }) => {
  const {
    LineSegmentsGeometry,
  } = require("three/examples/jsm/lines/LineSegmentsGeometry");
  const { LineGeometry } = require("three/examples/jsm/lines/LineGeometry");

  const dist = new Vector3().copy(a).distanceTo(b);
  let raise = dist / 1.6;
  if (raise > 500) {
    raise = 500;
  }
  const curvePts = new CatmullRomCurve3(
    [
      new Vector3(a.x, a.y, a.z),
      new Vector3(a.x, a.y + raise, a.z),
      new Vector3(b.x, b.y + raise, b.z),
      new Vector3(b.x, b.y, b.z),
    ],
    false
  );

  let lineGeo = new LineGeometry();
  if (dotted) {
    lineGeo = new LineSegmentsGeometry();
  }
  let colors = [];
  let pos = [];
  let count = 100;
  let temp = new Vector3();

  let colorA = new Color();
  let colorB = new Color("#0000ff");

  for (let i = 0; i < count; i++) {
    curvePts.getPointAt((i / count) % 1, temp);
    if (isNaN(temp.x)) {
      temp.x = 0.0;
    }
    if (isNaN(temp.y)) {
      temp.y = 0.0;
    }
    if (isNaN(temp.z)) {
      temp.z = 0.0;
    }
    pos.push(temp.x, temp.y, temp.z);
    colorA.setStyle("#00ff00");
    colorA.lerp(colorB, i / count);

    //
    colorA.offsetHSL(0, 0.5, 0.0);
    colors.push(colorA.r, colorA.g, colorA.b);
  }

  lineGeo.setColors(colors);

  lineGeo.setPositions(pos);
  return lineGeo;
};

export function ENDisplayConnectorWire() {
  ENState.makeKeyReactive("draggingIOID");

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

  let mesh = useMemo(() => {
    let cursorPos = new Vector3().copy(ENState.cursorAt);
    cursorPos.set(1, 1, 1);

    let dragStartPos = new Vector3(1, 1, 1).copy(ENState.dragStartPos);

    let lineGeo = getGeo({ a: cursorPos, b: dragStartPos, dotted: true });

    const mesh = new Line2(lineGeo, lineMat);
    mesh.computeLineDistances();

    let needsUpdate = false;
    works.current.updateLine = () => {
      if (
        ENState.isDown &&
        !(
          cursorPos.x === ENState.cursorAt.x &&
          cursorPos.y === ENState.cursorAt.y &&
          cursorPos.z === ENState.cursorAt.z
        )
      ) {
        needsUpdate = true;
      }
      cursorPos.copy(ENState.cursorAt);

      if (needsUpdate) {
        //
        let lineGeo = getGeo({ a: cursorPos, b: dragStartPos, dotted: true });
        mesh.geometry = lineGeo;
      }
    };

    return mesh;
  });

  useFrame(() => {
    Object.values(works.current).forEach((w) => w());
  });

  return (
    <group>
      {ENState.draggingIOID && <primitive object={mesh}></primitive>}
    </group>
  );
}
