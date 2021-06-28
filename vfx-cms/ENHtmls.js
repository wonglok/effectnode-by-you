import { useEffect, useState } from "react";
import { ENMethods, ENState } from "./ENState";
import path from "path";
export function ENHtml() {
  ENState.makeKeyReactive("overlay");

  useEffect(() => {
    let h = (e) => {
      if (e.key.toLowerCase() === "escape") {
        ENState.overlay = "";
      }
    };

    window.addEventListener("keydown", h);
    return () => {
      window.removeEventListener("keydown", h);
    };
  });

  return (
    <>
      {ENState.overlay === "main" && <MainPanel></MainPanel>}

      {ENState.overlay === "node" && <NodePanel></NodePanel>}

      {ENState.overlay === "addCodeBlock" && (
        <div className="w-full absolute top-0 left-0 bg-white  bg-opacity-95">
          <div className="bg-green-400">
            <div className="p-3 text-2xl font-serif">
              <div className="text-white select-none">
                Click on Floor to Add
              </div>
            </div>
          </div>
        </div>
      )}

      {ENState.overlay && (
        <div className="absolute top-0 right-0 p-4">
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="white"
            onClick={() => {
              ENState.overlay = "";
            }}
            onPointerDown={() => {
              ENState.overlay = "";
            }}
            className=" cursor-pointer"
          >
            <path d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z" />
          </svg>
        </div>
      )}
    </>
  );
}

function MainPanel() {
  let [nodesLogic, setNodes] = useState([]);
  useEffect(() => {
    //
    let r = require.context("../vfx-nodes", false, /\.js$/, "lazy");

    function importAll(r) {
      let arr = [];
      r.keys().forEach((key) => {
        let filename = path.basename(key);

        arr.push({
          title: filename,
          // logic: r(key),
        });
      });

      setNodes(arr);
    }

    importAll(r);
  }, []);

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-white  bg-opacity-95">
      {/*  */}
      <div className="bg-yellow-400">
        <div className="p-3 text-2xl font-serif">
          <div className="text-white select-none">Getting Started</div>
        </div>
      </div>

      <div className="p-3 text-xl font-serif ">
        <div className="">Add New CodeBlock</div>
      </div>

      {nodesLogic.map((e) => {
        return (
          <div key={e.title} className="ml-3 mb-3 text  underline">
            <div
              className=" cursor-pointer"
              onPointerDown={() => {
                ENState.addNodeTitle = e.title;
                ENState.hovering = "floor";
                ENState.cursorMode = "addCodeBlock";
                ENState.overlay = "addCodeBlock";
              }}
            >
              {e.title}
            </div>
          </div>
        );
      })}
      {/* <div className="p-3 text font-serif underline">
        <div
          className=" cursor-pointer"
          onPointerDown={() => {
            ENState.addNodeTitle = "mytitle";
            ENState.hovering = "floor";
            ENState.cursorMode = "addCodeBlock";
            ENState.overlay = "addCodeBlock";
          }}
        >
          Add New CodeBlock
        </div>
      </div> */}
    </div>
  );
}

function NodePanel() {
  return (
    <div className="w-full h-full absolute top-0 left-0 bg-white  bg-opacity-95">
      {/*  */}
      <div className="bg-blue-400">
        <div className="p-3 text-2xl font-serif">
          <div className="text-white select-none">Node Settings</div>
        </div>
      </div>

      <div className="p-3 text-xl font-serif">
        <div
          className=" cursor-pointer"
          onPointerDown={() => {
            if (window.confirm(`remove item`)) {
              ENMethods.removeCurrentNodeAndConnections();
              ENState.overlay = "";
            }
          }}
        >
          Remove Code Blocks and Connections
        </div>
      </div>
    </div>
  );
}

//
