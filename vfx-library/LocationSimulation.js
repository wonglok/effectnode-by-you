import {
  AdditiveBlending,
  BoxBufferGeometry,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  DirectionalLight,
  HalfFloatType,
  InstancedBufferAttribute,
  InstancedMesh,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  ShaderMaterial,
  SphereBufferGeometry,
  Vector3,
} from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import { enableBloom } from "./Bloomer";

export class LocationSimulation {
  constructor({
    mini,
    width = 256,
    height = 256,
    sceneObjects = [],
    shaderCode,
    renderer,
    mounter,
    cursor,
    viewport,
  }) {
    this.mini = mini;
    this.width = width;
    this.height = height;
    this.shaderCode = shaderCode;
    this.renderer = renderer;
    this.mounter = mounter;
    this.cursor = cursor;
    this.sceneObjects = sceneObjects;
    this.viewport = viewport;
    this.o3d = new Object3D();

    this.setup();
    this.particles();
    this.sceneObjectRenders();

    this.wait = Promise.resolve();
  }

  async setup() {
    this.tick = 0;
    this.clock = new Clock();
    this.gpu = new GPUComputationRenderer(
      this.width,
      this.height,
      this.renderer
    );

    if (/iPad|iPhone|iPod/.test(navigator.platform)) {
      this.gpu.setDataType(HalfFloatType);
    }

    const iPad =
      navigator.userAgent.match(/(iPad)/) /* iOS pre 13 */ ||
      (navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1); /* iPad OS 13 */

    if (iPad) {
      this.gpu.setDataType(HalfFloatType);
    }

    let mouse = this.cursor;
    let mouseNow = new Vector3().copy(mouse);
    let mouseLast = new Vector3().copy(mouse);

    this.mini.onLoop(() => {
      mouseNow.copy(this.cursor);
      mouseLast.copy(mouseNow);
      mouseNow.copy(mouse);

      mouseLast.z = 0;
      mouseNow.z = 0;
    });

    this.filter0 = this.gpu.createShaderMaterial(this.shaderCode, {
      mouseNow: {
        value: mouseNow,
      },
      mouseLast: {
        value: mouseLast,
      },

      nowPosTex: { value: null },
      lastPosTex: { value: null },
      dT: { value: 0 },
      eT: { value: 0 },
    });

    this.rttPos0 = this.gpu.createRenderTarget();
    this.rttPos1 = this.gpu.createRenderTarget();
    this.rttPos2 = this.gpu.createRenderTarget();

    this.loopRTTPos = [this.rttPos0, this.rttPos1, this.rttPos2];

    let prepInitTexture = () => {
      var tex = this.gpu.createTexture();
      let idx = 0;
      let data = tex.image.data;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          data[idx * 4 + 0] = Math.random() - 0.5;
          data[idx * 4 + 1] = Math.random() - 0.5;
          data[idx * 4 + 2] = Math.random() - 0.5;
          data[idx * 4 + 3] = 0.0;
          idx++;
        }
      }

      console.log(tex);

