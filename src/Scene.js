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
  AxesHelper,
  Clock,
  PointLight,
  DoubleSide,
  WebGLRenderer,
} from "three";

import CANNON from "cannon";
import KeyBoardState from "./KeyboardState";

export default class RyderScene {
  constructor() {}

  setup() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -10, 0);

    console.log(KeyBoardState());
    this.KeyBoardState = KeyBoardState;

    // Set Three components
    this.scene = new Scene();
    this.scene.fog = new Fog(0x202533, -1, 100);

    const axesHelper = new AxesHelper(5);
    this.scene.add(axesHelper);

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
    this.cube.position.set(
      this.cubeBody.position.x,
      this.cubeBody.position.y,
      this.cubeBody.position.z
    );
  }

  draw() {
    this.cube.rotation.z += 0.01;
    console.log(KeyBoardState.currentKey());
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

    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    this.cubeBody = new CANNON.Body({ mass: 1 });
    this.cubeBody.addShape(cubeShape);
    this.cubeBody.position.x = this.cube.position.x;
    this.cubeBody.position.y = this.cube.position.y;
    this.cubeBody.position.z = this.cube.position.z;
    this.world.addBody(this.cubeBody);

    //set plane

    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body({ mass: 0 });
    planeBody.addShape(planeShape);
    planeBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
    this.world.addBody(planeBody);

    const plane = new Mesh(
      new PlaneGeometry(50, 50, 1),
      new MeshBasicMaterial({ color: 0xffff00, side: DoubleSide })
    );

    plane.rotateX(90);
    this.scene.add(plane);

    this.camera.position.z = 5;
  }

  updateControls() {}

  setLights() {
    const light = new PointLight(0xfff000, 10, 1000);
    light.position.set(50, 20, 10);
    this.scene.add(light);
  }
}
