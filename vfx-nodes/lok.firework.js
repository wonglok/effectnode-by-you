import * as SpiritGeo from "../vfx-library/SpiritGeo";
export async function effect({ mini, node }) {
  console.log(mini);
  SpiritGeo.example({ mini });
}
