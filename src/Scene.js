import "three";
import "three/OrbitControls";

import CANNON, { Quaternion } from "cannon";
import KeyBoardState from "./KeyboardState";

const debounce = (func, wait, immediate) => {
  var timeout;
  console.log("starting debounce");
  return function () {
    console.log("in function");
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    console.log(callNow);
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export default class RyderScene {
  constructor() {
    this.objects = [];
  }

  setup() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -20, 0);

    console.log(KeyBoardState());
    this.KeyBoardState = KeyBoardState;

    // Set Three components
    this.scene = new THREE.Scene();

    var gridHelper = new THREE.GridHelper(100, 100);
    this.scene.add(gridHelper);

    this.scene.fog = new THREE.Fog(0x202533, -1, 100);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    this.clock = new THREE.Clock();
    this.clock.start();
    this.actionHappened = false;

    this.speedX = 0.1;

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
    this.syncObjects();
    this.world.step(1 / 60);
  }

  draw() {
    const points = [];
    points.push(new THREE.Vector3(0, 0, 1));
    points.push(new THREE.Vector3(this.player.position.z * -1), 0, 0);
    points.push(new THREE.Vector3(0, 0, 1));

    // this.camera.lookAt(this.player.body.position)

    this.localForward = new CANNON.Vec3(0, 0, -1); // correct?
    this.localRight = new CANNON.Vec3(1, 0, 0); // correct?
    this.worldForward = new CANNON.Vec3();
    this.player.body.vectorToWorldFrame(this.localForward, this.worldForward);
    this.worldForward.y = 0;
    this.worldForward = this.worldForward.scale(0.08);

    this.player.body.position.vadd(
      this.worldForward,
      this.player.body.position
    );

    // const g = new THREE.BufferGeometry().setFromPoints(points);
    // this.player.children[1].geometry = g;

    const currentKey = KeyBoardState.currentKey();

    this.camera.lookAt(this.player.position);

    if (this.actionHappened == false && currentKey != null) {
      console.log(this.actionHappened);
      const vm = this;

      switch (currentKey) {
        case "w":
          break;
        case "a":
          this.actionHappened = true;
          var rotZ = new CANNON.Quaternion(0, 0, 0, 1);
          rotZ.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
          vm.player.body.quaternion = vm.player.body.quaternion.mult(rotZ);
          setTimeout(() => {
            this.actionHappened = false;
            console.log("setting false");
          }, 500);
          break;
        case "s":
          this.player.body.quaternion.setFromVectors(
            this.worldForward,
            new CANNON.Vec3(0, 0, 1)
          );
          break;
        case "d":
          this.actionHappened = true;
          var rotZ = new CANNON.Quaternion(0, 0, 0, 1);
          rotZ.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI / 2);
          vm.player.body.quaternion = vm.player.body.quaternion.mult(rotZ);
          setTimeout(() => {
            this.actionHappened = false;
            console.log("setting false");
          }, 500);
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
    this.camera.position.set(0, 1, 5);
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
    group.add(this.camera);

    group.body.addEventListener("collide", function (e) {
      fn(e);
    });

    this.objects.push(group);

    this.world.addBody(group.body);

    return group;
  }

  addObjects() {
    //set plane

    this.player = this.addPlayer(0, 0.5, 0, () => {
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
    this.light = new THREE.SpotLight(0xffffff);
    this.light.position.set(10, 30, 20);
    this.light.target.position.set(0, 0, 0);
    this.scene.add(this.light);
  }
}
