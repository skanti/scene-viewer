import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

class Renderer {
  constructor(ctx, settings, camera, div_root, tag) {
    // -> variable definition
    this.ctx = ctx;
    this.settings = settings;
    this.tag = tag;
    this.root_container = div_root;

    this.is_initialized = false;
    this.win = {width : 0, height : 0 };
    this.camera = camera;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.controls = null;
    this.mouse = { pos: new THREE.Vector2(), is_drag: false };
    this.stats_fps = new Stats();
    // <-

    // -> scene renderer
    this.setup_scene_renderer();
    this.setup_controls();
    // <-
    this.is_initialized = true;
  }

  setup_scene_renderer() {
    this.win.width = this.root_container.clientWidth;
    this.win.height = this.root_container.clientHeight;
    this.win.aspect_ratio = this.win.width/this.win.height;

    this.add_helpers();

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(this.win.width, this.win.height);
    this.root_container.appendChild( this.renderer.domElement );

    document.addEventListener( 'keydown', this.onkeydown.bind(this) );
    //this.root_container.addEventListener( 'pointermove', this.onmove_mouse.bind(this) );
    //this.root_container.addEventListener( 'pointerdown', this.ondown_mouse.bind(this) );
    //this.root_container.addEventListener( 'pointerup', this.onup_mouse.bind(this) );
    //this.root_container.addEventListener( 'pointermove', e => this.ctx.event_bus.emit('pointermove', e) );
    //this.ctx.event_bus.on('pointermove', this.onmove_mouse.bind(this));

    this.stats_fps.domElement.style.cssText = 'position:relative;top:0px;left:0px;';
    this.root_container.appendChild( this.stats_fps.dom );
    // <-
  }

  onkeydown(event) {
    switch (event.keyCode) {
      case 37:
        this.recenter(-1.0, 0, 0);
        break;
      case 38:
        this.recenter(0, 1.0, 0);
        break;
      case 39:
        this.recenter(1.0, 0, 0);
        break;
      case 40:
        this.recenter(0, -1.0, 0);
        break;
    }
  }

  onmove_mouse(event) {
    this.update_mouse(event);
    this.mouse.is_drag = true;
    //this.controls.update();
    //this.ctx.event_bus.emit("onmove_mouse_" + this.tag, event);
  }

  update_mouse(event) {
    const rect = this.root_container.getBoundingClientRect();
    this.mouse.pos.x = ( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
    this.mouse.pos.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
  }


  ondown_mouse() {
    this.mouse.is_drag = false;
  }

  onup_mouse(event) {
    if (!this.mouse.is_drag) {
      //this.ctx.event_bus.emit("onclick_mouse_" + this.tag, event);
    }
  }

  set_view_from_camera(cam, contr) {
    //this.camera.up.set(cam.up);
    this.camera.position.copy(cam.position);
    this.camera.rotation.copy(cam.rotation);
    this.camera.up.copy(cam.up);
    this.controls.target.copy(contr.target);
    this.controls.update();
  }

  setup_controls() {

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = false;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI;
    /*
    this.controls = new TrackballControls( this.camera, this.renderer.domElement );
    this.controls.rotateSpeed = 2.0;
    this.controls.zoomSpeed = 0.5;
    this.controls.panSpeed = 0.5;
    */

  }

  advance() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.stats_fps.update();
  }

  upsert_mesh(mesh) {
    let name = mesh.name;
    if (name !== 0 && !name)
      throw Error("Mesh does not have a name or name is 0", mesh);

    let mesh_old = this.scene.getObjectByName(name, true );
    if (mesh_old) {
      this.scene.remove(mesh_old);
    }

    this.scene.add(mesh);
  }

  add_helpers() {
    this.add_axes();
    this.add_ground_plane_to_scene();
    this.add_light();
  }

  clear_scene() {
    let scene = this.scene;
    while(scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    this.add_helpers();
  }

  add_axes() {
    let axes_helper = new THREE.AxesHelper( 5 );
    axes_helper.name = "AxesHelper";
    this.scene.add(axes_helper);
  }

  add_ground_plane_to_scene() {
    let width = 100.0;

    let helper = new THREE.GridHelper( width, 100 );
    if (this.settings.camera_up == 'y')
      helper.rotation.set(0, 0, 0);
    else if (this.settings.camera_up == 'z')
      helper.rotation.set(-Math.PI/2, 0, 0);
    helper.name = 'GridHelper';
    helper.position.z = 0.001;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    this.scene.add( helper );
  }

  add_light() {
    let lights = new THREE.Group();
    lights.add( new THREE.AmbientLight( 0x555555 ) );
    lights.add( new THREE.DirectionalLight( 0xffffff, 0.5 ) );
    lights.position.set(0.1,0.1,1);
    lights.name = "Light";
    this.scene.add( lights );
    this.scene.background = new THREE.Color("rgb(240, 230, 230)");
  }

  recenter(x, y, z) {
    let scene = this.scene;
    let exception = new Set([ "GridHelper", "Light", "AxesHelper" ]);

    let delta = new THREE.Vector3(x, y, z);

    for(let child of scene.children) {
      if (exception.has(child.name))
        continue
      let p = child.position.add(delta);
      child.position.add(delta);
    }
  }

}

export default Renderer;
