import { useEffect, useMemo, useRef, useState } from "react";
import { useAutoEvent } from "../../vfx-runtime/ENUtils";
import path from "path";
export default function IndexPage() {
  let ref = useRef();

  //
  let [src, setSRC] = useState("about:blank");

  let [width, setWidth] = useState(500);
  let [menu, setMenu] = useState(false);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
  useAutoEvent("resize", () => {
    setWidth(window.innerWidth);
  });

  return (
    <>
      {/*  */}
      <style>{
        /* css */ `
        @keyframes fadeLeft {
          0% {
            opacity: 0;
            transform: translate3d(-275px, 0px, 0px);
          }
          100% {
            opacity: 1;
            transform: translate3d(0px, 0px, 0px);
          }
        }
        .fadeLeft {
          animation: fadeLeft 1s;
        }

        @keyframes fadeRight {
          0% {
            opacity: 0;
            transform: translate3d(275px, 0px, 0px);
          }
          100% {
            opacity: 1;
            transform: translate3d(0px, 0px, 0px);
          }
        }
        .fadeRight {
          animation: fadeRight 1s;
        }
      `
      }</style>
      <div ref={ref} className="w-full h-full">
        {width >= 767 ? (
          <div className="w-full h-full flex items-stretch justify-start">
            {/*  */}
            <div
              className="fadeLeft h-full bg-gray-200"
              style={{
                width: `calc(250px)`,
              }}
            >
              <a
                href="/"
                onClick={(ev) => {
                  ev.preventDefault();
                  import(
                    /* webpackPreload: true */ "animejs/lib/anime.es.js"
                  ).then(({ default: anime }) => {
                    anime({
                      targets: `body`,
                      opacity: 0,
                      duration: 1000,
                      easing: "easeInOutQuad",
                      complete: () => {
                        window.location.assign("/");
                      },
                    });
                  });
                }}
                className="block p-3"
              >
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
              className="h-full fadeRight transition-colors duration-200 bg-gray-100 "
              style={{
                width: `calc(100% - 250px)`,
              }}
            >
              <iframe
                id="myframe"
                className={"h-full w-full"}
                src={src}
              ></iframe>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative bg-gray-100">
            <iframe
              id="myframe"
              className={" h-full w-full"}
              style={{}}
              src={src}
            ></iframe>

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
              <div className="absolute top-0 right-0 m-3 bg-white p-3">
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  onClick={() => {
                    setMenu(false);
                  }}
                >
                  <path d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z" />
                </svg>
              </div>
            )}

            {!menu && (
              <div className="absolute top-0 right-0 m-3 bg-white p-3">
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  onClick={() => {
                    setMenu(true);
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
          </div>
        )}
      </div>
    </>
  );
}

function MyList({ onChoose = () => {} }) {
  let [active, setActive] = useState(false);

  let list = useMemo(() => {
    let rr = require.context("./", false, /\.js$/, "lazy");
    let list = [];

    let keys = rr.keys();

    keys.forEach((kn) => {
      if (kn.indexOf("index.js") === -1) {
        list.push({
          key: kn,
          file: path.basename(kn),
        });
      }
    });

    return list;
  }, []);

  useEffect(() => {
    let l = list[0];
    if (l) {
      setActive(l.key);
      onChoose(`${path.join("/examples/", l.key.replace(".js", ""))}`);
    }
  }, []);

  return (
    <div>
      <div className={"p-3 text-lg "}>Examples</div>
      {list.map((l) => {
        //
        return (
          <div
            className={`py-2 px-6 transition-colors duration-1000 cursor-pointer ${
              active === l.key ? "bg-green-500 text-white" : ""
            }`}
            onClick={(ev) => {
              ev.preventDefault();
              setActive(l.key);
              onChoose(`${path.join("/examples/", l.key.replace(".js", ""))}`);
            }}
            key={l.key}
          >
            {l.file}
          </div>
        );
      })}
    </div>
  );
}
