import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import {
  sRGBEncoding,
  Layers,
  MeshBasicMaterial,
  Vector2,
  ShaderMaterial,
  Color,
} from "three";

export const ENTIRE_SCENE = 0;
export const BLOOM_SCENE = 1;
export const DARK_SCENE = 2;

export const enableBloom = (item) => {
  item.layers.enable(BLOOM_SCENE);
};

export const enableDarken = (item) => {
  item.layers.enable(DARK_SCENE);
};

export function Bloomer({ myScene = false }) {
  // let tool = useTools();
  let { gl, size, scene, camera } = useThree();

  let activeScene = myScene || scene;
  //
  let {
    // baseRTT,
    //
    bloomComposer,
    finalComposer,
  } = useMemo(() => {
    let {
      EffectComposer,
    } = require("three/examples/jsm/postprocessing/EffectComposer");

    // let baseRTT = new WebGLRenderTarget(size.width, size.height, {
    //   encoding: sRGBEncoding,
    // });

    let bloomComposer = new EffectComposer(gl);
    // let dpr = gl.getPixelRatio();
    bloomComposer.renderToScreen = false;
    let sizeV2 = new Vector2(window.innerWidth, window.innerHeight);

    gl.getSize(sizeV2);

    let {
      RenderPass,
    } = require("three/examples/jsm/postprocessing/RenderPass");
    let renderPass = new RenderPass(activeScene, camera);
    bloomComposer.addPass(renderPass);

    let {
      UnrealBloomPass,
    } = require("three/examples/jsm/postprocessing/UnrealBloomPass.js");
    let unrealPass = new UnrealBloomPass(sizeV2, 1.5, 0.6, 0.5);
    unrealPass.renderToScreen = true;

    let audio = ({ detail: { low, mid, high, texture } }) => {
      if (low !== 0) {
        unrealPass.strength = 3 * (low + mid + high);
      }
    };
    window.addEventListener("audio-info", audio);
    // window.removeEventListener("audio-info", audio);

    unrealPass.strength = 1.3;
    unrealPass.threshold = 0.15;
    unrealPass.radius = 1.0;
    unrealPass.setSize(size.width, size.height);

    bloomComposer.addPass(unrealPass);

    //

    const finalComposer = new EffectComposer(gl);
    finalComposer.addPass(renderPass);
    finalComposer.renderToScreen = true;

    bloomComposer.renderTarget2.texture.encoding = sRGBEncoding;
    bloomComposer.renderTarget1.texture.encoding = sRGBEncoding;
    finalComposer.renderTarget2.texture.encoding = sRGBEncoding;
    finalComposer.renderTarget1.texture.encoding = sRGBEncoding;

    let {
      ShaderPass,
    } = require("three/examples/jsm/postprocessing/ShaderPass.js");

    //

    // let bloomTexture = {
    //   value: bloomComposer.renderTarget2.texture,
    // };

    const finalPass = new ShaderPass(
      new ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: {
            value: bloomComposer.renderTarget2.texture,
          },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;

          varying vec2 vUv;

          void main() {
            gl_FragColor = ( texture2D( baseTexture, vUv ) * 1.0 + 1.0 * texture2D( bloomTexture, vUv ) );
          }
        `,
        defines: {},
      }),
      "baseTexture"
    );
    //

    finalPass.needsSwap = true;
    finalComposer.addPass(finalPass);

    window.addEventListener(
      "resize",
      () => {
        let dpr = gl.getPixelRatio();
        let bloomDPR = dpr * 0.5;
        if (bloomDPR <= 1) {
          bloomDPR = 1;
        }

        gl.getSize(sizeV2);
        // sizeV2.multiplyScalar(dpr);
        bloomComposer.setSize(sizeV2.x, sizeV2.y);
        finalComposer.setSize(sizeV2.x, sizeV2.y);

        bloomComposer.setPixelRatio(bloomDPR);
        finalComposer.setPixelRatio(dpr);
      },
      false
    );

    window.dispatchEvent(new CustomEvent("resize"));

    return {
      bloomComposer,
      finalComposer,
    };
  }, []);

  // let materials = {};
  const darkMaterial = new MeshBasicMaterial({
    color: new Color("#000000"),
    // skinning: true,
  });

  // let materials = {};
  const darkMaterial2 = new MeshBasicMaterial({
    color: new Color("#000000"),
    // skinning: true,
  });

  const BloomLayer = new Layers();
  BloomLayer.set(BLOOM_SCENE);

  const DarkLayer = new Layers();
  DarkLayer.set(DARK_SCENE);

  let cacheMap = new Map();
  let cacheMapDark = new Map();

  function darkenNonBloomed(obj) {
    if (obj.text) {
      obj.visible = false;
    } else if (DarkLayer.test(obj.layers) === true) {
      cacheMapDark.set(obj.uuid, obj.material);
      obj.material = obj.userData.darkMaterial || darkMaterial2;
    } else if (
      (obj.isMesh || obj.isSkinnedMesh || obj.isSprite) &&
      BloomLayer.test(obj.layers) === false
    ) {
      cacheMap.set(obj.uuid, obj.material);
      obj.material = obj.userData.darkMaterial || darkMaterial;
    }
  }

  function restoreMaterial(obj) {
    if (obj.text) {
      obj.visible = true;
    }

    if (cacheMap.has(obj.uuid)) {
      obj.material = cacheMap.get(obj.uuid);
      cacheMap.delete(obj.uuid);
    }

    if (cacheMapDark.has(obj.uuid)) {
      obj.material = cacheMapDark.get(obj.uuid);
      cacheMapDark.delete(obj.uuid);
    }
  }

  let run = (dt) => {
    gl.autoClear = false;
    gl.clear();

    let origBG = activeScene.background;

    //
    gl.shadowMap.enabled = false;
    activeScene.background = null;
    activeScene.traverse(darkenNonBloomed);
    bloomComposer.render(dt);
    //
    gl.shadowMap.enabled = true;
    activeScene.background = origBG;
    activeScene.traverse(restoreMaterial);
    finalComposer.render(dt);

    if (scene.userData.myScene && scene.userData.myOrtho) {
      gl.setRenderTarget(null);
      gl.clearDepth();
      gl.render(scene.userData.myScene, scene.userData.myOrtho);
    }
  };

  useFrame((state, dt) => {
    run(dt);
  }, 1000);

  return null;
}
