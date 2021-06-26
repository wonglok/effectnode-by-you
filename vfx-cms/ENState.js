import { makeShallowStore } from "../vfx-runtime/ENUtils";
export const ENState = makeShallowStore({
  listing: [],
  listingReload: 0,
});
