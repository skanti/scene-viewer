import * as THREE from "three";

import MathHelpers from '@/components/MathHelpers.js';

const vertices = [
  -0.200000 ,-0.100000 ,-0.600000,
  0.200000 ,-0.100000 ,0.000000,
  -0.200000 ,-0.100000 ,0.000000,
  0.000000 ,-0.100000 ,-1.000000,
  0.400000 ,-0.100000 ,-0.600000,
  0.200000 ,-0.100000 ,-0.600000,
  0.200000 ,0.100000 ,0.000000,
  -0.200000 ,0.100000 ,-0.600000,
  -0.200000 ,0.100000 ,0.000000,
  0.200000 ,0.100000 ,-0.600000,
  0.400000 ,0.100000 ,-0.600000,
  0.000000 ,0.100000 ,-1.000000,
  -0.200000 ,-0.100000 ,-0.600000,
  -0.400000 ,0.100000 ,-0.600000,
  -0.400000 ,-0.100000 ,-0.600000,
  0.200000 ,-0.100000 ,0.000000,
  -0.200000 ,0.100000 ,0.000000,
  -0.200000 ,-0.100000 ,0.000000,
  0.400000 ,-0.100000 ,-0.600000,
  0.200000 ,0.100000 ,-0.600000,
  0.200000 ,-0.100000 ,-0.600000,
  -0.400000 ,-0.100000 ,-0.600000,
  0.000000 ,0.100000 ,-1.000000,
  0.000000 ,-0.100000 ,-1.000000,
  0.200000 ,-0.100000 ,-0.600000,
  0.200000 ,0.100000 ,0.000000,
  0.200000 ,-0.100000 ,0.000000,
  -0.200000 ,-0.100000 ,0.000000,
  -0.200000 ,0.100000 ,-0.600000,
  -0.200000 ,-0.100000 ,-0.600000,
  0.000000 ,-0.100000 ,-1.000000,
  0.400000 ,0.100000 ,-0.600000,
  0.400000 ,-0.100000 ,-0.600000,
  -0.400000 ,-0.100000 ,-0.600000,
  -0.400000 ,0.100000 ,-0.600000,
  -0.200000 ,0.100000 ,-0.600000,
  0.200000 ,0.100000 ,0.000000,
  0.400000 ,0.100000 ,-0.600000,
  -0.400000 ,0.100000 ,-0.600000,
  0.200000 ,0.100000 ,-0.600000,
  -0.200000 ,0.100000 ,0.000000,
  0.000000 ,0.100000 ,-1.000000,
];

const faces = [
  0 ,1 ,2,
  3 ,4 ,5,
  6 ,7 ,8,
  9 ,10 ,11,
  12 ,13 ,14,
  15 ,16 ,17,
  18 ,19 ,20,
  21 ,22 ,23,
  24 ,25 ,26,
  27 ,28 ,29,
  30 ,31 ,32,
  0 ,5 ,1,
  5 ,0 ,3,
  0 ,33 ,3,
  6 ,9 ,7,
  34 ,7 ,11,
  7 ,9 ,11,
  12 ,35 ,13,
  15 ,36 ,16,
  18 ,37 ,19,
  21 ,38 ,22,
  24 ,39 ,25,
  27 ,40 ,28,
  30 ,41 ,31,
];

class ArrowObject {


  constructor(ctx) {
    this.ctx = ctx;

    this.id = "";
    this.type = "";
    this.color = new THREE.Color(1.0, 0.8, 0.2);

    this.trs = null;

    this.camera = null;
    this.mesh = null;
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["id", "type"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data["id"];
    this.type = data["type"];

    if ("trs" in data) {
      this.trs = data["trs"];
    }

    if ("color" in data) {
      let c = data["color"];
      this.color = new THREE.Color(c[0], c[1], c[2]);
    }

  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {

    // create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(faces);
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices, 3 ) );
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial( { color: this.color, side: THREE.DoubleSide,
      vertexColors: false });

    // make mesh
    this.mesh = new THREE.Mesh( geometry, material );


    this.mesh.raw = this;
    this.mesh.name = this.id;

    let mat = MathHelpers.compose_mat4(this.trs);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.matrix.copy(mat);
    this.mesh.updateMatrixWorld(true);
  }

}

export default ArrowObject;
