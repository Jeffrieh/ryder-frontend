import "three";
import geckos from "@geckos.io/client";
import {
  SnapshotInterpolation,
  Vault,
} from "@geckos.io/snapshot-interpolation";
import Player from "./Player";
import { BoxGeometry, Vector3 } from "three";
const SI = new SnapshotInterpolation();

let loadingPlayer = false;

export default class RyderScene {
  constructor() {
    this.objects = [];
  }

  async loadPlayer(id, scene) {
    console.log("loading player.,.,");
    const p = await Player.load()

    //wait for the player to finish loading..
    // await p.load();
    scene.add(p);  
    scene.add(p.line);

    //add to the map of players..
    this.players.set(id, p);

    return p;
  }

  setup() {
    this.channel = geckos({});
    console.log(this.channel.url);
    // this.channel = geckos({});
    this.playerVault = new Vault();
    this.players = new Map();
    // this.clock = new THREE.Clock();

    this.channel.onConnect(async (error) => {
      //load and add the player.
      const p = await this.loadPlayer(this.channel.id, this.scene);
      this.player = p;
      this.player.attach(this.camera);

      if (error) {
        console.error(error.message);
        return;
      }

      this.channel.on("removePlayer", id => {
        // read the snapshot
        // console.log("update from server!", snapshot);
        if(this.players.has(id)){
          // this.players.delete(id);
          const player = this.players.get(id);
          this.scene.remove(player.line)
          this.scene.remove(player);
          console.log("removeing", id);
        }
      });

      this.channel.on("update", (snapshot) => {
        // read the snapshot
        // console.log("update from server!", snapshot);
        SI.snapshot.add(snapshot);
      });

      const vm = this;
      window.onbeforeunload = function () {
        // Do something
        vm.channel.emit("refresh-close", 0, { reliable: true });
      };
    });

    this.scene = new THREE.Scene();

    this.addObjects();
    this.setCamera();
    this.initRenderer();
    this.setLights();

    window.addEventListener("keydown", (e) => {
      this.movePlayer(e, this);
    });

    this.renderer.setAnimationLoop(() => {
      this.draw();
    });
  }

  serverConciliation() {
    const player = this.players.get(this.channel.id);

    if (player) {
      const serverSnapshot = SI.vault.get();
      const playerSnapshot = this.playerVault.get(serverSnapshot.time, true);

      if (serverSnapshot && playerSnapshot) {
        // get the current player position on the server
        const serverState = serverSnapshot.state.filter(
          (s) => s.id === this.channel.id
        )[0];

        this.turningPoints = serverState.points.map(
          (x) => new THREE.Vector3(x.x, x.y, x.z)
        );

        // calculate the offset between server and client
        const offsetX = playerSnapshot.state[0].position.x - serverState.x;
        const offsetZ = playerSnapshot.state[0].position.z - serverState.z;

        //TODO: tweak this number ?
        const correction = 100;

        // apply a step by step correction of the player's position
        this.player.position.x -= offsetX / 100;
        this.player.position.z -= offsetZ / 100;
      }
    }
  }

  movePlayer(e, scene) {
    if (event.keyCode == "37") {
      this.channel.emit("move", { direction: "left" });
    } else if (e.keyCode == "39") {
      this.channel.emit("move", { direction: "right" });
    }
  }

  clientPrediction() {
    this.player.position.add(this.player.forward.clone().clampLength(0, 0.05));
    this.playerVault.add(
      SI.snapshot.create([
        {
          id: this.channel.id,
          position: this.player.position,
          x: this.player.position.x,
          z: this.player.position.z,
          forward: this.player.forward,
        },
      ])
    );
  }

