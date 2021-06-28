import { ENMini } from "./ENMini";
import { EventEmitter } from "./ENUtils";

export function getCodes() {
  let path = require("path");
  let r = require.context("../vfx-nodes", true, /\.js$/, "lazy");

  function importAll(r) {
    let arr = [];

    r.keys().forEach((key) => {
      let filename = path.basename(key);

      arr.push({
        title: filename,
        key,
        path: `../vfx-nodes/${path.basename(key)}`,
        loader: () => r(key),
      });
    });

    return arr;
  }

  return importAll(r);
}

//
export class ENRuntime {
  //
  constructor({ json, codes }) {
    //
    // let codes = getCodes();

    this.json = json;

    if (!codes) {
      codes = getCodes();
    }
    this.codes = codes;

    // if (process.env.NODE_ENV === "development") {
    //   module.hot.accept(
    //     codes.map((e) => e.path), // Either a string or an array of strings
    //     (v) => {
    //       //
    //       //
    //       console.log(v);
    //     }, // Function to fire when the dependencies are updated
    //     (err, { moduleId, dependencyId }) => {
    //       //
    //     } // (err, {moduleId, dependencyId}) => {}
    //   );
    // }
    //

    //
    this.mini = new ENMini({});

    this.clean = () => {
      this.mini.clean();
    };

    let total = [];

    //
    // let getPorts = (node) => {
    //   return {}; //
    // };
    //

    this.events = new EventEmitter();

    let on = (ev, h) => {
      this.events.addEventListener(ev, h);
      this.mini.onClean(() => {
        this.events.removeEventListener(ev, h);
      });
    };
    let emit = (ev, data) => {
      this.events.trigger(ev, data);
    };

    this.json.connections.forEach((conn) => {
      on(conn.data.output._id, (data) => {
        emit(conn.data.input._id, data);
      });
    });

    let queue = [];
    this.json.nodes.forEach((node) => {
      let title = node.data.title;

      let features = codes.find((e) => e.title === title);

      let mode = "queue";
      this.mini.ready["all-ready"].then(() => {
        mode = "can-send";
        queue.forEach((ev) => {
          emit(ev.event, ev.data);
        });

        //
        // comments.log(ev);
      });

      let progress = { done: false };
      total.push(progress);

      let portsAPIMap = new Map();

      let inputs = node.data.inputs;
      let outputs = node.data.outputs;

      //
      // portsAPIMap.set(`in${idx}`, {
      // });

      inputs.forEach((input, idx) => {
        let api = {
          stream: (onReceive) => {
            on(input._id, onReceive);
          },
          get ready() {
            return new Promise((resolve) => {
              let hh = (data) => {
                resolve(data);
                this.events.removeEventListener(input._id, hh);
              };
              this.events.addEventListener(input._id, hh);
            });
          },
        };

        portsAPIMap.set(`in${idx}`, api);
      });

      outputs.forEach((output, idx) => {
        portsAPIMap.set(`out${idx}`, {
          pulse: (data) => {
            if (mode === "queue") {
              queue.push({
                event: output._id,
                data,
              });
            } else {
              emit(output._id, data);
            }
          },
        });
      });

      let nodeAPI = new Proxy(
        {},
        {
          get: (obj, key) => {
            //
            if (key.indexOf("in") === 0 && !isNaN(key[2])) {
              return portsAPIMap.get(key);
            }

            if (key.indexOf("out") === 0 && !isNaN(key[3])) {
              return portsAPIMap.get(key);
            }
            //
          },
        }
      );

      //
      features
        .loader()
        .then(async (logic) => {
          return await logic.effect({ mini: this.mini, node: nodeAPI });
        })
        .then(() => {
          progress.done = true;
        })
        .catch((err) => {
          console.log(err);
          progress.done = true;
        });
    });

    let tt = setInterval(() => {
      let ok = total.filter((e) => e.done).length === total.length;
      if (ok) {
        clearInterval(tt);
        this.mini.set("all-ready", true);
      }
    });

    // .forEach()
    // this.ports = new ENPorts({ mini, json });
  }
}
