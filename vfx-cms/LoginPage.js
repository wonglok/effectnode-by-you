import { useEffect } from "react";
import { loginGoogle, setupFirebase, firebase } from "./firebase";
import router from "next/router";
import { DevToolNotice } from "../pages/effectnode";
export function LoginPage() {
  if (process.env.NODE_ENV === "production") {
    return <DevToolNotice></DevToolNotice>;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <LoginWithGoogle></LoginWithGoogle>
    </div>
  );
}

function LoginWithGoogle() {
  useEffect(() => {
    setupFirebase();
    return firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        router.push("/effectnode");
      }
    });
  });

  return (
    <button
      className=" cursor-pointer bg-blue-500 text-white rounded-full px-6 py-3"
      onClick={() => {
        loginGoogle();
      }}
    >
      Login With Google
    </button>
  );
}
