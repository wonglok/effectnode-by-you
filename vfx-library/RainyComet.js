import {
  HalfFloatType,
  Vector3,
  BufferAttribute,
  CylinderBufferGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Vector2,
  ShaderMaterial,
  Mesh,
  DataTexture,
  DataUtils,
  RGBFormat,
  Color,
  Object3D,
  AdditiveBlending,
} from "three";
import { Geometry } from "three/examples/jsm/deprecated/Geometry.js";
import { enableBloom } from "./Bloomer";

export class RainyComet {
  constructor({ mini, sim }) {
    this.o3d = new Object3D();
    this.mini = mini;
    /*simhere*/ this.sim = sim;
    this.wait = this.setup({ mini });
  }
  async setup({ mini }) {
    // let camera = await mini.ready.camera;
    // let renderer = await mini.ready.gl;

    let { geometry, subdivisions, count } = new NoodleGeo({
      count: /*simhere*/ this.sim.height,
      numSides: 4,
      subdivisions: /*simhere*/ this.sim.width,
      openEnded: false,
    });

    geometry.instanceCount = count;

    this.invertedScale = 1;

    let matLine0 = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        matcap: {
          value: null,
          // value: new TextureLoader().load("/matcap/golden2.png"),
          // value: await mini.ready.RainbowTexture,
          // value: await mini.ready.RainbowTexture,
        },
        posTexture: { value: null },
        // handTexture: { value: null },
      },
      vertexShader: /* glsl */ `
        // #include <common>
        #define lengthSegments ${subdivisions.toFixed(1)}

        attribute float angle;
        attribute float newPosition;
        attribute float tubeInfo;

        // varying vec2 vUv;
        varying vec3 vNormal;
        attribute vec4 offset;
        // varying vec4 vOffset;

        uniform sampler2D posTexture;
        // uniform sampler2D handTexture;

        uniform float time;

        mat4 rotationX( in float angle ) {
          return mat4(	1.0,		0,			0,			0,
                  0, 	cos(angle),	-sin(angle),		0,
                  0, 	sin(angle),	 cos(angle),		0,
                  0, 			0,			  0, 		1);
        }

        mat4 rotationY( in float angle ) {
          return mat4(	cos(angle),		0,		sin(angle),	0,
                      0,		1.0,			 0,	0,
                  -sin(angle),	0,		cos(angle),	0,
                      0, 		0,				0,	1);
        }

        mat4 rotationZ( in float angle ) {
          return mat4(	cos(angle),		-sin(angle),	0,	0,
                  sin(angle),		cos(angle),		0,	0,
                      0,				0,		1,	0,
                      0,				0,		0,	1);
        }

        mat4 rotationMatrix (vec3 axis, float angle) {
            axis = normalize(axis);
            float s = sin(angle);
            float c = cos(angle);
            float oc = 1.0 - c;

            return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                        0.0,                                0.0,                                0.0,                                1.0);
        }


        vec3 sampleFnc (float t) {

          vec3 pt = (offset.xyz + 0.5) * 0.0;

          // pt = vec4(vec4(pt, 1.0) * rotationY(t * 0.1 + time * 0.1)).xyz;
          // if (lineIDXER == 0.0) {
          //   pt += getPointAt_0(t);
          // }

          float lineIDXER = offset.w;
          // pt += getPointAt_0(t);

          vec4 color = texture2D(posTexture,
            vec2(
              t,
              lineIDXER / lengthSegments //
            )
          );

          pt += color.rgb;

          // pt = getPointAt_2(t);

          return pt;
        }

        void createTube (float t, vec2 volume, out vec3 pos, out vec3 normal) {
          // find next sample along curve
          float nextT = t + (1.0 / lengthSegments);

          // sample the curve in two places
          vec3 cur = sampleFnc(t);
          vec3 next = sampleFnc(nextT);

          // compute the Frenet-Serret frame
          vec3 T = normalize(next - cur);
          vec3 B = normalize(cross(T, next + cur));
          vec3 N = -normalize(cross(B, T));

          // extrude outward to create a tube
          float tubeAngle = angle;
          float circX = cos(tubeAngle);
          float circY = sin(tubeAngle);

          // compute position and normal
          normal.xyz = normalize(B * circX + N * circY);
          pos.xyz = cur + B * volume.x * circX + N * volume.y * circY;
        }

        varying float vT;
        attribute vec3 rainbow;
        varying vec3 vRainbow;
        varying vec3 vViewPosition;

        void main (void) {
          // vOffset = offset;

          vRainbow = rainbow;
          vec3 transformed;
          vec3 objectNormal;

          float t = tubeInfo + 0.5;

          vT = t;

          // thickness

          float tickness = 1.0;

          vec2 volume = vec2(
            0.02 * tickness *
            ${this.invertedScale.toFixed(1)}
            ,
            0.02 * tickness *
            ${this.invertedScale.toFixed(1)}
          );
          createTube(t, volume, transformed, objectNormal);

          vec3 transformedNormal = normalMatrix * objectNormal;
          vNormal = normalize(transformedNormal);

          // vUv = uv.yx;

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vViewPosition = -mvPosition.xyz;


          // if reset then stop
          vec4 seg0 = texture2D(posTexture,
            vec2(
              vT + 0.0,
              offset.w / lengthSegments //
            )
          );
          vec4 seg1 = texture2D(posTexture,
            vec2(
              vT + 1.0 / lengthSegments,
              offset.w / lengthSegments //
            )
          );

          if (length(seg0.rgb - seg1.rgb) >= 0.3) {
            gl_Position.w = 1.0;
          }
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        #define lengthSegments ${subdivisions.toFixed(1)}

        varying float vT;
        // varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform sampler2D matcap;
        varying vec3 vRainbow;

        // varying vec4 vOffset;
        uniform sampler2D posTexture;


        void main (void) {

          vec3 viewDir = normalize( vViewPosition );
          vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
          vec3 y = cross( viewDir, x );
          vec2 uv = vec2( dot( x, vNormal ), dot( y, vNormal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

          // vec4 matcapColor = texture2D( matcap, uv );

          gl_FragColor = vec4(vRainbow * vRainbow * 1.3, pow(1.0 - vT, 3.0));

        }
      `,
      transparent: true,
      // depthTest: false,
      // blending: AdditiveBlending,
    });

    let line0 = new Mesh(geometry, matLine0);
    line0.frustumCulled = false;
    line0.scale.set(
      1 / this.invertedScale,
      1 / this.invertedScale,
      1 / this.invertedScale
    );

    enableBloom(line0);

    this.o3d.add(line0);
    mini.onClean(() => {
      this.o3d.remove(line0);
    });

    // await /*simhere*/ this.sim.wait;

    mini.onLoop(() => {
      let result = /*simhere*/ this.sim.getTextureAfterCompute();
      matLine0.uniforms.posTexture.value = result.posTexture;
      matLine0.uniforms.time.value = window.performance.now() / 1000;
    });
  }

  // enableHandTexture() {
  //   const width = /*simhere*/ this.sim.width;
  //   const height = /*simhere*/ this.sim.height;
  //   const size = width * height;

  //   let handMovement = [];
  //   let temppos = new Vector3();
  //   for (let i = 0; i < size; i++) {
  //     AvatarHead.getWorldPosition(temppos);

  //     let x = temppos.x || 0;
  //     let y = temppos.y || 0;
  //     let z = temppos.z || 0;
  //     //
  //     handMovement.unshift(x, y, z);
  //   }

  //   const textureArray = new Uint16Array(3 * size);
  //   const handTexture = new DataTexture(
  //     textureArray,
  //     width,
  //     height,
  //     RGBFormat,
  //     HalfFloatType
  //   );
  //   handTexture.needsUpdate = true;

  //   mini.onLoop(() => {
  //     handMovement.push(DataUtils.toHalfFloat(temppos.x) || 0);
  //     handMovement.push(DataUtils.toHalfFloat(temppos.y) || 0);
  //     handMovement.push(DataUtils.toHalfFloat(temppos.z) || 0);

  //     handMovement.shift();
  //     handMovement.shift();
  //     handMovement.shift();

  //     textureArray.set(handMovement, 0);
  //     handTexture.needsUpdate = true;
  //     mat.uniforms.handTexture.value = handTexture;
  //   });
  // }
}

