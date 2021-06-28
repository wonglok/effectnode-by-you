import * as SpiritGeo from "../vfx-library/SpiritGeo";
export function effect({ mini, node }) {
  node.in0.stream((v) => {
    console.log(v);
  });

  SpiritGeo.example({ mini });
}
