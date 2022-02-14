import * as THREE from "three";

import MathHelpers from '@/components/MathHelpers.js';

class WireframeObject {
  constructor(ctx) {
    this.ctx = null;
    this.renderer = null;

    this.id = "";
    this.type = "";
    this.vertices = [];
    this.edges = [];
    this.width = 0.1;

    this.trs = null;
    this.color = null;
    this.colors = null;

    this.geometry = null;
    this.material = null;
    this.mesh = null;

    this.ctx = ctx;
    //this.ctx.event_bus.$on("pca", this.on_change_parameters.bind(this));
  }

  extract(data) {
    // -> check if keys present
    const keys_required = ["id", "type", "vertices", "edges"];
    for (const k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data.id;
    this.type = data.type;
    this.vertices = data.vertices;
    this.edges = data.edges;

    if ("trs" in data) {
      this.trs = data.trs;
    }

    if ("color" in data) {
      let c = data.color;
      if (c.length != 3)
        throw Error("'color' field must have size=3");
      this.color = new THREE.Color(c[0], c[1], c[2]);
    } else if ("colors" in data) {
      this.colors = data.colors.flat();
    }
    this.has_vertex_colors = this.colors ? true : false;
  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  make_base(width) {
    const points = [];
    const points_num = 5;
    for (let i = 0; i < points_num*2; i++ ) {
      const l = width;
      const a = i / points_num * Math.PI;
      points.push( new THREE.Vector2( Math.cos( a ) * l, Math.sin( a ) * l ) );
    }
    const shape = new THREE.Shape(points);
    return shape;
  }

  create_mesh() {

    const group = new THREE.Group();
    const poly = this.make_base(this.width);
    for (const e of this.edges) {
      const a = this.vertices[e[0]];
      const b = this.vertices[e[1]];
      const spline = new THREE.CatmullRomCurve3( [
        new THREE.Vector3(a[0], a[1], a[2]),
        new THREE.Vector3(b[0], b[1], b[2])
      ]);
      const extrude_settings = { steps: 10, bevelEnabled: false, extrudePath: spline };
      const geo = new THREE.ExtrudeGeometry(poly, extrude_settings);
      const mat = new THREE.MeshLambertMaterial({ color: this.color });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
    }
    this.mesh = group;
    this.mesh.raw = this;
    this.mesh.name = this.id;

    let mat = MathHelpers.compose_mat4(this.trs);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.matrix.copy(mat);
    this.mesh.updateMatrixWorld(true);
  }

}

export default WireframeObject;
