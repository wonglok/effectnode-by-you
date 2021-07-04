export function ENFloor() {
  return (
    <group>
      <mesh
        onClick={({ point }) => {
          console.log(point);
        }}
        rotation-x={Math.PI * -0.5}
      >
        <planeBufferGeometry args={[1000, 1000, 2, 2]}></planeBufferGeometry>
        <shaderMaterial
          fragmentShader={`
            void main (void) {
              discard;
            }
        `}
        ></shaderMaterial>
      </mesh>
      <gridHelper
        raycast={() => {}}
        position-y={0.1}
        args={[1000, 100, "#333333", "#333333"]}
      ></gridHelper>
    </group>
  );
}