      this.gpu.renderTexture(tex, this.loopRTTPos[0]);
      this.gpu.renderTexture(tex, this.loopRTTPos[1]);
      this.gpu.renderTexture(tex, this.loopRTTPos[2]);
    };

    prepInitTexture();
  }

  async particles() {
    let geoPt = new BufferGeometry();
    geoPt.copy(new SphereBufferGeometry(0.07, 5, 5));
    let uv = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        uv.push(x / this.width, y / this.height, 0.0);
      }
    }

    let colorsVertexArray = [];
    let colorSet = ["#ee4035", "#f37736", "#fdf498", "#7bc043", "#0392cf"];

    // "#ffffff", "#d0e1f9", "#4d648d", "#283655", "#1e1f26"
    // let colorSet = ["#00a8c6", "#40c0cb", "#f9f2e7", "#aee239", "#8fbe00"];

    colorSet = ["#d11141", "#00b159", "#00aedb", "#f37735", "#ffc425"];
    let count = this.width * this.height;
    let colorVar = new Color();
    for (let cc = 0; cc < count; cc++) {
      colorVar.setStyle(colorSet[cc % colorSet.length]);
      colorsVertexArray.push(colorVar.r, colorVar.g, colorVar.b);
    }

    geoPt.setAttribute(
      "rainbow",
      new InstancedBufferAttribute(new Float32Array(colorsVertexArray), 3)
    );

    geoPt.setAttribute(
      "uvv",
      new InstancedBufferAttribute(new Float32Array(uv), 3)
    );
    // geoPt.setAttribute("lookup", new BufferAttribute(new Float32Array(uv), 3));

    let matPt = new ShaderMaterial({
      uniforms: {
        nowPosTex: {
          value: null,
        },
      },
      vertexShader: /* glsl */ `
          uniform sampler2D nowPosTex;
          attribute vec3 uvv;
          attribute vec3 rainbow;
          varying vec3 vRainbow;

          mat4 translate(vec3 d)
          {
            return mat4(1, 0, 0, d.x,
                        0, 1, 0, d.y,
                        0, 0, 1, d.z,
                        0, 0, 0, 1);
          }

          mat4 scale(float c)
          {
            return mat4(c, 0, 0, 0,
                        0, c, 0, 0,
                        0, 0, c, 0,
                        0, 0, 0, 1);
          }


          void main (void) {
            vRainbow = rainbow;
            vec3 pos = texture2D(nowPosTex, uvv.xy).xyz;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position + pos, 1.0);
            gl_PointSize = 1.0;
          }
          `,
      fragmentShader: /* glsl */ `
        varying vec3 vRainbow;
          void main (void) {
            gl_FragColor = vec4(vRainbow, 1.0);
          }
      `,
      // blending: AdditiveBlending,
      transparent: true,
    });
    //
    let particles = new InstancedMesh(geoPt, matPt, this.width * this.height);
    particles.frustumCulled = false;
    particles.instanceMatrix.needsUpdate = true;
    enableBloom(particles);

    this.mounter.add(particles);
    this.mini.onClean(() => {
      this.mounter.remove(particles);
    });

    this.compute();
    this.outputSimTexture = this.loopRTTPos[2];

    this.mini.onLoop(() => {
      if (this.filter0) {
        this.compute();
        let outdata = this.loopRTTPos[2];

        this.outputSimTexture = outdata.texture;
        matPt.uniforms.nowPosTex.value = outdata.texture;
      }
    });

    console.log(this.mounter);
  }

  getTextureAfterCompute() {
    return this.outputSimTexture;
  }

  async sceneObjectRenders() {
    this.mounter.add(this.o3d);
    this.mini.onClean(() => {
      this.mounter.remove(this.o3d);
    });

    let mouseNow = new Vector3(0, 0, 0).copy(this.cursor);
    this.mini.onLoop(() => {
      mouseNow.copy(this.cursor);
      mouseNow.z = 0;
    });

    //

    let geoBall = new SphereBufferGeometry(1, 80, 80);
    let geoBox = new BoxBufferGeometry(1, 1, 1);
    let matNormal = new MeshNormalMaterial({
      opacity: 0.3,
      transparent: true,
      depthTest: false,
      // blending: AdditiveBlending,
    });
    let matStd = new MeshStandardMaterial({
      opacity: 1,
      transparent: true,
      color: new Color("#888"),
    });
    let dirLight = new DirectionalLight(0xffffff, 1);
    this.o3d.add(dirLight);
    dirLight.position.x = 5;
    dirLight.position.y = 5;
    dirLight.position.z = 5;

    let ptLight = new PointLight(0xffffff, 1);
    ptLight.position.x = 0;
    ptLight.position.y = 0;
    ptLight.position.z = 0;

    this.sceneObjects.forEach((entry, idx) => {
      if (entry.type === "mouse-sphere") {
        let entryMesh = new Mesh(geoBall, matNormal);
        entryMesh.attach(ptLight);
        enableBloom(entryMesh);
        this.o3d.add(entryMesh);

        this.mini.onLoop(() => {
          entryMesh.position.copy(mouseNow);
          entryMesh.scale.set(entry.radius, entry.radius, entry.radius);
        });
      }

      if (entry.type === "static-sphere") {
        let entryMesh = new Mesh(geoBall, matStd);
        this.o3d.add(entryMesh);

        this.mini.onLoop(() => {
          entryMesh.scale.set(entry.radius, entry.radius, entry.radius);
          entryMesh.position.copy(entry.position);
        });
      }

      if (entry.type === "static-box") {
        let entryMesh = new Mesh(geoBox, matStd);
        this.o3d.add(entryMesh);

        this.mini.onLoop(() => {
          entryMesh.scale.set(
            entry.boxSize.x * 2,
            entry.boxSize.y * 2,
            entry.boxSize.z * 2
          );
          entryMesh.position.set(
            entry.position.x,
            entry.position.y,
            entry.position.z
          );
        });
      }
    });
  }

  compute() {
    if (this.tick % 3 === 0) {
      this.loopRTTPos = [this.rttPos0, this.rttPos1, this.rttPos2];
    } else if (this.tick % 3 === 1) {
      this.loopRTTPos = [this.rttPos2, this.rttPos0, this.rttPos1];
    } else if (this.tick % 3 === 2) {
      this.loopRTTPos = [this.rttPos1, this.rttPos2, this.rttPos0];
    }

    this.filter0.uniforms.nowPosTex.value = this.loopRTTPos[0].texture;
    this.filter0.uniforms.lastPosTex.value = this.loopRTTPos[1].texture;
    this.filter0.uniforms.dT.value = this.clock.getDelta();
    this.filter0.uniforms.eT.value = this.clock.getElapsedTime();

    this.gpu.doRenderTarget(this.filter0, this.loopRTTPos[2]);

    this.tick++;
  }
}
