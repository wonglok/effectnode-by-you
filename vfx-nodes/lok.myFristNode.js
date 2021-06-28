export function effect({ node, ports }) {
  //
  ports.out1.send({
    //
    a: 1,
  });
  ports.in1.onData((data) => {
    //
    console.log(data);
  });
}
