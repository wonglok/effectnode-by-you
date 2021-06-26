import { firebase } from "./firebase";
export function ENWelcome() {
  let currentUser = firebase.auth().currentUser;
  return <div>Welcome Back! {currentUser.displayName}</div>;
}
