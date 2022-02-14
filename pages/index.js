import Link from "next/link";
import { useEffect } from "react";
import router from "next/router";

export default function Main() {
  useEffect(() => {
    router.prefetch("/rain");
  }, []);
  return (
    <div className={`w-full h-full`}>
      <div className="p-12">
        <div className="text-4xl mb-3">Welcome to Effect Node!</div>
        <div className="text-lg text-gray-600 mb-3">
          Making VFX avaiable on the Web.
        </div>

        <div className="m-3 border-blue-300 border-b"></div>

        <ul className=" text text-gray-600 list-disc mb-3">
          <li>AR/VR Immersive Editing View</li>
          <li>Room Furniture Layout View</li>
          <li>Wall Decoration View</li>

          <li>Cable and Boxes Visual Programming</li>
          <li>Procedral Content Support</li>
          <li>Post Processing such as Selective Blooming</li>
        </ul>

        <div className="text text-gray-600 underline">
          <Link href={"/rain"}>Make it rain! thank you Jesus ❤️</Link>
        </div>
        <div className="text text-gray-600 underline">
          <Link href={"/tryme"}>Make yours try me... ❤️</Link>
        </div>
      </div>
    </div>
  );
}

//

//

//