class NoodleGeo {
  constructor(props) {
    let {
      count = 20,
      numSides = 4,
      subdivisions = 50,
      openEnded = true,
    } = props;
    const radius = 1;
    const length = 1;

    const cylinderBufferGeo = new CylinderBufferGeometry(
      radius,
      radius,
      length,
      numSides,
      subdivisions,
      openEnded
    );

    let baseGeometry = new Geometry();
    baseGeometry = baseGeometry.fromBufferGeometry(cylinderBufferGeo);

    baseGeometry.rotateZ(Math.PI / 2);

    // compute the radial angle for each position for later extrusion
    const tmpVec = new Vector2();
    const xPositions = [];
    const angles = [];
    const uvs = [];
    const vertices = baseGeometry.vertices;
    const faceVertexUvs = baseGeometry.faceVertexUvs[0];
    const oPositions = [];

    // Now go through each face and un-index the geometry.
    baseGeometry.faces.forEach((face, i) => {
      const { a, b, c } = face;
      const v0 = vertices[a];
      const v1 = vertices[b];
      const v2 = vertices[c];
      const verts = [v0, v1, v2];
      const faceUvs = faceVertexUvs[i];

      // For each vertex in this face...
      verts.forEach((v, j) => {
        tmpVec.set(v.y, v.z).normalize();

        // the radial angle around the tube
        const angle = Math.atan2(tmpVec.y, tmpVec.x);
        angles.push(angle);

        // "arc length" in range [-0.5 .. 0.5]
        xPositions.push(v.x);
        oPositions.push(v.x, v.y, v.z);

        // copy over the UV for this vertex
        uvs.push(faceUvs[j].toArray());
      });
    });

    // build typed arrays for our attributes
    const posArray = new Float32Array(xPositions);
    const angleArray = new Float32Array(angles);
    const uvArray = new Float32Array(uvs.length * 2);
    const origPosArray = new Float32Array(oPositions);

    // unroll UVs
    for (let i = 0; i < posArray.length; i++) {
      const [u, v] = uvs[i];
      uvArray[i * 2 + 0] = u;
      uvArray[i * 2 + 1] = v;
    }

    const lineGeo = new InstancedBufferGeometry();
    lineGeo.instanceCount = count;

    let colorsVertexArray = [];
    let colorSet = ["#ee4035", "#f37736", "#fdf498", "#7bc043", "#0392cf"];

    // "#ffffff", "#d0e1f9", "#4d648d", "#283655", "#1e1f26"
    // let colorSet = ["#00a8c6", "#40c0cb", "#f9f2e7", "#aee239", "#8fbe00"];

    colorSet = ["#d11141", "#00b159", "#00aedb", "#f37735", "#ffc425"];

    let colorVar = new Color();
    for (let cc = 0; cc < count; cc++) {
      colorVar.setStyle(colorSet[cc % colorSet.length]);
      colorsVertexArray.push(colorVar.r, colorVar.g, colorVar.b);
    }

    lineGeo.setAttribute(
      "rainbow",
      new InstancedBufferAttribute(new Float32Array(colorsVertexArray), 3)
    );
    lineGeo.setAttribute("position", new BufferAttribute(origPosArray, 3));
    lineGeo.setAttribute("tubeInfo", new BufferAttribute(posArray, 1));
    lineGeo.setAttribute("angle", new BufferAttribute(angleArray, 1));
    lineGeo.setAttribute("uv", new BufferAttribute(uvArray, 2));

    let offset = [];
    let ddxyz = Math.floor(Math.pow(count, 1 / 3));
    let iii = 0;
    //
    for (let z = 0; z < ddxyz; z++) {
      for (let y = 0; y < ddxyz; y++) {
        for (let x = 0; x < ddxyz; x++) {
          offset.push(
            0.0, //  * (x / ddxyz) * 2.0 - 1.0,
            0.0, //  * (y / ddxyz) * 2.0 - 1.0,
            0.0, //  * (z / ddxyz) * 2.0 - 1.0,
            iii
          );
          iii++;
        }
      }
    }

    // let ddxyz = Math.floor(Math.pow(count, 1 / 2));
    // for (let y = 0; y < ddxyz; y++) {
    //   for (let x = 0; x < ddxyz; x++) {
    //     offset.push(0.0, (x / ddxyz) * 2.0 - 1.0, (y / ddxyz) * 2.0 - 1.0);
    //   }
    // }

    lineGeo.setAttribute(
      "offset",
      new InstancedBufferAttribute(new Float32Array(offset), 4)
    );

    let eachLineIdx = [];
    for (let c = 0; c < count; c++) {
      eachLineIdx.push(c);
    }

    // lineGeo.setAttribute(
    //   "lineIDXER",
    //   new InstancedBufferAttribute(new Float32Array(eachLineIdx), 1)
    // );

    return {
      ...props,
      dataLength: posArray.length,
      geometry: lineGeo,
    };
  }
}
