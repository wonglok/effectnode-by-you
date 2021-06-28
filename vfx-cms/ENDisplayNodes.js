import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ENLink } from "./ENLink";
import { ENNode } from "./ENNode";
import { ENState } from "./ENState";
import { firebase } from "./firebase";

export function ENDisplayNodes() {
  let [nodes, setNodes] = useState([]);

  ENState.makeKeyReactive("canvasOwnerID");
  ENState.makeKeyReactive("canvasID");

  let canvasID = ENState.canvasID;
  let canvasOwnerID = ENState.canvasOwnerID;
  useEffect(() => {
    if (!canvasID) {
      return () => {};
    }

    if (!canvasOwnerID) {
      return () => {};
    }

    //
    let unsusbs = firebase
      .database()
      .ref(`/canvas/${canvasID}/${canvasOwnerID}/nodes`)
      .on("value", (snap) => {
        if (snap) {
          let arr = [];

          let val = snap.val();

          for (let kn in val) {
            arr.push({
              _id: kn,
              data: val[kn],
            });
          }
          ENState.nodes = arr;

          setNodes(arr);
        }
      });
    return () => {
      unsusbs();
    };
  }, [canvasID, canvasOwnerID]);

  return (
    <group>
      {nodes.map((node) => {
        return <ENNode key={node._id} node={node}></ENNode>;
      })}
    </group>
  );
}

export function ENDisplayLinks() {
  let [links, setLinks] = useState([]);

  ENState.makeKeyReactive("canvasOwnerID");
  ENState.makeKeyReactive("canvasID");

  let canvasID = ENState.canvasID;
  let canvasOwnerID = ENState.canvasOwnerID;
  useEffect(() => {
    if (!canvasID) {
      return () => {};
    }
    if (!canvasOwnerID) {
      return () => {};
    }

    //
    return firebase
      .database()
      .ref(`/canvas/${canvasID}/${canvasOwnerID}/connections`)
      .on("value", (snap) => {
        if (snap) {
          let arr = [];

          let val = snap.val();

          for (let kn in val) {
            arr.push({
              _id: kn,
              data: val[kn],
            });
          }

          ENState.connections = arr;

          setLinks(arr);
          console.log(arr);
        }
      });
  }, [canvasID, canvasOwnerID]);

  return (
    <group>
      {links.map((link) => {
        return <ENLink key={link._id} link={link}></ENLink>;
      })}
    </group>
  );
}
