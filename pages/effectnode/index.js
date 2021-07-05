//

import { ENWelcome } from "../../vfx-cms/ENWelcome";
import { LoginChecker } from "../../vfx-cms/LoginChecker";
import { ENProjectListing } from "../../vfx-cms/ENProjectListing";
import { ENProjectAdd } from "../../vfx-cms/ENProjectAdd";
import { ENObjectAdd } from "../../vfx-cms/ENObjectAdd";
import { ENObjectListing } from "../../vfx-cms/ENObjectListing";

export function DevToolNotice() {
  return (
    <div className="flex items-center justify-center w-full h-full text-center">
      Effect Node is a Developer Tool <br /> It is only available on developemnt
      mode.
    </div>
  );
}

export default function Home() {
  if (process.env.NODE_ENV === "production") {
    return <DevToolNotice></DevToolNotice>;
  }

  return (
    <LoginChecker>
      <div className="p-3 lg:p-12">
        <ENWelcome></ENWelcome>

        <br />
        <hr />
        <br />

        <ENProjectAdd></ENProjectAdd>
        <ENProjectListing></ENProjectListing>

        <br />
        <hr />
        <br />

        <ENObjectAdd></ENObjectAdd>
        <ENObjectListing></ENObjectListing>
      </div>
    </LoginChecker>
  );
}
