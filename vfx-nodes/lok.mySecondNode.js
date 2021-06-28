export function effect({ mini, node }) {
  node.in0.stream((v) => {
    console.log(v);
  });
}
