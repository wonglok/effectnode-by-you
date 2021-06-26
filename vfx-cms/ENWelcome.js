import { firebase } from "./firebase";
export function ENWelcome() {
  let currentUser = firebase.auth().currentUser;
  return (
    <div>
      <div className=" text-2xl">Dear {currentUser.displayName},</div>
      <div className=" text-sm">Welcome Back!</div>
    </div>
  );
}
