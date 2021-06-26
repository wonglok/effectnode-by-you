import FIREBASE from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { firebaseConfig } from "./CONFIG";

export const FireCache = new Map();
export function setupFirebase() {
  if (!FireCache.has("app")) {
    FireCache.set("app", FIREBASE.initializeApp(firebaseConfig));
  }

  if (!FireCache.has("database")) {
    FireCache.set("database", FIREBASE.database());
  }

  if (!FireCache.has("setup-listen-login")) {
    FireCache.set("setup-listen-login", true);
    FireCache.get("app")
      .auth()
      .onAuthStateChanged((user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          FireCache.set("user", user);
          // ...
        } else {
          // User is signed out
          // ...
          FireCache.delete("user");
        }
      });
  }
  if (!FireCache.has("setup-do-login")) {
    FireCache.set("setup-do-login", true);

    // FireCache.get("app")
    //   .auth()
    //   .signInAnonymously()
    //   .then((singin) => {
    //     // Signed in..
    //     FireCache.set("user", singin.user);
    //   })
    //   .catch((error) => {
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //     // ...
    //     console.log(errorCode, errorMessage);

    //     return Promise.reject(new Error(errorMessage));
    //   });
    console.log("[Firebase]: done setup");
  }

  return FireCache.get("app");
}

export const onReady = () => {
  setupFirebase();
  return new Promise((resolve) => {
    let tt = setInterval(() => {
      if (FireCache.has("user")) {
        clearInterval(tt);
        resolve({
          firebase: FIREBASE,
          user: FireCache.get("user"),
          fire: FireCache.get("app"),
          db: FireCache.get("database"),
          logout: () => {
            return FireCache.get("app").auth().signOut();
          },
        });
      }
    });
  });
};

export const loginGuest = async () => {
  return FIREBASE.auth().signInAnonymously();
};

export const loginGoogle = () => {
  var provider = new FIREBASE.auth.GoogleAuthProvider();

  return FIREBASE.auth().signInWithPopup(provider);
};

if (typeof window !== "undefined") {
  setupFirebase();
}

export const firebase = FIREBASE;
