import axios from 'axios';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { copyToClipboard } from 'quasar'
import { useQuasar } from 'quasar'

import Renderer from '@/components/Renderer.js';
import Context from '@/components/Context.js';

import ThreeHelper from '@/components/objects/ThreeHelper.js';

// global variables to not be tracked by vue
let renderers = [];
let camera = null;
let images = [];

import { mapWritableState } from 'pinia';
import useStore from '@/store/index.js';

export default {
  // data
  inject: ['some_var'],
  data() {
    return {
      options_experiments: [],
      options_outputs: [],
      ctx: new Context(),
      loading: 0,
      is_active: false,
      mesh_bbox: null,
      toolbox: null,
      full_path: '',
      img_src: { pred: null, gt: null },
    }
  },
  setup() {
    const store = useStore();
    const q$ = useQuasar();
    return { store, q$ };
  },
  computed: {
    ...mapWritableState(useStore, ['project_dir', 'experiment_selected', 'selected_id', 'settings'])
  },
  mounted() {
    console.log(this.some_var);
    // load data
    this.get_experiments();
    this.get_outputs();

    // init renderer
    const div_scene0 = document.getElementById('div_scene0');
    const div_scene1 = document.getElementById('div_scene1');
    this.divs = [div_scene0, div_scene1];
    const aspect_ratio = div_scene0.clientWidth/div_scene0.clientHeight;
    camera = new THREE.PerspectiveCamera( 70, aspect_ratio, 0.1, 500 );
    camera.position.set(2,5,5);
    camera.up.set(0,0,1);

    this.divs.forEach((div, idx) => {
      let renderer = new Renderer(this.ctx, this.settings, camera, div, 'renderer' + idx);
      renderer.controls.target.set(0,0,0);
      renderer.controls.update();
      renderers.push(renderer);
    })

    // set single event listeners
    //this.ctx.event_bus.$on('onclick_mouse_renderer', this.onclick_mouse.bind(this));
    //this.ctx.event_bus.on('new_animation', this.new_animation.bind(this));

    this.is_active = true;

    this.onclick_up_axis(this.settings.camera_up);

    // run animation loop
    this.advance_ref = this.advance.bind(this);
    this.advance();

  },

  methods: {
    get_experiments() {
      const project_dir = this.project_dir;
      if (!project_dir)
        return;
      this.loading += 1;
      axios.get( '/api/experiments', { params: { project_dir: project_dir } }).then( res => {
        this.options_experiments = res.data;
      }).finally(() => {
        this.loading -= 1;
      });
    },
    get_outputs() {
      const experiment_name = this.experiment_selected.id;
      if (!experiment_name)
        return;
      this.loading += 1;
      axios.get( '/api/outputs', { params: { experiment_name: experiment_name, project_dir: this.project_dir } }).then( res => {
        this.options_outputs = res.data;
      }).finally(() => {
        this.loading -= 1;
      });
    },
    download_output() {
      const experiment_name = this.experiment_selected.id;
      const output_name = this.selected_id;
      this.full_path = `${this.project_dir}/${experiment_name}/${output_name}`;
      renderers.forEach(renderer => renderer.clear_scene());
      this.loading += 1;
      axios.get( '/api/download', { params: { project_dir: this.project_dir, experiment_name: experiment_name,
        output_name: output_name, out: 'gt.json' } }).then( res => {
          let data = res.data
          this.on_upsert(data, 1);
        }).finally(() => {
          this.loading -= 1;
        });

      this.loading += 1;
      axios.get( '/api/download', { params: { project_dir: this.project_dir, experiment_name: experiment_name,
        out: 'pred.json', output_name: output_name } }).then( res => {
          let data = res.data
          this.on_upsert(data, 0);
        }).finally(() => {
          this.loading -= 1;
        });

      this.img_src.pred = `/api/download?project_dir=${this.project_dir}&experiment_name=${experiment_name}&output_name=${output_name}&out=pred.png`;
    },
    render_images(images) {
      images.forEach((img, i) => {
        const url = img['data'];
        const img_div = document.getElementById('img_div' + i);
        img_div.src = url;
      });
    },
    onclick_screenshot() {
      let img = new Image();
      img.src = renderer.renderer.domElement.toDataURL();
      document.body.appendChild(img);
      let r = document.createRange();
      r.setStartBefore(img);
      r.setEndAfter(img);
      r.selectNode(img);
      let sel = window.getSelection();
      sel.addRange(r);
      document.execCommand('Copy');
      document.body.removeChild(img);
    },

    play_animation() {
      this.ctx.event_bus.emit('play_animation', { delay: 200, scene: renderers[0].scene, images: images });
    },

    on_upsert(data, renderer_idx) {
      try {
        let meshes = ThreeHelper.make_mesh_from_type(this.ctx, data);
        if (!Array.isArray(meshes))
          meshes = [meshes];

        meshes.forEach(mesh => renderers[renderer_idx].upsert_mesh(mesh));
        this.ctx.event_bus.emit('new_object');
        this.q$.notify({ message: 'Loaded!', caption: ':)', color: 'green-5' })
      } catch (err){
        console.log(err);
        this.q$.notify({ message: err.message, caption: 'Error', color: 'red-5' })
      }
    },
    onclick_recenter() {
      renderers.forEach(renderer => {
        renderer.recenter();
      });

    },
    onclick_up_axis(axis) {
      this.settings.camera_up = axis;

      renderers.forEach(renderer => {
        let camera = renderer.camera;
        if (axis == 'z')
          camera.up.set(0,0,1);
        else if (axis == 'y')
          camera.up.set(0,1,0);

        renderer.controls.dispose();
        renderer.setup_controls();

        let scene = renderer.scene;
        let grid_helper = scene.getObjectByName('GridHelper', true );
        if (this.settings.camera_up == 'y')
          grid_helper.rotation.set(0, 0, 0);
        else if (this.settings.camera_up == 'z')
          grid_helper.rotation.set(-Math.PI/2, 0, 0);

        let light = scene.getObjectByName('Light', true );
        if (axis == 'z')
          light.position.set(0.1, 0.1, 1);
        else if (axis == 'y')
          light.position.set(0.1, 1.0, 0.1);
      });
    },
    click_copy_to_clipboard (e, text) {
      copyToClipboard(text).then(() => {
        this.q$.notify({ message: 'Copied to clipboard!', caption: text, icon: 'fas fa-check-circle', color: 'green-5' });
      });
      e.stopPropagation();
    },
    advance() {
      requestAnimationFrame(this.advance_ref);
      if (!this.is_active)
        return;
      //this.raycast();
      renderers.forEach(renderer => renderer.advance());
    },
  }
}

