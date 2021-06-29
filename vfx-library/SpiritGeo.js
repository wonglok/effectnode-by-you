import { GPUComputationRenderer } from "three-stdlib";
import {
  HalfFloatType,
  Vector3,
  BufferAttribute,
  CylinderBufferGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Vector2,
  RepeatWrapping,
  ShaderMaterial,
  Mesh,
  DataTexture,
  DataUtils,
  RGBFormat,
  Color,
} from "three";
import { Geometry } from "three/examples/jsm/deprecated/Geometry.js";
// import { enableBloom } from "../../Bloomer/Bloomer";
// import { curlNoise } from "../avatar/curl";
// import { ShaderCubeChrome } from "../../Shaders/ShaderCubeChrome";
// import { TextureLoader } from "three";
import { InteractionUI } from "./InteractionUI";
import { sleep } from "../vfx-runtime/ENUtils";

let enableBloom = (v) => console.log("enable bloom placeholder", v);

export const example = async ({ mini }) => {
  // await mini.ready.SceneDisplayed;
  // let gl = await mini.ready.gl;

  let vec3Mouse = await InteractionUI.hoverPlane({ mini: mini });

  await sleep(30);

  let wiggle = new SpiritGeo({
    mini: mini,
    tracker: vec3Mouse,
  });
};

export class LokLokGravitySimulation {
  constructor({ mini, width, height, tracker }) {
    this.tracker = tracker;
    this.WIDTH = width;
    this.HEIGHT = height;
    this.count = width * height;
    this.mini = mini;
    this.wait = this.setup();
  }
  async setup() {
    let mini = this.mini;
    let renderer = await mini.ready.gl;

    // let mouse = await UI.hoverPlane(mini);

    // let mouse = await Mouse.orbitTrace(mini);
    let mouse = this.tracker;

    this.gpu = new GPUComputationRenderer(this.WIDTH, this.HEIGHT, renderer);
    let gpu = this.gpu;

    gpu.setDataType(HalfFloatType);

    const dtPosition = this.gpu.createTexture();
    const dtVelocity = this.gpu.createTexture();
    const lookUpTexture = this.gpu.createTexture();

    dtPosition.wrapS = RepeatWrapping;
    dtPosition.wrapT = RepeatWrapping;

    dtVelocity.wrapS = RepeatWrapping;
    dtVelocity.wrapT = RepeatWrapping;

    this.fillPositionTexture(dtPosition, mouse);

    this.onReset = () => {
      this.fillPositionTexture(dtPosition, mouse);
    };

    this.fillVelocityTexture(dtVelocity);
    this.fillLookupTexture(lookUpTexture);

    this.positionVariable = this.gpu.addVariable(
      "texPosition",
      this.posShader(),
      dtPosition
    );

    this.velocityVariable = this.gpu.addVariable(
      "texVelocity",
      this.velShader(),
      dtVelocity
    );

    this.gpu.setVariableDependencies(this.positionVariable, [
      this.velocityVariable,
      this.positionVariable,
    ]);

    this.gpu.setVariableDependencies(this.velocityVariable, [
      this.positionVariable,
      this.velocityVariable,
    ]);

    this.velocityUniforms = this.velocityVariable.material.uniforms;

    this.velocityUniforms.mouse = { value: mouse };
    this.velocityUniforms["time"] = { value: 0 };

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.positionUniforms["lookup"] = { value: lookUpTexture };
    this.positionUniforms["time"] = { value: 0 };
    dtPosition.wrapS = RepeatWrapping;
    dtPosition.wrapT = RepeatWrapping;

    this.positionUniforms["dt"] = { value: 1 };
    this.velocityUniforms.dt = { value: 1 };

    //
    const error = this.gpu.init();
    if (error !== null) {
      console.error(error);
    }

    mini.onLoop((dt, st) => {
      gpu.compute();

      this.positionUniforms["dt"] = { value: dt / 1000 };
      this.velocityUniforms.dt = { value: dt / 1000 };

      this.positionUniforms["time"] = { value: st / 1000 };
      this.velocityUniforms["time"] = { value: st / 1000 };
    });

    // let scene = await mini.ready.scene;
    // let planeGeo = new PlaneBufferGeometry(1, 1);
    // let planeMat = new MeshBasicMaterial({
    //   map: null,
    // });
    // let item = new Mesh(planeGeo, planeMat);
    // item.position.y = 2;
    // scene.add(item);
    // mini.onClean(() => {
    //   scene.remove(item);
    // });
    // mini.onLoop(() => {
    //   planeMat.map = this.gpu.getCurrentRenderTarget(
    //     this.positionVariable
    //   ).texture;
    //   planeMat.needsUpdate = true;
    // })

    return this;
  }

