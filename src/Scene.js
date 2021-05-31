import "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import "three/OrbitControls"

export default class RyderScene {
  constructor() {
    this.objects = [];
  }

  setup() {
    this.scene = new THREE.Scene();
    this.turningPoints = []

    this.turningPoints.push(new THREE.Vector3(0,0,0))

    console.log(this.scene)
    const gridHelper = new THREE.GridHelper( 20, 10 );
    this.scene.add( gridHelper );

    this.setCamera()
    this.initRenderer()
    this.setLights()
    this.addObjects()

    console.log(this.scene)

    window.addEventListener("keydown", (e) => {
      this.movePlayer(e, this)
    });

    new THREE.OrbitControls( this.camera, this.renderer.domElement );

    const loader = new GLTFLoader()
    const vm = this;
    loader.load('models/bike/scene.gltf', function(gltf, scene){
      vm.player = gltf.scene;
      vm.player.scale.set(0.002,0.002,0.002);
      vm.player.forward = new THREE.Vector3(0,0,-1)
      vm.player.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI)
      vm.player.shouldRemove = false;
      vm.scene.add( vm.player );
    });

    this.renderer.setAnimationLoop(() => {
      this.draw();
    });
  }

  restart(){
    console.log("restarting")
    this.turningPoints = [];
    this.turningPoints.push(new THREE.Vector3(0,0,0))

    this.scene.remove(this.line)

    this.scene.children.forEach(child => {
      if(child.shouldRemove !== false){
        this.scene.remove(child)
      }
    })

    this.player.position.x = 0
    this.player.position.z = 0
    this.player.forward = new THREE.Vector3(0,0,-1)
    this.player.lookAt(this.player.forward)


    this.setCamera()
    this.setLights();
    this.addObjects();

    console.log("scene",this.scene.clone())

    const gridHelper = new THREE.GridHelper( 20, 10 );
    this.scene.add( gridHelper );

    new THREE.OrbitControls( this.camera, this.renderer.domElement );

    this.renderer.setAnimationLoop(() => {
      this.draw();
    });
  }

  checkCollision(player, pointa, pointb){
    if(!pointb) return false;
    return (pointa.distanceTo(player) + pointb.distanceTo(player) == pointa.distanceTo(pointb))
  }

  movePlayer(e, scene) {
    if (event.keyCode == '37') {
        scene.turningPoints.push(scene.player.position.clone());
        scene.player.forward.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI / 2 )
        scene.player.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI / 2)
    } else if (e.keyCode == '39') {
        scene.turningPoints.push(scene.player.position.clone());
        scene.player.forward.applyAxisAngle(new THREE.Vector3(0,1,0), 270 * Math.PI/180 )
        scene.player.rotateOnAxis(new THREE.Vector3(0,1,0), 270* Math.PI / 180)
    }
}

  draw() {
    if(this.player){
      this.renderer.render(this.scene, this.camera)
      this.player.position.add(this.player.forward.clone().clampLength(0,0.1))
      
      const withRecentLine = [...this.turningPoints, this.player.position]
      this.line.geometry.setFromPoints(withRecentLine)
  
      this.camera.lookAt(this.player.position)
  
        if(this.turningPoints.some((c,i) => this.checkCollision(this.player.position, c, this.turningPoints[i + 1]))){
          //restart game
          this.restart()
        }
    }
  }

  addObjects(){
    const line = new THREE.Line( new THREE.BufferGeometry(), new THREE.LineBasicMaterial({
      color: 0x0000ff
    }));
    this.scene.add( line );
    this.line = line;
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.set(0, 10, 5);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer(THREE.CullFaceNone);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setLights() {
    this.light = new THREE.SpotLight(0xffffff);
    this.light.position.set(10, 30, 20);
    this.light.target.position.set(0, 0, 0);
    this.scene.add(this.light);
  }
}
