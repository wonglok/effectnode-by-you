import { useEffect, useState } from "react";
import { ENState } from "./ENState";
import { onReady } from "./firebase";
import router from "next/router";
export function ENProjectListing() {
  ENState.makeKeyReactive("listing");
  ENState.makeKeyReactive("listingReload");

  useEffect(() => {
    onReady().then(({ user, db }) => {
      //
      //
      let listingRef = db.ref(`profile/${user.uid}/canvas`);

      let load = () => {
        listingRef.once("value", (snap) => {
          let val = snap.val();
          if (val) {
            let arr = [];
            for (let kn in val) {
              arr.push({
                _id: kn,
                data: val[kn],
              });
            }
            //

            ENState.listing = arr;
          }
        });
      };
      load();
      ENState.onChange("listingReload", () => {
        load();
      });
    });
  }, [ENState.listingReload]);

  //
  return (
    <div>
      <div>Listing...</div>

      <table>
        <thead>
          <tr>
            <th className="p-3 border ">Title</th>
            <th className="p-3 border " colSpan={2}>
              Actions
            </th>
            {/* <th>JSON</th> */}
          </tr>
        </thead>

        <tbody>
          {ENState.listing.map((e, idx) => {
            return (
              <tr key={e._id}>
                <td className="p-3 m-3 border bg-white ">{e.data.title}</td>
                <td className="p-3 border m-0">
                  <button
                    className=" p-3 px-6 rounded-full bg-blue-300"
                    onClick={() => {
                      //
                      router.push(`/effectnode/editor/${e._id}`);
                    }}
                  >
                    Edit
                  </button>
                </td>
                <td className="p-3 border">
                  <button
                    className="  p-3 px-6 rounded-full bg-red-300"
                    onClick={() => {
                      //
                      //
                      onReady().then(({ user, db }) => {
                        let title = e.data.title || "no title";
                        if (
                          window
                            .prompt(
                              `Type "${title}" to Confirm Removal, theres no restore.`,
                              `${title} ______`
                            )
                            .trim() === title
                        ) {
                          let listingRef = db.ref(
                            `profile/${user.uid}/canvas/${e._id}`
                          );
                          listingRef.remove();

                          ENState.listing.splice(idx, 1);
                          ENState.listingReload++;
                        }
                      });
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

//

//

//
