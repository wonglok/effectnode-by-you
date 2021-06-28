// import { useFrame } from "@react-three/fiber";
import { MapControls, meshBounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { ENMethods, ENState } from "./ENState";

//

export function ENControls() {
  let { camera } = useThree();

  let mapControls = useRef();

  useEffect(() => {
    camera.position.X = 0;
    camera.position.y = 50;
    camera.position.z = 75;
    camera.fov = 45;
    camera.lookAt(0, 0, 0);
    camera.near = 0.1;
    camera.far = 10000.0;

    camera.updateProjectionMatrix();
  }, [mapControls.current]);

  //
  // ----- ----- ----- ----- -----
  //

  // ENState.useReactiveKey("movementXY", () => {
  //   // console.log(ENState.movementXY);
  // });

  // useFrame(({ raycaster, mouse, camera }) => {
  //   raycaster.setFromCamera(mouse, camera);
  // });

  // let { raycaster, scene } = useThree();
  // let getFloorPt = () => {
  //   let floor = scene.getObjectByName("floor");
  //   let found = raycaster.intersectObject(floor);
  //   let first = found[0];
  //   if (first) {
  //     return first.point;
  //   }
  // };

  //
  //
  //

  let syncCursor = () => {
    if (ENState.hovering === "floor") {
      if (ENState.cursorMode === "ready") {
        document.body.style.cursor = "grab";
      } else if (ENState.cursorMode === "pan") {
        document.body.style.cursor = "grabbing";
      } else if (ENState.cursorMode === "addCodeBlock") {
        document.body.style.cursor = "crosshair";
      }
    } else if (ENState.hovering === "object") {
      document.body.style.cursor = "pointer";
    } else if (ENState.hovering === "overlay") {
      document.body.style.cursor = "";
    } else {
      document.body.style.cursor = "";
    }
  };

  ENState.useReactiveKey("overlay", syncCursor);
  ENState.useReactiveKey("cursorMode", syncCursor);
  ENState.useReactiveKey("hovering", syncCursor);
  ENState.useReactiveKey("draggingNodeID", () => {
    mapControls.current.enabled = !ENState.draggingNodeID;
  });
  ENState.useReactiveKey("draggingIOID", () => {
    mapControls.current.enabled = !ENState.draggingIOID;
  });

  let eventsHandlers = {
    //
    onPointerDown: ({ point }) => {
      ENState.isDown = true;
      if (ENState.cursorMode === "ready") {
        ENState.cursorMode = "pan";
      }
      if (ENState.cursorMode === "addCodeBlock") {
        ENMethods.addCodeBlock({ point });
      }
    },

    //
    onPointerUp: ({ point }) => {
      ENState.isDown = false;
      if (ENState.cursorMode === "pan") {
        ENState.cursorMode = "ready";
      }

      setTimeout(() => {
        if (ENState.draggingIOID) {
          ENState.draggingIOID = false;
        }
      }, 100);
    },

    onPointerEnter: () => {},

    //
    onPointerMove: (ev) => {
      ENState.moved++;
      ev.stopPropagation();
      if (ENState.hovering !== "floor") {
        ENState.hovering = "floor";
      }
      ENState.cursorAt.copy(ev.point);

      //
      //
      //
      // console.log(ev);
      // ENState.movementXY = {
      //   x: ev.movementX,
      //   y: ev.movementY,
      // };
      //
      // console.log(ev.movementX, ev.movementY);
      // ENState.isDown = false;
    },
  };

  useEffect(() => {
    window.addEventListener(
      "touchstart",
      (ev) => {
        ev.preventDefault();
      },
      { passive: false }
    );

    window.addEventListener(
      "touchmove",
      (ev) => {
        ev.preventDefault();
      },
      { passive: false }
    );
  }, []);

  return (
    <group>
      {/*  */}
      <MapControls
        //
        screenSpacePanning={false}
        // dampingFactor={0.1}

        ref={mapControls}
      ></MapControls>

      <mesh
        visible={false}
        name="floor"
        rotation-x={Math.PI * -0.5}
        {...eventsHandlers}
      >
        <planeBufferGeometry args={[1000, 1000, 2, 2]}></planeBufferGeometry>

        <shaderMaterial
          fragmentShader={`void main (void) { discard; }`}
        ></shaderMaterial>
      </mesh>

      <gridHelper
        raycast={() => {}}
        position-y={0.01}
        args={[1000, 100, "#232323", "#232323"]}
      ></gridHelper>
    </group>
  );
}
