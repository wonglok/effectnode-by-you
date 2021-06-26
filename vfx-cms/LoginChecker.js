import { useEffect, useState } from "react";
import { firebase, setupFirebase } from "./firebase";
import { LoginPage } from "./LoginPage";
export function LoginChecker({ children, canvasID = false }) {
  let [state, setState] = useState("ready");

  useEffect(() => {
    setupFirebase();
    return firebase.auth().onAuthStateChanged((user) => {
      if (canvasID) {
        firebase
          .database()
          .ref(`/profile/${user.uid}/canvas/${canvasID}`)
          .once("value", (snap) => {
            let val = snap.val();
            if (val) {
              if (val.shareACL[user.uid] || val.ownerACL[user.uid]) {
                setState("show");
              } else {
                setState("noRights");
              }
            }
          });
      } else {
        if (user) {
          setState("show");
        } else {
          setState("needsLogin");
        }
      }
    });
  }, []);

  return (
    <>
      {state === "show" && children}
      {state === "loading" && <div className="w-full h-full">Loading</div>}
      {state === "needsLogin" && <LoginPage></LoginPage>}
      {state === "noRights" && (
        <div className="w-full h-full">You need to ask for file share.</div>
      )}
    </>
  );
}

/*
{
  "rules": {
    ".read": false,
    ".write": false,

    "profile": {
      "$user_id": {
        "canvas": {
          "$canvasID": {
            ".read": "auth !== null",
            "shareACL": {
              ".write": "auth !== null && auth.uid === $user_id",
            },
            "ownerACL": {
              ".write": "auth !== null && auth.uid === $user_id",
            }
          },
        }
      }
    },
    "canvas": {
      "$canvasID": {
        ".read": true,
        ".write": "auth !== null && root.child('profile').child(auth.uid).child('canvas').child('ownerACL').hasChild(auth.uid) || auth !== null && root.child('profile').child(auth.uid).child('canvas').child('ownerACL').hasChild(auth.uid) "
      }
    }
  }
}
*/
