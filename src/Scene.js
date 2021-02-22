import "three";
import "three/OrbitControls";

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
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x202533, -1, 100);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    this.clock = new THREE.Clock();

    this.speedX = 0.1;

    // Set options of our scene
    this.setCamera();
    this.setLights();
    this.setRender();

    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.minDistance = 10;
    this.controls.maxDistance = 500;

    this.addObjects();

    this.camera.position.y = 5;
    this.camera.position.x = -5;
    this.camera.rotation.x = (30 * Math.PI) / 180;
    this.camera.lookAt(this.cube);

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
    const currentKey = KeyBoardState.currentKey();
    this.camera.lookAt(this.cube.position);
    this.camera.position.x = this.cube.position.x - 5;
    this.camera.position.y = this.cube.position.y + 5;
    if (currentKey != null) {
      switch (currentKey) {
        case "w":
          this.cube.position.z -= this.speedX;
          break;
        case "a":
          this.cube.position.x -= this.speedX;
          break;
        case "s":
          this.cube.position.z += this.speedX;
          break;
        case "d":
          this.cube.position.x += this.speedX;
          break;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      50
    );
  }

  setRender() {
    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  addObjects() {
    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );

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

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide })
    );

    plane.rotation.x = (90 * Math.PI) / 180;

    this.scene.add(plane);
  }

  updateControls() {}

  setLights() {
    const light = new THREE.PointLight(0xfff000, 10, 1000);
    light.position.set(50, 20, 10);
    this.scene.add(light);
  }
}