  draw() {
    if (this.player) {
      this.renderer.render(this.scene, this.camera);
      //client prediction
      // this.clientPrediction();

      //reconcile with server
      // this.serverConciliation();

      // const withRecentLine = [...this.turningPoints, this.player.position];
      // this.line.geometry.setFromPoints(withRecentLine);

      const snapshot = SI.calcInterpolation("x z");

      if (snapshot) {
        const { state } = snapshot;
        state.forEach((s) => {
          //state of every player in the current arena.
          const { id, position, x, z, points, forward } = s;

          if (this.players.has(id)) {
            //TODO : predict client movement to make it smoother...
            // if (id === this.channel.id) return;

            const player = this.players.get(id);
            if(player){
              player.position.x = position.x;
              player.position.z = position.z;
              player.forward.x = forward.x;
              player.forward.z = forward.z;
              player.line.geometry.setFromPoints(points);
              player.line.geometry.computeBoundingSphere();
              player.lookAt(player.position.clone().add(player.forward));
            }
          } else {
            //a new player has joined!
            if(!loadingPlayer){
              console.log("loading new player..");
              loadingPlayer = true;
              this.loadPlayer(id, this.scene).then(() => loadingPlayer = false);
            }
          }
        });
      }

      //TODO FIX THIS :
      // this.player.lookAt(this.player.position.clone().add(this.player.forward));
      // this.camera.lookAt(this.player.position);
    }
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      50000
    );
    this.camera.position.set(0, 4, 10);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setLights() {
    this.light = new THREE.SpotLight(0xffffff);
    this.light.position.set(10, 30, 20);
    this.light.target.position.set(0, 0, 0);
    this.scene.add(this.light);
  }

  addObjects(){
    // add plane 
    const axes = "xzy";

    const size = 50;
    const wallPositions = [
      new THREE.Vector3(size, 0, 0),
      new THREE.Vector3(0, 0, size),
      new THREE.Vector3(-size, 0, 0),
      new THREE.Vector3(0, 0, -size),
    ]

    let wall;
    let i = 0;

    for(const pos of wallPositions){
      wall = new THREE.Mesh( new THREE.BoxGeometry( size * 2, size / 2, 1 ), new THREE.MeshBasicMaterial( {color: 0xfff} ) );
      this.scene.add( wall );
      wall.position.set(pos.x, pos.y, pos.z);
      if(i % 2 == 0){wall.rotateOnAxis(new Vector3(0,1,0), Math.PI / 2)}
      wall.position.y = size / 4;
      i++;
    }

    const planeAxes = axes.substr( 0, 2 );
    const geometry = new THREE.PlaneBufferGeometry( 2, 2, 1, 1 );
    const material = new THREE.ShaderMaterial( {

      side: THREE.DoubleSide,
  
      uniforms: {
        uSize1: {
          value: 1
        },
        uSize2: {
          value: 1
        },
        uColor: { 
          value: new THREE.Color("green")
        },
        uDistance: {
          value: 250
        }
      },
      transparent: true,
      vertexShader: `
             
             varying vec3 worldPosition;
         
             uniform float uDistance;
             
             void main() {
             
                  vec3 pos = position.${axes} * uDistance;
                  pos.${planeAxes} += cameraPosition.${planeAxes};
                  
                  worldPosition = pos;
                  
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
             
             }
             `,
  
  
      fragmentShader: `
             varying vec3 worldPosition;
             uniform float uSize1;
             uniform float uSize2;
             uniform vec3 uColor;
             uniform float uDistance;
              
              float getGrid(float size) {
                  vec2 r = worldPosition.${planeAxes} / size;
                  vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
                  float line = min(grid.x, grid.y);
                  return 1.0 - min(line, 1.0);
              }
              
             void main() {
                    float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
                    float g1 = getGrid(uSize1);
                    float g2 = getGrid(uSize2);
                    gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
                    gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
                    if ( gl_FragColor.a <= 0.0 ) discard;
             }
             
             `,
  
      extensions: {
        derivatives: true
      }
    } );

    // const geometry = new THREE.PlaneGeometry( 1, 1 );
    // const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    // const plane = new THREE.Mesh( geometry, material );
    // plane.frustumCulled = false;
    // this.scene.add( plane );

    const m = new THREE.Mesh(geometry, material);
    m.frustumCulled = false;
    this.scene.add(m);
  }
}
