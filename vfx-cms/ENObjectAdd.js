import { useState } from "react";
import { ENState } from "./ENState";
import { onReady } from "./firebase";

export function ENObjectAdd() {
  let [title, setTitle] = useState("New Object Layout");
  return (
    <div className="flex items-center justify-start">
      <textarea
        rows={1}
        className=" p-3 m-3 ml-0 border  rounded-2xl resize-x"
        value={title}
        onInput={(e) => {
          setTitle(e.target.value);
        }}
      ></textarea>
      <button
        className="py-3 px-6 rounded-full  m-3 border bg-blue-500 text-white"
        onClick={() => {
          //
          onReady().then(({ db, user }) => {
            //
            let myCanvasListing = db.ref(`profile/${user.uid}/layout`);

            //
            let newItem = myCanvasListing.push();

            //
            newItem.set({
              title,
              ownerID: user.uid,
              shareACL: {
                placeholder: false,
              },
            });

            ENState.layoutsReload++;
          });
        }}
        //
      >
        Add Object Layout
      </button>
    </div>
  );
}
