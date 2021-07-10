import { useEffect, useMemo, useRef, useState } from "react";
import { useAutoEvent } from "../../vfx-runtime/ENUtils";
import path from "path";
export default function IndexPage() {
  let ref = useRef();

  //
  let [src, setSRC] = useState("/examples/eg1");

  let [width, setWidth] = useState(500);
  let [menu, setMenu] = useState(false);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
  useAutoEvent("resize", () => {
    setWidth(window.innerWidth);
  });

  return (
    <div ref={ref} className="w-full h-full">
      {width >= 767 ? (
        <div className="w-full h-full flex items-stretch justify-start">
          {/*  */}
          <div
            className="h-full bg-gray-200"
            style={{
              width: `calc(250px)`,
            }}
          >
            <a href={"/"} className="block p-3">
              &larr; <span className="underline">Back Home</span>
            </a>
            <MyList
              onChoose={(v) => {
                setSRC(v);
              }}
            ></MyList>
          </div>

          {/*  */}
          <div
            className="h-full "
            style={{
              width: `calc(100% - 250px)`,
            }}
          >
            <iframe className={"h-full w-full"} src={src}></iframe>
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative">
          <iframe className={"h-full w-full"} src={src}></iframe>

          {!menu && (
            <div className="absolute top-0 right-0 m-3">
              <svg
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
                fillRule="evenodd"
                clipRule="evenodd"
                onClick={() => {
                  setMenu((m) => {
                    return !m;
                  });
                }}
              >
                <path
                  d="M24 18v1h-24v-1h24zm0-6v1h-24v-1h24zm0-6v1h-24v-1h24z"
                  fill="#1040e2"
                />
                <path d="M24 19h-24v-1h24v1zm0-6h-24v-1h24v1zm0-6h-24v-1h24v1z" />
              </svg>
            </div>
          )}

          {menu && (
            <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-90">
              <a href={"/"} className=" block p-3">
                &larr; <span className="underline">Back Home</span>
              </a>
              <MyList
                onChoose={(v) => {
                  setSRC(v);
                  setMenu(() => {
                    return false;
                  });
                }}
              ></MyList>
            </div>
          )}

          {menu && (
            <div className="absolute top-0 right-0 m-3">
              <svg
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
                fillRule="evenodd"
                clipRule="evenodd"
                onClick={() => {
                  setMenu((m) => {
                    return !m;
                  });
                }}
              >
                <path d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MyList({ onChoose = () => {} }) {
  let rr = require.context("./", false, /\.js$/);

  let list = useMemo(() => {
    let list = [];

    let keys = rr.keys();

    keys.forEach((kn) => {
      let mod = rr(kn);
      if (mod) {
        let meta = mod.meta;
        if (meta) {
          //
          list.push({
            key: kn,
            path: kn,
            file: path.basename(kn),
            meta,
          });
        }
      }
    });
    return list;
  }, []);

  return (
    <div>
      <div className={"p-3 text-lg"}>Examples</div>
      {list.map((l) => {
        //

        //
        return (
          <div
            className="mb-3 px-3 cursor-pointer"
            onClick={() => {
              onChoose(`${path.join("/examples/", l.path.replace(".js", ""))}`);
            }}
            key={l.key}
          >
            {l.meta.title}
          </div>
        );
      })}
    </div>
  );
}
