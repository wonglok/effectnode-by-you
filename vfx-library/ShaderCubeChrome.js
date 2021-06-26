import {
  WebGLCubeRenderTarget,
  Camera,
  Scene,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  CubeRefractionMapping,
  BackSide,
  NoBlending,
  BoxBufferGeometry,
  CubeCamera,
  Color,
  LinearMipmapLinearFilter,
  Vector2,
  MeshBasicMaterial,
  DoubleSide,
  RGBFormat,
  LinearFilter,
  CubeReflectionMapping,
  WebGLRenderTarget,
  EquirectangularReflectionMapping,
  sRGBEncoding,
} from "three";

// import { cloneUniforms } from "three/src/renderers/shaders/UniformsUtils.js";
// import * as dat from '';

class CustomWebGLCubeRenderTarget extends WebGLCubeRenderTarget {
  constructor(width, height, options) {
    super(width, height, options);
    this.ok = true;
  }

  setup(renderer, texture) {
    this.texture.type = texture.type;
    this.texture.format = texture.format;
    this.texture.encoding = texture.encoding;

    var scene = new Scene();

    var shader = {
      uniforms: {
        tEquirect: { value: null },
      },

      vertexShader: `
        varying vec3 vWorldDirection;
        vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
          return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
        }
        void main() {
          vWorldDirection = transformDirection( position, modelMatrix );
          #include <begin_vertex>
          #include <project_vertex>
        }
      `,

      fragmentShader: `
        uniform sampler2D tEquirect;
        varying vec3 vWorldDirection;
        #define RECIPROCAL_PI 0.31830988618
        #define RECIPROCAL_PI2 0.15915494
        void main() {
          vec3 direction = normalize( vWorldDirection );
          vec2 sampleUV;
          sampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
          sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;
          gl_FragColor = texture2D( tEquirect, sampleUV );
        }
      `,
    };

    var material = new ShaderMaterial({
      type: "CubemapFromEquirect",
      uniforms: shader.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: BackSide,
      blending: NoBlending,
    });

    material.uniforms.tEquirect.value = texture;

    var mesh = new Mesh(new BoxBufferGeometry(5, 5, 5), material);
    scene.add(mesh);

    // var cubeRtt = new WebGLCubeRenderTarget(this.width, {format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter });
    var camera = new CubeCamera(1, 100000, this);

    camera.renderTarget = this;
    camera.renderTarget.texture.name = "CubeCameraTexture";

    camera.update(renderer, scene);

    this.compute = () => {
      camera.update(renderer, scene);
    };

    // mesh.geometry.dispose()
    // mesh.material.dispose()
  }
}

