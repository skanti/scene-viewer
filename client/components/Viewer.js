import axios from 'axios';
import path from 'path';
//import { mapState } from 'vuex'
import * as THREE from "three";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { copyToClipboard } from 'quasar'

import Renderer from '@/components/Renderer.js';
import Context from '@/components/Context.js';

import ThreeHelper from '@/components/ThreeHelper.js';
import { onMounted, onUpdated, onUnmounted } from 'vue'

let renderers = [];

export default {
  data() {
    return {
      options_experiments: [ ],
      model_experiment: "",
      ctx: new Context(),
      loading: false,
      is_active: false,
      mesh_bbox: null,
      toolbox: null,
      settings: { camera_up: 'z' },
    }
  },

  setup(props) {
    console.log("props");
  },

  mounted() {
    const div_scene0 = document.getElementById("div_scene0");
    const div_scene1 = document.getElementById("div_scene1");

    // load data
    axios.get("/api/experiments").then(res => {
      this.options_experiments = res.data;
    });

    // init renderer
    this.divs = [div_scene0, div_scene1];
    this.camera = new THREE.PerspectiveCamera( 70, 1.3, 0.1, 500 );
    this.divs.forEach((div, idx) => {
      let renderer = new Renderer(this.ctx, this.camera, div, "renderer" + idx);
      renderer.camera.position.set(5,5,2);
      renderer.controls.target.set(0,0,0);
      renderer.controls.update();
      renderers.push(renderer);
    })

    // set single event listeners
    //this.ctx.event_bus.$on("onclick_mouse_renderer", this.onclick_mouse.bind(this));
    //this.ctx.event_bus.$on("selected", this.onclick_selected.bind(this));

    // trigger
    this.add_ground_plane_to_scene();

    this.is_active = true;

    //this.onclick_up_axis(this.settings.camera_up);

    // run animation loop
    this.advance_ref = this.advance.bind(this);
    this.advance();

    setTimeout(() => {
      this.loading = false;
    }, 2000);

  },

  methods: {
    onclick_screenshot() {
      let img = new Image();
      img.src = this.renderer.renderer.domElement.toDataURL();
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

    add_ground_plane_to_scene() {
      let width = 100.0;

      let helper = new THREE.GridHelper( width, 100 );
      if (this.settings.camera_up == 'y')
        helper.rotateX(-Math.PI/2);
      helper.name = "GridHelper";
      helper.position.z = 0.001;
      helper.material.opacity = 0.25;
      helper.material.transparent = true;
      renderers.forEach(renderer => renderer.scene.add( helper.clone() ));
    },

    parse_json_and_add_to_scene(id, buffer) {
      let data = new TextDecoder().decode(buffer);
      this.on_ws_upsert(data);
    },

    on_ws_upsert(data) {
      this.toolbox = "";
      data = JSON.parse(data);
      try {
        let meshes = ThreeHelper.make_mesh_from_type(this.ctx, data);
        if (!Array.isArray(meshes))
          meshes = [meshes];

        meshes.forEach(mesh => this.renderer.upsert_mesh(mesh));
        this.ctx.event_bus.$emit("new_object");
      } catch (err){
        console.log(err);
      }
    },

    on_grab_data(filename, data) {
      let suffix = filename.split('.').pop();
      let id = path.basename(path.dirname(filename)) + path.basename(filename);
      const ply_types = new Set(["ply" ]);
      const obj_types = new Set(["obj"]);
      const vox_types = new Set(["vox", "svox", "svoxrgb"]);
      //const pkl_types = new Set(["pickle", "pkl"]);
      const json_types = new Set(["json"]);

      const accepted_types = new Set([...ply_types, ...obj_types, ...vox_types, ...json_types]);
      if (!accepted_types.has(suffix)) {
        throw "Warning: Received data has unknown suffix: " + suffix;
      }

      if (ply_types.has(suffix))
        this.parse_ply_and_add_to_scene(id, data);
      else if (obj_types.has(suffix))
        this.parse_obj_and_add_to_scene(id, data);
      else if (json_types.has(suffix))
        this.parse_json_and_add_to_scene(id, data);

      this.ctx.event_bus.$emit("new_object");
    },

    onclick_grab() {
      this.loading = true;
      const path_data = process.env.VUE_APP_URL_SERVER + "/data/" + this.search_text;
      axios.get(path_data, { responseType: 'arraybuffer' }).then(res => {
        this.on_grab_data(this.search_text, res.data);
      }).catch(err => {
        console.log(err);
        this.$q.notify({ message: err.message, caption: "Error", color: "red-5" })
      }).finally( () => {
        this.loading = false;
      });
    },

    advance() {
      requestAnimationFrame(this.advance_ref);
      if (!this.is_active)
        return;
      //this.raycast();
      renderers.forEach(renderer => renderer.advance());
    }
  }
}

