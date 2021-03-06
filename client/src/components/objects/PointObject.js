import * as THREE from "three";

import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import MathHelpers from '@/components/MathHelpers.js';

class PointObject {
  constructor(ctx) {
    this.ctx = null;
    this.renderer = null;

    this.id = "";
    this.type = "";
    this.positions = [];
    this.res = 0.0;

    this.trs = null;
    this.color = null;
    this.colors = null;
    this.badge = "";

    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.transparent = false;
    this.visible = true;

    this.ctx = ctx;
    //this.ctx.event_bus.$on("pca", this.on_change_parameters.bind(this));
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["id", "type", "positions", "res"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data["id"];
    this.type = data["type"];
    this.positions = data["positions"];
    this.res = data["res"];

    if ("trs" in data) {
      this.trs = data["trs"];
    }

    if ("color" in data) {
      let c = data["color"];
      if (c.length != 3)
        throw Error("'color' field must have size=3");
      this.color = new THREE.Color(c[0], c[1], c[2]);
    } else if ("colors" in data) {
      this.colors = data["colors"];
    }

    if ("transparent" in data) {
      this.transparent = data["transparent"];
    }
    if ("visible" in data) {
      this.visible = data["visible"];
    }
  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {
    const res = this.res;
    const color = this.color;
    const transparent = this.color;
    this.geometry = new THREE.BoxBufferGeometry(res, res, res);
    this.material = new THREE.MeshLambertMaterial( { color: color, opacity: 0.3, transparent: this.transparent,
      side: THREE.DoubleSide });

    const positions = this.positions;
    const colors = this.colors;
    const n_positions = positions.length;

    let mat = MathHelpers.compose_mat4(this.trs);

    this.mesh = new THREE.InstancedMesh( this.geometry, this.material, n_positions );
    for (let i = 0; i < n_positions; i++) {
      let t = new THREE.Vector4(positions[i][0], positions[i][1], positions[i][2], 1);
      t = t.applyMatrix4(mat);

      let trs = (new THREE.Matrix4()).makeTranslation(t.x, t.y, t.z);
      this.mesh.setMatrixAt(i, trs);
      if (colors) {
        const c = new THREE.Color(colors[i][0], colors[i][1], colors[i][2]);
        this.mesh.setColorAt(i, c);
      }
    }

    // visibility
    this.mesh.visible = this.visible;
    this.mesh.raw = this;
    this.mesh.name = this.id;

    let t = new THREE.Vector3();
    let q = new THREE.Quaternion();
    let s = new THREE.Vector3();
    mat.decompose(t,q,s);

    const badge = this.badge;
    if (badge) {
      let badge_div = document.createElement("div_label_" + this.id);
      badge_div.className = "q-badge text-bold";
      badge_div.style.fontSize = "16px";
      badge_div.textContent = badge;
      let css_obj = new CSS2DObject( badge_div );
      css_obj.position.set( t.x, t.y, t.z );
      this.mesh.add(css_obj);
    }

  }

}

export default PointObject;
