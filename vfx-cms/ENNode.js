import { meshBounds, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color, Vector3 } from "three";
import { ENMethods, ENState } from "./ENState";

let MyIO = ({ idx, io = "input", node, socket, e, total }) => {
  let v3 = new Vector3();
  let v3b = new Vector3();

  let orbit = 5;
  let radius = 1;

  let theta = e * -Math.PI;

  if (io === "output") {
    theta = Math.PI * e;
  }

  theta -= (0.5 * (Math.PI * 2)) / total;
  theta += Math.PI * 1.5;

  v3.setFromCylindricalCoords(orbit, theta, 0);
  v3b.setFromCylindricalCoords(orbit + 3, theta, 0);

  let scan = () => {
    if (
      ENState.draggingIOID &&
      ENState.draggingIOID.socket._id !== socket._id &&
      ENState.draggingIOID.node._id !== node._id &&
      ENState.draggingIOID.socket.type !== socket.type
    ) {
      //
      let pair = [{ node, socket }, { ...ENState.draggingIOID }];
      let input = pair.find((e) => e.socket.type === "input");
      let output = pair.find((e) => e.socket.type === "output");

      // console.log(input, output);
      if (input && output) {
        return { input, output };
      }
    }
  };

  return (
    //
    <>
      <mesh
        position-y={0}
        name={socket._id}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.target.setPointerCapture(e.pointerId);

          ENState.isDown = true;
          ENState.draggingIOID = {
            socket: JSON.parse(JSON.stringify(socket)),
            node: JSON.parse(JSON.stringify(node)),
          };
          ENState.dragStartPos.copy(ENState.cursorAt);
        }}
        //
        onPointerMove={({ eventObject }) => {
          eventObject.material.emissive = new Color("#323232");
          eventObject.material.needsUpdate = true;
        }}
        onPointerEnter={({ eventObject }) => {
          eventObject.material.emissive = new Color("#323232");
          eventObject.material.needsUpdate = true;
        }}
        onPointerLeave={({ eventObject }) => {
          eventObject.material.emissive = new Color("#000000");
          eventObject.material.needsUpdate = true;
        }}
        //
        onPointerUp={(e) => {
          e.stopPropagation();
          e.target.releasePointerCapture(e.pointerId);
          // ENMethods.saveCodeBlock({ node });

          let res = scan();

          if (res) {
            ENMethods.addLink({
              input: res.input.socket,
              output: res.output.socket,
            });
          }

          ENState.isDown = false;
          ENState.draggingIOID = false;
        }}
        //
        position={v3.toArray()}
        userData={socket}
      >
        {/* <boxBufferGeometry
        args={[radius * 1.5, radius * 1.5, radius * 1.5]}
      ></boxBufferGeometry> */}
        <sphereBufferGeometry args={[radius, 20, 20]}></sphereBufferGeometry>
        <meshStandardMaterial
          metalness={1}
          roughness={0.3}
          color={io === "input" ? "green" : "blue"}
        ></meshStandardMaterial>
      </mesh>

      <group position={v3b.toArray()}>
        <group
          position-z={io === "input" ? -0.1 : 0.1}
          rotation-x={Math.PI * -0.25}
        >
          <Text
            color={"#000000"}
            fontSize={1.5}
            maxWidth={200}
            lineHeight={1}
            textAlign={"center"}
            font="/font/Cronos-Pro-Light_12448.ttf"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.12}
            outlineColor="#ffffff"
          >{`${idx + 1}`}</Text>
        </group>
      </group>
    </>
  );
};

export function ENNode({ node }) {
  let radius = 1.75;
  let gp = useRef();

  useFrame(() => {
    if (gp.current) {
      if (ENState.draggingNodeID === node._id) {
        node.data.position = ENState.cursorAt.toArray();
      }
      gp.current.position.fromArray(node.data.position);
    }
  });

  return (
    <group position-y={radius}>
      <group ref={gp}>
        <group>
          <mesh
            raycast={meshBounds}
            onPointerDown={(e) => {
              ENState.isDown = true;
              ENState.draggingNodeID = node._id;
              ENState.moved = 0;
            }}
            onPointerUp={(e) => {
              ENState.isDown = false;
              ENState.draggingNodeID = false;
              ENMethods.saveCodeBlock({ node });

              if (ENState.moved <= 10) {
                ENState.currentEditNodeID = node._id;
                ENState.overlay = "node";
              }
              ENState.moved = 0;
            }}
          >
            <sphereBufferGeometry
              args={[radius, 32, 32]}
            ></sphereBufferGeometry>
            <meshStandardMaterial
              metalness={1}
              roughness={0.3}
            ></meshStandardMaterial>
          </mesh>
        </group>

        <group position-z={-1.11}>
          {node.data.inputs.map((e, idx, arr) => {
            //
            //
            //<MyIO io={input}></MyIO>

            return (
              <MyIO
                key={e._id}
                key={e._id}
                socket={e}
                node={node}
                idx={idx}
                e={(idx + 0) / arr.length}
                total={node.data.inputs.length + node.data.outputs.length}
              ></MyIO>
            );
          })}
        </group>

        <group position-z={1.11}>
          {node.data.outputs.map((e, idx, arr) => {
            //
            //
            //<MyIO io={input}></MyIO>

            return (
              <MyIO
                io={"output"}
                key={e._id}
                socket={e}
                node={node}
                idx={idx}
                e={(idx + 1) / arr.length}
                total={node.data.inputs.length + node.data.outputs.length}
              ></MyIO>
            );
          })}
        </group>
      </group>
    </group>
  );
}
