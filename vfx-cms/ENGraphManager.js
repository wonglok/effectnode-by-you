import { useEffect, useState } from "react";
import { ENMapState, streamGraphIDs, streamMapItems } from "./ENMapState";
import router from "next/router";
import { ENLogicGraphAutoLoad } from "../vfx-runtime/ENLogicGraph";

export function AddableItemsHTML() {
  ENMapState.makeKeyReactive("logicGraphIDs");
  ENMapState.makeKeyReactive("chosenAddID");

  let [msg, setMsg] = useState("");
  useEffect(() => {
    let {
      query: { ownerID, layoutID },
    } = router;

    return streamGraphIDs({
      ownerID,
      fnc: (arr) => {
        ENMapState.logicGraphIDs = arr;
        if (arr[0]) {
          ENMapState.chosenAddID = arr[0].key;
        } else {
          setMsg("You dont have logic graphs to add to layout.");
        }
      },
    });
  }, []);

  return (
    <div>
      {msg}

      {ENMapState.logicGraphIDs.map((e) => {
        return (
          <div
            className={`py-1 px-2 cursor-pointer ${
              ENMapState.chosenAddID === e.key
                ? `bg-green-300 `
                : `hover:bg-gray-300 `
            }`}
            key={e.key}
            onClick={() => {
              ENMapState.chosenAddID = e.key;
            }}
          >
            {e.value.title}
          </div>
        );
      })}
    </div>
  );
}

export function ENLayoutDevDisplay() {
  ENMapState.makeKeyReactive("layoutItemsListing");

  useEffect(() => {
    let {
      query: { ownerID, layoutID },
    } = router;

    return streamMapItems({
      ownerID,
      layoutID,
      fnc: (arr) => {
        ENMapState.layoutItemsListing = arr;
      },
    });
  }, []);

  return (
    <group>
      {ENMapState.layoutItemsListing.map((e) => {
        return (
          <group
            key={e.key}
            position={e.value.position}
            scale={e.value.scale}
            rotation={e.value.rotation}
          >
            <ENLogicGraphAutoLoad
              graphID={e.value.graphID}
            ></ENLogicGraphAutoLoad>
          </group>
        );

        // return <ENLogicGraphAutoLoad graphID={e.value.graphID}></ENLogicGraphAutoLoad>;
      })}
    </group>
  );
}
