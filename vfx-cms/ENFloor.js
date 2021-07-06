import { ENMapState, addMapItem } from "./ENMapState";
import router from "next/router";
export function ENFloor() {
  return (
    <group>
      <mesh
        onClick={(ev) => {
          if (ENMapState.cursorMode === "add") {
            let graphs = ENMapState.logicGraphIDs;
            let graph = graphs.find((e) => e.key === ENMapState.chosenAddID);
            if (graph && router.query.ownerID && router.query.layoutID) {
              let {
                query: { ownerID, layoutID },
              } = router;
              let item = {
                graphID: graph.key,
                title: graph.value.title,
                position: [ev.point.x, 0, ev.point.z],
                scale: [1, 1, 1],
                rotation: [0, 0, 0],
              };
              addMapItem({ ownerID, layoutID, item });
            }
          }
        }}
        rotation-x={Math.PI * -0.5}
      >
        <planeBufferGeometry args={[1000, 1000, 2, 2]}></planeBufferGeometry>
        <shaderMaterial
          fragmentShader={`
            void main (void) {
              discard;
            }
        `}
        ></shaderMaterial>
      </mesh>
      <gridHelper
        raycast={() => {}}
        position-y={0.1}
        args={[1000, 100, "#333333", "#333333"]}
      ></gridHelper>
    </group>
  );
}