  getPositionTexture() {
    return this.gpu.getCurrentRenderTarget(this.positionVariable).texture;
  }

  getVelocityTexture() {
    return this.gpu.getCurrentRenderTarget(this.positionVariable).texture;
  }

  render() {
    //
  }

  velShader() {
    return /* glsl */ `
      float constrain(float val, float min, float max) {
        if (val < min) {
            return min;
        } else if (val > max) {
            return max;
        } else {
            return val;
        }
      }

      uniform vec3 mouse;
      uniform float dt;
      uniform float time;

      vec3 getDiff (in vec3 lastPos, in vec3 mousePos) {
        vec3 diff = lastPos - mousePos;

        float distance = constrain(length(diff), 30.0, 50.0);

        // v is extra speed
        float strength = 3.0 * 1.0 / pow(distance, 2.0);

        diff = normalize(diff);
        diff = diff * pow(strength, 1.0) * -2.0;

        // extra strength
        diff *= 10.0;

        return diff;
      }


      void main(void)	{
        vec2 cellSize = 1.0 / resolution.xy;
        vec2 uv = gl_FragCoord.xy * cellSize;

        vec4 lastVel = texture2D(texVelocity, uv);
        vec4 lastPos = texture2D(texPosition, uv);

        vec3 diff = getDiff( lastPos.xyz, vec3(mouse) );
        lastVel.xyz += diff;

        // lastVel.xyz += curlNoise(diff.xyz) * 0.1;

        gl_FragColor = lastVel;
      }

    `;
  }

  posShader() {
    return /* glsl */ `
    uniform float dt;

    ${curlNoise}


      void main(void)	{
        vec2 cellSize = 1.0 / resolution.xy;
        vec2 uv = gl_FragCoord.xy * cellSize;

        vec4 lastVel = texture2D( texVelocity, uv );
        vec4 lastPos = texture2D( texPosition, uv );

        float extra = 1.0;
        lastPos.xyz += lastVel.xyz * dt * 0.3 * extra;// + curlNoise(lastPos.xyz);
        gl_FragColor = lastPos;
      }
    `;
  }

  fillPositionTexture(texture, initPosVec3 = false) {
    let i = 0;
    const theArray = texture.image.data;
    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        if (initPosVec3) {
          theArray[i++] = initPosVec3.x;
          theArray[i++] = initPosVec3.y;
          theArray[i++] = initPosVec3.z;
          theArray[i++] = 1.0;
        } else {
          theArray[i++] = Math.random() * 2.0 - 1.0;
          theArray[i++] = Math.random() * 2.0 - 1.0;
          theArray[i++] = Math.random() * 2.0 - 1.0;
          theArray[i++] = 1.0;
        }
      }
    }
    texture.needsUpdate = true;
  }

  fillVelocityTexture(texture) {
    let i = 0;
    const theArray = texture.image.data;
    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        theArray[i++] = 1.0 * (Math.random() - 0.5);
        theArray[i++] = 1.0 * (Math.random() - 0.5);
        theArray[i++] = 1.0 * (Math.random() - 0.5);
        theArray[i++] = 1.0;
      }
    }
    texture.needsUpdate = true;
  }

  fillLookupTexture(texture) {
    let i = 0;
    const theArray = texture.image.data;

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        theArray[i++] = x / this.WIDTH;
        theArray[i++] = y / this.HEIGHT;
        theArray[i++] = this.WIDTH;
        theArray[i++] = this.HEIGHT;
      }
    }
    texture.needsUpdate = true;
  }
}

