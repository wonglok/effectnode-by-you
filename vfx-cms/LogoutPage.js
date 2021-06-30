import { useEffect } from "react";
import { setupFirebase, firebase } from "./firebase";
import { DevToolNotice } from "../pages/effectnode";

export function LogoutPage() {
  // if (process.env.NODE_ENV === "production") {
  //   return <DevToolNotice></DevToolNotice>;
  // }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <LogoutStatus></LogoutStatus>
    </div>
  );
}

function LogoutStatus() {
  useEffect(() => {
    setupFirebase();
    return firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        window.location.assign("/effectnode");
      } else {
        firebase.auth().signOut();
      }
    });
  });

  return (
    <div className="cursor-default bg-red-500 text-white rounded-full px-6 py-3">
      Logging you out
    </div>
  );
}