export class ShaderCubeChrome {
  constructor({ renderer, res = 128, color = new Color("#ffffff") }) {
    // this.onLoop = ctx.onLoop
    // console.log(renderer)
    this.renderer = renderer;
    this.resX = res;
    this.renderTargetCube = new CustomWebGLCubeRenderTarget(this.resX, {
      format: RGBFormat,
      generateMipmaps: true,
      magFilter: LinearFilter,
      minFilter: LinearMipmapLinearFilter,
    });
    this.renderTargetPlane = new WebGLRenderTarget(this.resX, this.resX, {
      format: RGBFormat,
      generateMipmaps: true,
      magFilter: LinearFilter,
      minFilter: LinearMipmapLinearFilter,
    });
    this.camera = new Camera();
    this.scene = new Scene();
    this.geo = new PlaneBufferGeometry(2, 2, 2, 2);
    let uniforms = {
      time: {
        value: 0,
      },
      resolution: {
        value: new Vector2(this.resX, this.resX),
      },
      diffuse: {
        value: color,
      },
    };

    this.mat = new ShaderMaterial({
      side: DoubleSide,
      transparent: true,
      uniforms,
      vertexShader: `
        void main (void) {
          gl_Position = vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        #include <common>
          uniform vec2 resolution;
          uniform float time;
          uniform vec3 diffuse;

          const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

          float noise( in vec2 p ) {
            return sin(p.x)*sin(p.y);
          }

          float fbm4( vec2 p ) {
              float f = 0.0;
              f += 0.5000 * noise( p ); p = m * p * 2.02;
              f += 0.2500 * noise( p ); p = m * p * 2.03;
              f += 0.1250 * noise( p ); p = m * p * 2.01;
              f += 0.0625 * noise( p );
              return f / 0.9375;
          }

          float fbm6( vec2 p ) {
              float f = 0.0;
              f += 0.500000*(0.5 + 0.5 * noise( p )); p = m*p*2.02;
              f += 0.250000*(0.5 + 0.5 * noise( p )); p = m*p*2.03;
              f += 0.125000*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
              f += 0.062500*(0.5 + 0.5 * noise( p )); p = m*p*2.04;
              f += 0.031250*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
              f += 0.015625*(0.5 + 0.5 * noise( p ));
              return f/0.96875;
          }

          float pattern (vec2 p) {
            float vout = fbm4( p + time + fbm6(  p + fbm4( p + time )) );
            return abs(vout);
          }

          // // Found this on GLSL sandbox. I really liked it, changed a few things and made it tileable.
          // // :)
          // // by David Hoskins.


          // // Water turbulence effect by joltz0r 2013-07-04, improved 2013-07-07


          // // Redefine below to see the tiling...
          // //#define SHOW_TILING

          // #define TAU 6.28318530718
          // #define MAX_ITER 12

          // vec4 waterwaves( in vec2 fragCoord, in vec2 iResolution, in float iTime)
          // {
          //   float time = iTime * .5+23.0;
          //     // uv should be the 0-1 uv of texture...
          //   vec2 uv = fragCoord.xy / iResolution.xy;

          // #ifdef SHOW_TILING
          //   vec2 p = mod(uv*TAU*2.0, TAU)-250.0;
          // #else
          //     vec2 p = mod(uv*TAU, TAU)-250.0;
          // #endif
          //   vec2 i = vec2(p);
          //   float c = 1.0;
          //   float inten = .005;

          //   for (int n = 0; n < MAX_ITER; n++)
          //   {
          //     float t = time * (1.0 - (3.5 / float(n+1)));
          //     i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
          //     c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
          //   }
          //   c /= float(MAX_ITER);
          //   c = 1.17-pow(c, 1.4);
          //   vec3 colour = vec3(pow(abs(c), 12.0));
          //     colour = clamp(colour + vec3(diffuse), 0.0, 1.0);


          //   #ifdef SHOW_TILING
          //   // Flash tile borders...
          //   vec2 pixel = 2.0 / iResolution.xy;
          //   uv *= 2.0;

          //   float f = floor(mod(iTime*.5, 2.0)); 	// Flash value.
          //   vec2 first = step(pixel, uv) * f;		   	// Rule out first screen pixels and flash.
          //   uv  = step(fract(uv), pixel);				// Add one line of pixels per tile.
          //   colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line

          //   #endif
          //   return vec4(colour, 1.0);
          // }

          void main (void) {
            vec2 uv = gl_FragCoord.xy / resolution.xy;

            // vec4 water = waterwaves(gl_FragCoord.xy, vec2(resolution.xy), time * 0.05);

            gl_FragColor = vec4(vec3(
              0.35 + pattern(uv * 1.70123 + -0.17 * cos(time * 0.05)),
              0.35 + pattern(uv * 1.70123 +  0.0 * cos(time * 0.05)),
              0.35 + pattern(uv * 1.70123 +  0.17 * cos(time * 0.05))
            ) * diffuse, 1.0);

            // gl_FragColor.rgb *= gl_FragColor.rgb;
            // gl_FragColor = water;
          }
      `,
    });

    this.renderTargetPlane.texture.encoding = sRGBEncoding;
    this.renderTargetPlane.texture.mapping = EquirectangularReflectionMapping;
    // this.renderTargetCube.texture.mapping = CubeReflectionMapping
    this.renderTargetCube.texture.mapping = CubeRefractionMapping;
    this.renderTargetCube.texture.mapping = CubeReflectionMapping;
    this.renderTargetCube.texture.encoding = sRGBEncoding;

    this.renderTargetCube.setup(this.renderer, this.renderTargetPlane.texture);

    this.compute = ({ time, computeEnvMap = true }) => {
      uniforms.time.value = time || window.performance.now() * 0.0001;
      let camera = this.camera;
      let renderer = this.renderer;
      let scene = this.scene;

      // let renderTarget = this.renderTarget
      // var generateMipmaps = renderTargetCube.texture.generateMipmaps
      // renderTargetCube.texture.generateMipmaps = false

      renderer.setRenderTarget(this.renderTargetPlane);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      if (computeEnvMap) {
        this.renderTargetCube.compute();
        return;
      }
    };

    this.plane = new Mesh(this.geo, this.mat);
    this.out = {
      texture: this.renderTargetPlane.texture,
      envMap: this.renderTargetCube.texture,
      material: new MeshBasicMaterial({
        color: 0xffffff,
        side: DoubleSide,
        envMap: this.renderTargetCube.texture,
      }),
    };
    this.scene.add(this.plane);
  }
}