class LokLokHairBallSimulation {
  constructor({ mini, virtual, numberOfScans = 10, trailSize = 32, tracker }) {
    this.mini = mini;
    this.virtual = virtual;
    this.WIDTH = trailSize;
    this.tracker = tracker;

    this.HEIGHT = numberOfScans;
    this.NUMBER_OF_SCANS = numberOfScans;

    this.wait = this.setup({ mini });
    this.v3v000 = new Vector3(0, 0, 0);
  }
  async setup({ mini }) {
    await this.virtual.wait;
    let renderer = await mini.ready.gl;

    let gpu = (this.gpu = new GPUComputationRenderer(
      this.WIDTH,
      this.HEIGHT,
      renderer
    ));

    gpu.setDataType(HalfFloatType);

    const dtPosition = this.gpu.createTexture();
    const lookUpTexture = this.gpu.createTexture();
    const virtualLookUpTexture = this.gpu.createTexture();

    // let mouse = await Mouse.orbitTrace(mini);
    let mouse = this.tracker;

    this.fillVirtualLookUpTexture(virtualLookUpTexture);
    this.fillPositionTexture(dtPosition, mouse);
    this.fillLookupTexture(lookUpTexture);

    this.positionVariable = this.gpu.addVariable(
      "texturePosition",
      this.positionShader(),
      dtPosition
    );
    this.gpu.setVariableDependencies(this.positionVariable, [
      this.positionVariable,
    ]);

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.positionUniforms["virtualLookup"] = { value: virtualLookUpTexture };
    this.positionUniforms["lookup"] = { value: lookUpTexture };
    this.positionUniforms["time"] = { value: 0 };

    this.positionUniforms["virtualPosition"] = {
      value: this.virtual.getPositionTexture(),
    };
    mini.onLoop(() => {
      this.positionUniforms["virtualPosition"] = {
        value: this.virtual.getPositionTexture(),
      };
    });

    // let h = this.HEIGHT;
    // for (let ii = 0; ii < h; ii++) {
    //   this.positionUniforms["mouse" + ii] = { value: new Vector3(0, 0, 0) };
    // }

    this.positionUniforms["time"] = { value: 0 };
    dtPosition.wrapS = RepeatWrapping;
    dtPosition.wrapT = RepeatWrapping;

    //
    const error = this.gpu.init();
    if (error !== null) {
      console.error(error);
    }

    mini.onLoop(() => {
      this.positionUniforms["time"].value = window.performance.now() / 1000;
      this.gpu.compute();
    });

    // setTimeout(() => {
    //   mini.env.set("LineComputed", true);
    // }, 100);
  }

  fillVirtualLookUpTexture(texture) {
    let k = 0;
    const theArray = texture.image.data;

    const tempArray = [];

    for (let x = 0; x < this.virtual.WIDTH; x++) {
      for (let y = 0; y < this.virtual.HEIGHT; y++) {
        tempArray.push([x / this.virtual.WIDTH, y / this.virtual.HEIGHT]);
      }
    }

    for (let iii = 0; iii < this.NUMBER_OF_SCANS; iii++) {
      for (let x = 0; x < this.WIDTH; x++) {
        let v = tempArray[iii];

        theArray[k++] = v[0];
        theArray[k++] = v[1];
        theArray[k++] = 0.0;
        theArray[k++] = 0.0;
      }
    }

    texture.needsUpdate = true;
  }

