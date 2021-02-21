import {
  BoxBufferGeometry,
  Mesh,
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

    // this.renderer.setAnimationLoop(() => {
    //   this.draw();
    // });

    console.log("hallo");
  }

  draw() {}
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
  addObjects() {}
  setLights() {}
}
