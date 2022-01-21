import * as THREE from 'three';
import ThreeHelper from '@/components/objects/ThreeHelper.js';

class AnimationVisibility {
  constructor(ctx) {
    this.ctx = ctx;

    this.id = '';
    this.type = '';
    this.frames = null;
  }

  make(data) {
    this.ctx.event_bus.on('play_animation', this.play.bind(this));
    this.frames = data['data'];
  }

  async play(params) {
    console.log('playing animation: ' + this.id);

    let scene = params['scene'];
    const delay = params['delay'];
    const frames_num_total = this.frames.length;
    const timer = ms => new Promise(res => setTimeout(res, ms))
    const { images } = params;
    console.log(images);
    console.log('frames_num_total', frames_num_total, 'delay', delay);

    // collect meshes
    let meshes = this.frames.map(frame => {
      const id = frame["id"];
      let mesh = scene.getObjectByName(id, true );

      if (!mesh) {
        console.log("No mesh found with id:" + id);
        return
      }
      return mesh
    });

    // reset all
    for (let i = 0; i < frames_num_total; i++) {
      meshes[i].visible = false;
    }

    // go frame by frame
    for (let i = 0; i < frames_num_total; i++) {
      // mesh
      meshes[i].visible = true;

      // image
      let img = images[i];
      const url = img['data'];
      const img_div = document.getElementById('img_div0');
      img_div.src = url;
      await timer(delay);
      meshes[i].visible = false;

    }

    meshes[0].visible = true;

  }

}

export default AnimationVisibility;