  positionShader() {
    return /* glsl */ `
      uniform sampler2D lookup;
      uniform float time;
      uniform sampler2D virtualLookup;
      uniform sampler2D virtualPosition;

			void main()	{
        // const float width = resolution.x;
        // const float height = resolution.y;
        // float xID = floor(gl_FragCoord.x);
        // float yID = floor(gl_FragCoord.y);

        vec2 uvCursor = vec2(gl_FragCoord.x, gl_FragCoord.y) / resolution.xy;
        // vec4 positionHead = texture2D( texturePosition, uvCursor );

        vec4 lookupData = texture2D(lookup, uvCursor);
        vec2 nextUV = lookupData.xy;
        float currentIDX = floor(gl_FragCoord.x);
        float currentLine = floor(gl_FragCoord.y);

        if (floor(currentIDX) == 0.0) {
          vec4 uv4 = texture2D(virtualLookup, uvCursor);
          vec4 vp4 = texture2D(virtualPosition, uv4.xy);
          gl_FragColor = vec4(vp4.xyz, 1.0);
        } else {
          vec3 positionChain = texture2D( texturePosition,nextUV ).xyz;
          gl_FragColor = vec4(positionChain, 1.0);
        }
			}
    `;
  }

  fillPositionTexture(texture, mouse = false) {
    let i = 0;
    const theArray = texture.image.data;

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        if (mouse) {
          theArray[i++] = mouse.x;
          theArray[i++] = mouse.y;
          theArray[i++] = mouse.z;
          theArray[i++] = 0.0;
        } else {
          theArray[i++] = 0.0;
          theArray[i++] = 0.0;
          theArray[i++] = 0.0;
          theArray[i++] = 0.0;
        }
      }
    }
    texture.needsUpdate = true;
  }

  fillLookupTexture(texture) {
    let i = 0;
    const theArray = texture.image.data;
    let items = [];

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        let lastOneInArray = items[items.length - 1] || [0, 0];
        theArray[i++] = lastOneInArray[0];
        theArray[i++] = lastOneInArray[1];
        theArray[i++] = this.WIDTH;
        theArray[i++] = this.HEIGHT;
        items.push([x / this.WIDTH, y / this.HEIGHT]);
      }
    }
    texture.needsUpdate = true;
  }

  render() {}

  getTextureAfterCompute() {
    return {
      posTexture: this.gpu.getCurrentRenderTarget(this.positionVariable)
        .texture,
    };
  }
}

