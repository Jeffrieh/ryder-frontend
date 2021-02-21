import {
  BoxBufferGeometry,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene as Scene,
  Fog,
  Clock,
  WebGLRenderer,
} from "three";

import C from "cannon";

export default class RyderScene {
  constructor() {
    this.scene = null;
    this.clock = null;
    this.renderer = null;
    this.camera = null;
    this.cube = null;
  }

  setup() {
    // Set Three components
    this.scene = new Scene();
    this.scene.fog = new Fog(0x202533, -1, 100);

    this.clock = new Clock();

    // Set options of our scene
    this.setCamera();
    this.setLights();
    this.setRender();

    this.addObjects();

    this.renderer.setAnimationLoop(() => {
      this.draw();
    });
  }

  draw() {
    this.renderer.render(this.scene, this.camera);
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
  }

  setCamera() {
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
  }

  setRender() {
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  addObjects() {
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new Mesh(geometry, material);
    this.scene.add(this.cube);
    this.camera.position.z = 5;
  }

  setLights() {}
}
