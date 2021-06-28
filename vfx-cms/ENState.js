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
  addNodeTitle: "mytitle",

  cursorAt: new Vector3(),
  dragStartPos: new Vector3(),
  moved: 0,
  isDown: false,

  nodes: [],
  connections: [],

  currentEditSocketID: false,
  currentEditNodeID: false,
});

export class ENMethods {
  static addCodeBlock({ point }) {
    ENState.overlay = "";
    ENState.cursorMode = "ready";
    ENState.hovering = "floor";

    let ref = firebase
      .database()
      .ref(`/canvas/${ENState.canvasID}/${ENState.canvasOwnerID}/nodes`);

    let newItem = ref.push();

    let nodeID = getID();
    newItem.set({
      title: ENState.addNodeTitle,
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

  static removeCodeBlockByID({ nodeID }) {
    let ref = firebase
      .database()
      .ref(
        `/canvas/${ENState.canvasID}/${ENState.canvasOwnerID}/nodes/${nodeID}`
      );

    ref.remove();
  }

  static addLink({ input, output }) {
    let ref = firebase
      .database()
      .ref(`/canvas/${ENState.canvasID}/${ENState.canvasOwnerID}/connections`);

    let newItem = ref.push();

    newItem.set({
      _id: getID(),
      input,
      output,
    });
  }

  static removeLinkByID({ linkID }) {
    let ref = firebase
      .database()
      .ref(
        `/canvas/${ENState.canvasID}/${ENState.canvasOwnerID}/connections/${linkID}`
      );

    ref.remove();
  }

  static removeCurrentNodeAndConnections() {
    let nodeIDFire = ENState.currentEditNodeID;

    let node = ENState.nodes.find((e) => e._id === nodeIDFire);
    if (node) {
      let nodeID = node.data._id;

      let connIDs = ENState.connections
        .filter((conn) => {
          if (conn.data.input.nodeID === nodeID) {
            return true;
          }
          if (conn.data.output.nodeID === nodeID) {
            return true;
          }
        })
        .map((e) => e._id);

      connIDs.forEach((id) => {
        ENMethods.removeLinkByID({ linkID: id });
      });

      ENMethods.removeCodeBlockByID({
        nodeID: nodeIDFire,
      });

      ENState.currentEditNodeID = false;
    }
  }
}

//
