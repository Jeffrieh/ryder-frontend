import {
  BoxBufferGeometry,
  Mesh,
  AmbientLight,
  BoxGeometry,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene as Scene,
  PlaneGeometry,
  Fog,
  Clock,
  PointLight,
  DoubleSide,
  WebGLRenderer,
} from "three";

import C from "cannon";

export default class RyderScene {
  constructor() {}

  setup() {
    this.world = new C.World();
    this.world.gravity.set(0, -50, 0);

    // Set Three components
    this.scene = new Scene();
    this.scene.fog = new Fog(0x202533, -1, 100);

    this.clock = new Clock();

    // Set options of our scene
    this.setCamera();
    this.setLights();
    this.setRender();

    this.addObjects();

    this.renderer.setClearColor(0xffffff, 0);

    this.renderer.setAnimationLoop(() => {
      this.updatePhysics();
      this.draw();
    });
  }

  updatePhysics() {
    this.world.step(1 / 60);
  }

  draw() {
    this.cube.rotation.z += 0.01;
    this.renderer.render(this.scene, this.camera);
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
    this.cube = new Mesh(
      new BoxGeometry(),
      new MeshBasicMaterial({ color: 0x00ff00 })
    );

    this.cube.rotateX(90);
    this.cube.translateZ(-2);
    this.cube.translateY(2);
    this.scene.add(this.cube);

    const plane = new Mesh(
      new PlaneGeometry(50, 50, 1),
      new MeshBasicMaterial({ color: 0xffff00, side: DoubleSide })
    );

    plane.rotateX(90);
    this.scene.add(plane);

    this.camera.position.z = 5;
  }

  setLights() {
    const light = new PointLight(0xfff000, 10, 1000);
    light.position.set(50, 20, 10);
    this.scene.add(light);
  }
}
