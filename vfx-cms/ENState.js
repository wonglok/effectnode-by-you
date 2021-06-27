import { Vector3 } from "three";
import { getID, makeShallowStore } from "../vfx-runtime/ENUtils";
import { firebase } from "./firebase";
export const ENState = makeShallowStore({
  listing: [],
  listingReload: 0,

  //
  canvasID: false,
  canvasOwnerID: false,

  // overlay
  overlay: "",

  // position
  cursorMode: "ready",
  hovering: "floor",
  draggingNodeID: false,
  draggingIOID: false,

  cursorAt: new Vector3(),
  dragStartPos: new Vector3(),
  isDown: false,

  nodes: [],
  connections: [],
});

export class ENMethods {
  static addCodeBlock({ point }) {
    //

    ENState.overlay = "";
    ENState.cursorMode = "ready";
    ENState.hovering = "floor";

    let ref = firebase
      .database()
      .ref(`/canvas/${ENState.canvasID}/${ENState.canvasOwnerID}/nodes`);

    let newItem = ref.push();

    let nodeID = getID();
    newItem.set({
      _id: nodeID,
      position: point.toArray(),
      inputs: [
        //
        { _id: getID(), type: "input", nodeID },
        { _id: getID(), type: "input", nodeID },
        { _id: getID(), type: "input", nodeID },
        { _id: getID(), type: "input", nodeID },
        { _id: getID(), type: "input", nodeID },
      ],
      outputs: [
        //
        { _id: getID(), type: "output", nodeID },
        { _id: getID(), type: "output", nodeID },
        { _id: getID(), type: "output", nodeID },
        { _id: getID(), type: "output", nodeID },
        { _id: getID(), type: "output", nodeID },
      ],
    });
  }

  static saveCodeBlock({ node }) {
    let ref = firebase
      .database()
      .ref(
        `/canvas/${ENState.canvasID}/${ENState.canvasOwnerID}/nodes/${node._id}`
      );

    ref.set(node.data);
  }

  static addLink({ input, output }) {
    let ref = firebase
      .database()
      .ref(`/canvas/${ENState.canvasID}/${ENState.canvasOwnerID}/connections`);

    let newItem = ref.push();

    newItem.set({
      input,
      output,
    });
  }
}

//
