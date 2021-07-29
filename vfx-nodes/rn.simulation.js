import {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Raycaster,
  SphereBufferGeometry,
  Vector3,
} from "three";
import { DotToLine } from "../vfx-library/DotToLine";
import { LocationSimulation } from "../vfx-library/LocationSimulation";
import { RainyComet } from "../vfx-library/RainyComet";

export async function effect({ mini, node }) {
  let { ballify } = await node.in0.ready;

  let collisionCode = ``;

  let sceneObjects = [
    {
      type: "mouse-sphere",
      radius: 2.5,
    },
    {
      type: "static-sphere",
      position: new Vector3(0.9, 0.0, 0.0),
      radius: 0.35,
    },
    {
      type: "static-sphere",
      position: new Vector3(2.0, -2.0, 0.0),
      radius: 1.4,
    },
    {
      type: "static-sphere",
      position: new Vector3(-1.5, -4.0, 0.0),
      radius: 1.4,
    },
    {
      type: "static-box",
      position: new Vector3(0.0, -6.0, 0.0),
      boxSize: new Vector3(5.0, 0.15, 5.0),
    },
    {
      type: "static-box",
      position: new Vector3(0.9, 0.8, 0.0),
      boxSize: new Vector3(1.0, 0.1, 1.0),
    },
  ];

  for (let i = 0; i < sceneObjects.length; i++) {
    let ball = sceneObjects[i];
    if (ball.type === "mouse-sphere") {
      collisionCode += `collisionMouseSphere(
        pos,
        vel,
        ${ball.radius.toFixed(3)}
      );`;
    }

    if (ball.type === "static-sphere") {
      collisionCode += `collisionStaticSphere(
        pos,
        vel,
        vec3(
          ${ball.position.x.toFixed(3)},
          ${ball.position.y.toFixed(3)},
          ${ball.position.z.toFixed(3)}
        ),
        ${ball.radius.toFixed(3)}
      );`;
    }

    if (ball.type === "static-box") {
      collisionCode += `collisionStaticBox(
        pos,
        vel,
        vec3(
          ${ball.position.x.toFixed(3)},
          ${ball.position.y.toFixed(3)},
          ${ball.position.z.toFixed(3)}
        ),
        vec3(
          ${ball.boxSize.x.toFixed(3)},
          ${ball.boxSize.y.toFixed(3)},
          ${ball.boxSize.z.toFixed(3)}
        )
      );`;
    }
  }

  let shaderCode = /* glsl */ `
  #include <common>

  precision highp float;
  uniform highp sampler2D nowPosTex;
  uniform highp sampler2D lastPosTex;
  uniform float dT;
  uniform float eT;

  uniform vec3 mouseNow;
  uniform vec3 mouseLast;

  float sdBox( vec3 p, vec3 b ) {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  }

  void collisionStaticSphere (inout vec4 particlePos, inout vec3 particleVel, vec3 colliderSpherePosition, float sphereRadius) {
    vec3 dif = (colliderSpherePosition) - particlePos.xyz;
    if( length( dif ) < sphereRadius ){
      particleVel -= normalize(dif) * dT * 1.0;
    }
  }

  void collisionMouseSphere (inout vec4 particlePos, inout vec3 particleVel, float sphereRadius) {
    vec3 dif = (mouseNow) - particlePos.xyz;

    if( length( dif ) < sphereRadius ){
      particleVel -= normalize(dif) * dT * 1.0;
      vec3 mouseForce = mouseNow - mouseLast;
      particleVel += mouseForce * dT * 2.0;
    }
  }

  void collisionStaticBox (inout vec4 particlePos, inout vec3 particleVel, vec3 colliderBoxPosition, vec3 boxSize) {
    vec3 p = (colliderBoxPosition) - particlePos.xyz;

    if(sdBox(p, boxSize) < 0.0){
      float EPSILON_A = 0.05;

      vec3 boxNormal = normalize(vec3(
        sdBox(vec3(p.x + EPSILON_A, p.y, p.z),  boxSize) - sdBox(vec3(p.x - EPSILON_A, p.y, p.z), boxSize),
        sdBox(vec3(p.x, p.y + EPSILON_A, p.z),  boxSize) - sdBox(vec3(p.x, p.y - EPSILON_A, p.z), boxSize),
        sdBox(vec3(p.x, p.y, p.z  + EPSILON_A), boxSize) - sdBox(vec3(p.x, p.y, p.z - EPSILON_A), boxSize)
      ));

      particleVel -= boxNormal * dT * 1.0;
    }
  }

  void handleCollision (inout vec4 pos, inout vec3 vel) {
    ${collisionCode}
  }

  ${ballify}

  void main(void) {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 pos = texture2D(nowPosTex, uv);
    vec4 oPos = texture2D(lastPosTex, uv);

    float life = pos.w;

    vec3 vel = pos.xyz - oPos.xyz;

    life -= .01 * ( rand( uv ) + 0.1 );

    if( life >= 1. ){
      vel = vec3( 0. );
      pos.xyz = vec3(
        -0.5 + rand(uv + 0.1),
        -0.5 + rand(uv + 0.2),
        -0.5 + rand(uv + 0.3)
      );
      pos.xyz = ballify(pos.xyz, 1.5);
      pos.y += 5.0;
      life = 0.99;
    }

    float bottomLimit = -7.0 + rand(uv + 0.1);

    if( life <= 0. || pos.y <= bottomLimit ){
      vel = vec3( 0. );
      pos.xyz = vec3(
        -0.5 + rand(uv + 0.1),
        -0.5 + rand(uv + 0.2),
        -0.5 + rand(uv + 0.3)
      );
      pos.xyz = ballify(pos.xyz, 1.5);
      pos.y += 5.0;
      life = 1.1;
    }

    // gravity
    vel += vec3( 0.0 , -.003 , 0. );

    // wind
    vel += vec3( 0.001 * life, 0.0, 0.0 );

    handleCollision(pos, vel);

    vel *= .96; // dampening

    vec3 p = pos.xyz + vel;
    gl_FragColor = vec4(p , life);

  }

  `;

  let camera = await mini.ready.camera;

  camera.position.z = 15;
  console.log(camera);

  let cursor = new Vector3(0, 0, 0);

  let plane = new PlaneBufferGeometry(2000, 2000, 2, 2);
  let raycastPlane = new Mesh(plane);
  let rc = new Raycaster();
  mini.ready.mouse.then((m) => {
    mini.onLoop(() => {
      rc.setFromCamera(m, camera);
      let res = rc.intersectObject(raycastPlane);
      if (res && res[0]) {
        let first = res[0];
        cursor.copy(first.point);
      }
    });
  });

  let sim = new LocationSimulation({
    mini,
    width: 1,
    height: 200, //count
    shaderCode: shaderCode,
    sceneObjects: sceneObjects,
    renderer: await mini.ready.gl,
    mounter: await mini.ready.mounter,
    cursor: cursor,
    viewport: await mini.ready.viewport,
  });

  let howManyLines = sim.width * sim.height;

  let dotSim = new DotToLine({
    mini,
    renderer: await mini.ready.gl,
    dotSim: sim,
    count: howManyLines,
    tailSize: howManyLines,
  });

  let comet = new RainyComet({
    sim: dotSim,
    mini: mini,
  });

  mini.ready.mounter.then((m) => {
    m.add(comet.o3d);
    mini.onClean(() => {
      m.remove(comet.o3d);
    });
  });
}
