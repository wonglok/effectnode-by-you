import { HalfFloatType, RepeatWrapping, Vector3 } from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

export class DotToLine {
  constructor({ mini, renderer, dotSim, count = 10, tailSize = 32 }) {
    this.mini = mini;
    this.renderer = renderer;
    this.dotSim = dotSim;

    //
    this.WIDTH = tailSize;
    this.HEIGHT = count;
    this.width = this.WIDTH;
    this.height = this.HEIGHT;

    this.wait = this.setup({ mini });
    this.v3v000 = new Vector3(0, 0, 0);
  }
  async setup({ mini }) {
    await this.dotSim.wait;

    let gpu = (this.gpu = new GPUComputationRenderer(
      this.WIDTH,
      this.HEIGHT,
      this.renderer
    ));

    gpu.setDataType(HalfFloatType);

    const dtPosition = this.gpu.createTexture();
    const lookUpTexture = this.gpu.createTexture();
    const virtualLookUpTexture = this.gpu.createTexture();

    this.fillVirtualLookUpTexture(virtualLookUpTexture);
    this.fillPositionTexture(dtPosition);
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
      value: this.dotSim.getTextureAfterCompute(),
    };
    mini.onLoop(() => {
      this.positionUniforms["virtualPosition"] = {
        value: this.dotSim.getTextureAfterCompute(),
      };
    });

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

    for (let x = 0; x < this.dotSim.width; x++) {
      for (let y = 0; y < this.dotSim.height; y++) {
        tempArray.push([x / this.dotSim.width, y / this.dotSim.height]);
      }
    }

    for (let iii = 0; iii < this.HEIGHT; iii++) {
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
        vec4 positionHead = texture2D( texturePosition, uvCursor );
        vec4 lookupData = texture2D(lookup, uvCursor);
        vec2 nextUV = lookupData.xy;

        float currentIDX = floor(gl_FragCoord.x);
        float currentLine = floor(gl_FragCoord.y);

        if (floor(currentIDX) == 0.0) {
          vec4 uv4 = texture2D(virtualLookup, uvCursor);
          vec4 vp4 = texture2D(virtualPosition, uv4.xy);

          gl_FragColor = vec4(vp4.xyz, vp4.w);
        } else {
          vec4 positionChain = texture2D( texturePosition,nextUV );
          gl_FragColor = vec4(positionChain);
        }
			}
    `;
  }

  fillPositionTexture(texture) {
    let i = 0;
    const theArray = texture.image.data;

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        theArray[i++] = 0.0;
        theArray[i++] = 0.0;
        theArray[i++] = 0.0;
        theArray[i++] = 0.0;
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
