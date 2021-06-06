import { Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
const loader = new GLTFLoader();

function modelLoader(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, data=> resolve(data), null, reject);
    });
  }

export default class Player extends Object3D{
   static async load(){
       let player = null;
    await modelLoader("models/bike/scene.gltf").then(gltf => {
        player = gltf.scene;
        player.scale.set(0.002, 0.002, 0.002);
        player.forward = new THREE.Vector3(0, 0, -1);
        player.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
        player.shouldRemove = false;
        player.frustumCulled = false;
    })

    const line = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({
          linewidth: 5,
          color: 0x0000ff,
        })
      );

    // line.helper = box
    player.line = line;
    return player;
   }
}
