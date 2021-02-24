import "three";
import "three/OrbitControls";

import CANNON from "cannon";
import KeyBoardState from "./KeyboardState";

export default class RyderScene {
  constructor() {
    this.objects = [];
  }

  setup() {
    this.world = new CANNON.World();

    console.log(KeyBoardState());
    this.KeyBoardState = KeyBoardState;

    // Set Three components
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x202533, -1, 100);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    this.clock = new THREE.Clock();
    this.clock.start();

    this.speedX = 0.1;

    // Set options of our scene
    this.setCamera();
    this.setLights();
    this.setRender();

    this.addObjects();

    this.camera.position.y = 5;
    this.camera.position.x = -5;
    this.camera.rotation.x = (30 * Math.PI) / 180;
    this.camera.lookAt(this.player);

    const controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    controls.update();

    this.renderer.setClearColor(0xffffff, 0);

    this.renderer.setAnimationLoop(() => {
      this.updatePhysics();
      this.draw();
    });
  }

  updatePhysics() {
    this.syncObjects();
    this.world.step(1 / 60);
  }

  draw() {
    const currentKey = KeyBoardState.currentKey();
    // this.camera.position.x = this.cube.position.x - 0;
    // this.camera.position.z = this.cube.position.z + 5;
    // this.camera.position.y = this.cube.position.y + 5;
    if (currentKey != null) {
      switch (currentKey) {
        case "w":
          this.player.body.position.z -= this.speedX;
          break;
        case "a":
          this.player.body.position.x -= this.speedX;
          break;
        case "s":
          this.player.body.position.z += this.speedX;
          break;
        case "d":
          this.player.body.position.x += this.speedX;
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

  syncObjects() {
    for (const obj of this.objects) {
      obj.position.copy(obj.body.position);
      obj.quaternion.copy(obj.body.quaternion);
    }
  }

  addPlayer(x, y, z, fn) {
    const player = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );

    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    const points = [];
    points.push(new THREE.Vector3(1, 0, 0));
    points.push(new THREE.Vector3(1, 0, 3));
    points.push(new THREE.Vector3(1, 0, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);

    player.position.set(x, y, z);
    line.position.set(x - 1, y, z);

    const group = new THREE.Group();

    group.add(player);
    group.add(line);

    group.body = new CANNON.Body({ mass: 0 });
    group.body.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)));
    group.body.position.x = group.position.x;
    group.body.position.y = group.position.y;
    group.body.position.z = group.position.z;

    group.body.addEventListener("collide", function (e) {
      fn(e);
    });

    this.objects.push(group);

    this.world.addBody(group.body);

    return group;
  }

  addObjects() {
    //set plane

    this.player = this.addPlayer(0, 3, 0, () => {
      console.log("collide!");
    });

    this.scene.add(this.player);

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
