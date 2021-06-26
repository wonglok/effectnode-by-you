import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { sRGBEncoding } from "three";
import { PMREMGenerator, TextureLoader } from "three";

export function ENHDRI() {
  // let RGBELoader = require("three/examples/jsm/loaders/RGBELoader.js")
  //   .RGBELoader;
  let url = `/texture/bluradam.png`;
  let { scene, gl } = useThree();
  // let chroma = new ShaderCubeChrome({ res: 128, renderer: gl });
  // useEffect((state, dt) => {
  //   chroma.compute({ time: dt });
  //   scene.environment = chroma.out.envMap;
  // }, []);

  useEffect(() => {
    const pmremGenerator = new PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();

    let loader = new TextureLoader();
    // loader.setDataType(UnsignedByteType);
    loader.load(url, (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      envMap.encoding = sRGBEncoding;
      // scene.background = envMap;
      scene.environment = envMap;
    });

    return () => {
      scene.environment = null;
      scene.background = null;
    };
  }, [url]);

  return null;
}
