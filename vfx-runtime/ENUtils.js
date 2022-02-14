import axios from "axios";
import { useEffect, useState } from "react";
import { firebaseConfig } from "../vfx-cms/CONFIG";

export const getID = function () {
  return (
    "_" +
    Math.random().toString(36).substr(2, 9) +
    Math.random().toString(36).substr(2, 9)
  );
};

export const makeShallowStore = (myObject = {}) => {
  let ___NameSpaceID = getID();
  let Utils = {
    exportJSON: () => {
      return JSON.parse(JSON.stringify(myObject));
    },
    getNameSpcaeID: () => {
      return ___NameSpaceID;
    },

    onChange: (key, func) => {
      let evName = `${___NameSpaceID}`;
      let hh = () => {
        func(myObject[key]);
      };

      window.addEventListener(`${evName}-${key}`, hh);
      return () => {
        window.removeEventListener(`${evName}-${key}`, hh);
      };
    },

    useReactiveKey: (key, func) => {
      useEffect(() => {
        let evName = `${___NameSpaceID}`;
        let hh = () => {
          func(myObject[key]);
        };

        window.addEventListener(`${evName}-${key}`, hh);
        return () => {
          window.removeEventListener(`${evName}-${key}`, hh);
        };
      }, []);
    },

    makeKeyReactive: (key) => {
      let [vv, setSt] = useState(0);
      useEffect(() => {
        let evName = `${___NameSpaceID}`;

        let hh = () => {
          setSt((s) => {
            return s + 1;
          });
        };

        window.addEventListener(`${evName}-${key}`, hh);
        return () => {
          window.removeEventListener(`${evName}-${key}`, hh);
        };
      }, [vv]);
    },

    //
    onChangeAny: (func) => {
      let evName = `${___NameSpaceID}`;
      let hh = () => {
        func(myObject[key]);
      };

      window.addEventListener(`${evName}`, hh);
      return () => {
        window.removeEventListener(`${evName}`, hh);
      };
    },

    notifyKeyChange: (key) => {
      window.dispatchEvent(
        new CustomEvent(`${___NameSpaceID}-${key}`, { detail: {} })
      );
    },
  };

  let proxy = new Proxy(myObject, {
    get: (o, k) => {
      //
      if (Utils[k]) {
        return Utils[k];
      }

      return o[k];
    },
    set: (o, key, val) => {
      o[key] = val;

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(`${___NameSpaceID}-${key}`, { detail: {} })
        );
      }

      return true;
    },
  });

  return proxy;
};

let isFunction = function (obj) {
  return typeof obj === "function" || false;
};

export class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }
  addEventListener(label, callback) {
    this.listeners.has(label) || this.listeners.set(label, []);
    this.listeners.get(label).push(callback);
  }

  removeEventListener(label, callback) {
    let listeners = this.listeners.get(label);
    let index = 0;

    if (listeners && listeners.length) {
      index = listeners.reduce((i, listener, index) => {
        let a = () => {
          i = index;
          return i;
        };
        return isFunction(listener) && listener === callback ? a() : i;
      }, -1);

      if (index > -1) {
        listeners.splice(index, 1);
        this.listeners.set(label, listeners);
        return true;
      }
    }
    return false;
  }
  trigger(label, ...args) {
    let listeners = this.listeners.get(label);

    if (listeners && listeners.length) {
      listeners.forEach((listener) => {
        listener(...args);
      });
      return true;
    }
    return false;
  }
}

export const sleep = (t) => {
  return new Promise((resolve) => {
    setTimeout(resolve, t);
  });
};

export const download = async (classRef, url) => {
  let fnc = classRef;
  fnc.Cache = fnc.Cache || new Map();
  let myCache = fnc.Cache;

  //
  return new Promise((resolve, reject) => {
    if (myCache.has(url)) {
      resolve(myCache.get(url));
    } else {
      try {
        new classRef().load(url, (result) => {
          myCache.set(url, result);
          resolve(result);
        });
      } catch (e) {
        reject(e);
      }
    }
  });
};

export const useAutoEvent = function (ev, fnc, target = () => {}) {
  useEffect(() => {
    let tt = target() || window;
    tt.addEventListener(ev, fnc, { passive: false });
    return () => {
      tt.removeEventListener(ev, fnc);
    };
  }, []);
};

export async function getEffectNodeData(graphID) {
  let detectSlash = "/";

  if (
    firebaseConfig.databaseURL[firebaseConfig.databaseURL.length - 1] === "/"
  ) {
    detectSlash = "";
  }
  return axios({
    method: "GET",
    url: `${firebaseConfig.databaseURL}${detectSlash}canvas/${graphID}.json`,
  }).then(
    (response) => {
      let ans = false;
      for (let kn in response.data) {
        if (!ans) {
          ans = response.data[kn];
        }
      }
      if (ans) {
        let connections = [];

        for (let kn in ans.connections) {
          connections.push({
            _fid: kn,
            data: ans.connections[kn],
          });
        }

        let nodes = [];
        for (let kn in ans.nodes) {
          nodes.push({
            _fid: kn,
            data: ans.nodes[kn],
          });
        }

        return {
          connections,
          nodes,
        };
      } else {
        return false;
      }
    },
    () => {
      return false;
    }
  );
}

//
//
// export const makeReceiverPeer = ({ url }) => {
//   let socket = new LambdaClient({
//     url: BASEURL_WS,
//   });

//   socket.send({
//     action: "join-room",
//     roomID: projectID,
//     userID: "ARClient",
//   });

//   let setupPeer = async () => {
//     let peer = new SimplePeer({
//       initiator: true,
//       trickle: false,
//     });

//     peer.once("signal", (sig) => {
//       socket.send({
//         action: "signal",
//         roomID: projectID,
//         userID: "ARClient",
//         connectionID: socket.connID,
//         signal: sig,
//       });
//       console.log(sig);
//     });

//     socket.once("signal", ({ connectionID, signal, userID }) => {
//       if (
//         connectionID === socket.connID &&
//         userID === "ENCloud" &&
//         !peer.destroyed
//       ) {
//         peer.signal(signal);
//       }
//     });

//     // socket.once("connect", () => {
//     //   console.log("connected");
//     // });

//     peer.once("close", () => {
//       peer.destroyed = true;
//     });
//     peer.once("error", () => {
//       peer.destroyed = true;
//     });

//     peer.once("connect", () => {
//       console.log("happyhappy connetec  at the AR Clinet");
//     });

//     peer.on("data", (v) => {
//       if (peer.destroyed) {
//         return;
//       }
//       let str = v.toString();
//       let obj = JSON.parse(str);

//       processJSON({
//         original: obj,
//         json: JSON.parse(obj.largeString),
//       });
//       // console.log("arrived");
//     });
//   };

//   socket.on("join-room", (resp) => {
//     socket.connID = resp.connectionID;
//     setupPeer();
//   });

//   socket.on("encloud-ready", () => {
//     socket.send({
//       action: "join-room",
//       roomID: projectID,
//       userID: "ARClient",
//     });
//   });
// };
