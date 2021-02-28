import "three";
import "three/OrbitControls";

import CANNON, { Quaternion } from "cannon";
import KeyBoardState from "./KeyboardState";
import CannonDebugRenderer from "./cannonDebugRenderer.js";

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

    this.prevTurningPoint = new CANNON.Vec3(0, 0, 0);
    this.cannonDebugRenderer = new THREE.CannonDebugRenderer(
      this.scene,
      this.world
    );

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

  drawLineBetween(pointA, pointB) {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    const points = [];
    points.push(new THREE.Vector3(pointA.x, 1, pointA.z));
    points.push(new THREE.Vector3(pointB.x, 1, pointB.z));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    console.log(geometry);
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
  }

  updateCurrentLine() {
    this.currentLine.frustumCulled = false;

    const positions = this.currentLine.geometry.attributes.position.array;
    positions[0] = this.prevTurningPoint.x;
    positions[1] = 1;
    positions[2] = this.prevTurningPoint.z;
    positions[3] = this.player.body.position.x;
    positions[4] = 1;
    positions[5] = this.player.body.position.z;
    this.currentLine.frustumCulled = false;
    this.currentLine.geometry.attributes.position.needsUpdate = true;
    this.currentLine.geometry.computeBoundingBox();
    this.currentLine.geometry.computeBoundingSphere();
    console.log(this.currentLine);
    this.currentLine.frustumCulled = false;
  }

  draw() {
    // this.camera.lookAt(this.player.body.position)
    this.localForward = new CANNON.Vec3(0, 0, -1);
    this.localRight = new CANNON.Vec3(1, 0, 0);
    this.worldForward = new CANNON.Vec3();
    this.player.body.vectorToWorldFrame(this.localForward, this.worldForward);
    this.worldForward.y = 0;
    this.worldForward = this.worldForward.scale(0.08);
    this.cannonDebugRenderer.update();
    this.player.body.position.vadd(
      this.worldForward,
      this.player.body.position
    );

    console.log(this.currentLine.frustumCulled);

    this.updateCurrentLine();

    const currentKey = KeyBoardState.currentKey();

    this.camera.lookAt(this.player.position);

    if (this.actionHappened == false && currentKey != null) {
      var rotZ = new CANNON.Quaternion(0, 0, 0, 1);

      switch (currentKey) {
        case "a":
          rotZ.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
          break;
        case "d":
          rotZ.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI / 2);
          break;
      }

      this.actionHappened = true;

      this.player.body.quaternion = this.player.body.quaternion.mult(rotZ);
      this.drawLineBetween(this.prevTurningPoint, this.player.body.position);

      const { x, y, z } = this.player.body.position;
      this.prevTurningPoint = new CANNON.Vec3(x, y, z);
      setTimeout(() => {
        this.actionHappened = false;
      }, 500);
    }

    this.renderer.render(this.scene, this.camera);
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.set(0, 4, 5);
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

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // const positions = new Float32Array(2 * 3);
    // geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    this.currentLine = new THREE.Line(geometry, material);

    player.position.set(x, y, z);

    const group = new THREE.Group();

    group.add(player);

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
    this.scene.add(this.currentLine);

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
