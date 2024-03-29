import * as THREE from "three";

import MathHelpers from '@/components/MathHelpers.js';

class PlyObject {

  constructor(ctx) {
    this.ctx = ctx;

    this.id = "";
    this.type = "";
    this.vertices = [];
    this.faces = [];
    this.res = 0.0;

    this.trs = null;
    this.color = null;
    this.colors = null;

    this.geometry = null;
    this.material = null;
    this.mesh = null;
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["id", "type", "vertices", "faces"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data["id"];
    this.type = data["type"];
    this.vertices = data["vertices"].flat();
    this.faces = data["faces"].flat();

    if ("trs" in data) {
      this.trs = data["trs"];
    }

    if ("color" in data) {
      let c = data["color"];
      if (c.length != 3)
        throw Error("'color' field must have size=3");
      this.color = new THREE.Color(c[0], c[1], c[2]);
    } else if ("colors" in data) {
      this.colors = data["colors"].flat();
    }
    this.has_vertex_colors = this.colors ? true : false;
  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {
    const color = this.color;
    this.geometry = new THREE.BufferGeometry();

    this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
    if (this.has_vertex_colors)
      this.geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( this.colors, 3 ) );
    this.geometry.setIndex( this.faces );
    this.geometry.computeVertexNormals();

    this.material = new THREE.MeshStandardMaterial(
      { color: color, side: THREE.DoubleSide, vertexColors: this.has_vertex_colors }
    );

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.mesh.raw = this;
    this.mesh.name = this.id;

    let mat = MathHelpers.compose_mat4(this.trs);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.matrix.copy(mat);
    this.mesh.updateMatrixWorld(true);
  }

}

export default PlyObject;
