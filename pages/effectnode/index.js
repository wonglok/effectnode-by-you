//

import { ENWelcome } from "../../vfx-cms/ENWelcome";
import { LoginChecker } from "../../vfx-cms/LoginChecker";
import { ENProjectListing } from "../../vfx-cms/ENProjectListing";
import { ENProjectAdd } from "../../vfx-cms/ENProjectAdd";

export default function Home() {
  //
  return (
    <LoginChecker>
      <div>
        <ENWelcome></ENWelcome>
        <ENProjectAdd></ENProjectAdd>
        <ENProjectListing></ENProjectListing>
      </div>
    </LoginChecker>
  );
}
