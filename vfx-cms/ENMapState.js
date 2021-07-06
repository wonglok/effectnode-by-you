import { Euler, Vector3 } from "three";
import { makeShallowStore } from "../vfx-runtime/ENUtils";
import { onReady } from "./firebase";
export const getDefaultMapState = () => ({
  viewMode: "roomView",

  //
  roomView: {
    target: new Vector3(),
    position: new Vector3(0, 25, 25),
  },

  //
  topView: {
    target: new Vector3(),
    position: new Vector3(0, 25, 0),
  },

  orbitView: {
    target: new Vector3(),
    position: new Vector3(25, 25, 25),
  },

  layoutItemsListing: [],
  logicGraphIDs: [],

  // cursor
  cursorMode: "pan", // add, drag
  // add type
  chosenAddID: false,
});

export const ENMapState = makeShallowStore(getDefaultMapState());

export const toArray = (value) => {
  //
  let arr = [];

  for (let kn in value) {
    arr.push({
      key: kn,
      value: value[kn],
    });
  }

  return arr;
};

export const addMapItem = ({ item = {}, ownerID, layoutID }) => {
  //
  onReady().then(({ db }) => {
    let objs = db.ref(`/layout/${layoutID}/${ownerID}/objects`);

    let newItem = objs.push();
    newItem.set(item);
  });
};

export const streamMapItems = ({ fnc, ownerID, layoutID }) => {
  let Cleans = [];
  onReady().then(({ db }) => {
    let objs = db.ref(`/layout/${layoutID}/${ownerID}/objects`);
    let clean = objs.on("value", (snap) => {
      if (snap) {
        let val = snap.val();

        if (!val) {
          fnc([]);
        } else {
          fnc(toArray(val));
        }
      }
    });
    Cleans.push(clean);
  });

  return () => {
    Cleans.forEach((e) => e());
  };
};

export const streamGraphIDs = ({ fnc, ownerID }) => {
  let Cleans = [];
  onReady().then(({ db }) => {
    let objs = db.ref(`/profile/${ownerID}/canvas`);
    let clean = objs.on("value", (snap) => {
      if (snap) {
        let val = snap.val();

        if (!val) {
          fnc([]);
        } else {
          fnc(toArray(val));
        }
      }
    });
    Cleans.push(clean);
  });

  return () => {
    Cleans.forEach((e) => e());
  };
};