class LokLokWiggleDisplay {
  constructor({ mini, sim, tracker }) {
    this.mini = mini;
    this.sim = sim;
    this.tracker = tracker;
    this.wait = this.setup({ mini });
  }
  async setup({ mini }) {
    let scene = await mini.ready.scene;

    // let camera = await mini.ready.camera;
    // let renderer = await mini.ready.gl;

    let { geometry, subdivisions, count } = new NoodleGeo({
      count: this.sim.NUMBER_OF_SCANS,
      numSides: 4,
      subdivisions: this.sim.WIDTH,
      openEnded: true,
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
              lineIDXER / ${this.sim.NUMBER_OF_SCANS.toFixed(1)}
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
          vRainbow = rainbow;
          vec3 transformed;
          vec3 objectNormal;

          float t = tubeInfo + 0.5;

          vT = t;

          // thickness

          float tickness = 1.0;

          vec2 volume = vec2(
            0.015 * tickness *
            ${this.invertedScale.toFixed(1)}
            ,
            0.015 * tickness *
            ${this.invertedScale.toFixed(1)}
          );
          createTube(t, volume, transformed, objectNormal);

          vec3 transformedNormal = normalMatrix * objectNormal;
          vNormal = normalize(transformedNormal);

          // vUv = uv.yx;

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vViewPosition = -mvPosition.xyz;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vT;
        // varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform sampler2D matcap;
        varying vec3 vRainbow;
        void main (void) {

          vec3 viewDir = normalize( vViewPosition );
          vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
          vec3 y = cross( viewDir, x );
          vec2 uv = vec2( dot( x, vNormal ), dot( y, vNormal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

          vec4 matcapColor = texture2D( matcap, uv );

          gl_FragColor = vec4(vRainbow, pow(1.0 - vT, 3.0));
        }
      `,
      transparent: true,
      depthTest: false,
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

    scene.add(line0);
    mini.onClean(() => {
      scene.remove(line0);
    });

    await this.sim.wait;

    mini.onLoop(() => {
      let result = this.sim.getTextureAfterCompute();
      matLine0.uniforms.posTexture.value = result.posTexture;
      matLine0.uniforms.time.value = window.performance.now() / 1000;
    });
  }

  enableHandTexture() {
    const width = this.sim.WIDTH;
    const height = this.sim.HEIGHT;
    const size = width * height;

    let handMovement = [];
    let temppos = new Vector3();
    for (let i = 0; i < size; i++) {
      AvatarHead.getWorldPosition(temppos);

      let x = temppos.x || 0;
      let y = temppos.y || 0;
      let z = temppos.z || 0;
      //
      handMovement.unshift(x, y, z);
    }

    const textureArray = new Uint16Array(3 * size);
    const handTexture = new DataTexture(
      textureArray,
      width,
      height,
      RGBFormat,
      HalfFloatType
    );
    handTexture.needsUpdate = true;

    mini.onLoop(() => {
      handMovement.push(DataUtils.toHalfFloat(temppos.x) || 0);
      handMovement.push(DataUtils.toHalfFloat(temppos.y) || 0);
      handMovement.push(DataUtils.toHalfFloat(temppos.z) || 0);

      handMovement.shift();
      handMovement.shift();
      handMovement.shift();

      textureArray.set(handMovement, 0);
      handTexture.needsUpdate = true;
      mat.uniforms.handTexture.value = handTexture;
    });
  }
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

export class SpiritGeo {
  //
  constructor({ mini, tracker }) {
    this.tracker = tracker;
    this.mini = mini;
    this.setup({ mini });
  }

  async setup({ mini }) {
    let WIDTH = 1;
    let HEIGHT = 128;
    let SCAN_COUNT = WIDTH * HEIGHT;
    let TAIL_LENGTH = 128;

    //

    let virtual = new LokLokGravitySimulation({
      mini: mini,
      width: WIDTH,
      height: HEIGHT,
      tracker: this.tracker,
    });

    this.onReset = () => {
      virtual.onReset();
    };

    let sim = new LokLokHairBallSimulation({
      mini,
      virtual,
      numberOfScans: SCAN_COUNT,
      trailSize: TAIL_LENGTH,
      tracker: this.tracker,
    });

    let display = new LokLokWiggleDisplay({ mini, sim, tracker: this.tracker });

    mini.onLoop(() => {
      sim.render({});
    });
  }
}

export const curlNoise = /* glsl */ `
//---------------------------------------------------------------------- CURL

vec4 permute(vec4 x){return mod(x*x*34.+x,289.);}
float snoise(vec3 v){
  const vec2 C = 1./vec2(6,3);
  const vec4 D = vec4(0,.5,1,2);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1. - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.x;
  vec3 x2 = x0 - i2 + C.y;
  vec3 x3 = x0 - D.yyy;
  i = mod(i,289.);
  vec4 p = permute( permute( permute(
  i.z + vec4(0., i1.z, i2.z, 1.))
	+ i.y + vec4(0., i1.y, i2.y, 1.))
	+ i.x + vec4(0., i1.x, i2.x, 1.));
  vec3 ns = .142857142857 * D.wyz - D.xzx;
  vec4 j = p - 49. * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = floor(j - 7. * x_ ) *ns.x + ns.yyyy;
  vec4 h = 1. - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 sh = -step(h, vec4(0));
  vec4 a0 = b0.xzyw + (floor(b0)*2.+ 1.).xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + (floor(b1)*2.+ 1.).xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.);
  return .5 + 12. * dot( m * m * m, vec4( dot(p0,x0), dot(p1,x1),dot(p2,x2), dot(p3,x3) ) );
}

vec3 snoiseVec3( vec3 x ){
  return vec3(  snoise(vec3( x )*2.-1.),
								snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ))*2.-1.,
								snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 )*2.-1.)
	);
}

vec3 curlNoise( vec3 p ){
  const float e = .1;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x , y , z ) * divisor );
}

`;
