<template>
  <div class='q-ma-md'>

    <!-- header -->
    <div class='row items-center q-gutter-sm'>
      <div class='text-h5 q-mr-lg text-center self-center text-bold'> Scene Viewer </div>
      <q-btn-toggle size='sm' color='white' text-color='dark' toggle-color="blue-5" v-model='settings.camera_up' unelevated dense no-wrap no-caps
        :options="[{label: 'Y-up', value: 'y'}, {label: 'Z-up', value: 'z'} ]" @update:model-value="v => onclick_up_axis(v)" />
    </div>
    <div class='row q-gutter-lg'>

      <!-- projects -->
      <q-input class='q-pa-none' v-model='project_dir' label='Project Directory' outlined bottom-slots style='width:400px'>
        <template v-slot:append>
          <q-btn-dropdown class='q-pa-xs' flat>
            <q-list>
              <q-item v-for='v in project_dir_history' :key='"hist" + v' @click="() => { project_dir = v; get_experiments(); }" v-close-popup clickable>
                <q-item-section>
                  <q-item-label>{{v}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
      </q-input>

      <!-- experiments -->
      <q-select v-if="project_dir" :model-value="experiment_selected.id" :options='experiments' label='Experiment' style='width:400px'
        @update:model-value="x => { experiment_selected = x; get_outputs()}" outlined >
        <template v-slot:prepend>
          <q-btn icon='fas fa-copy' color='dark' @click='e => click_copy_to_clipboard(e,
            experiment_selected.id)' dense flat/>
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.id }}</q-item-label>
              <q-item-label caption>{{ scope.opt.time_since }} ago</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:append>
          <q-btn color="blue" icon="fas fa-sync" @click.stop='get_experiments' flat dense />
        </template>
      </q-select>

      <!-- outputs -->
      <q-select v-if='experiment_selected' v-model='output_selected' :options='outputs.map(x => x.id)' label='Output' style='width:400px'
        @update:model-value='x => { download_output() }' outlined >
        <template v-slot:prepend>
          <q-btn icon='fas fa-copy' color='dark' @click='e => click_copy_to_clipboard(e, output_selected)' dense flat/>
        </template>
        <template v-slot:after>
          <q-btn color='blue-5' icon='fas fa-download' @click='download_output' outline dense />
        </template>
        <template v-slot:append>
          <q-btn color="blue" icon="fas fa-sync" @click.stop='get_outputs' flat dense />
        </template>
      </q-select>
      <q-btn :loading='loading > 0' :color='loading? "blue-5" : "green-5"' icon='fas fa-check-circle' flat />
    </div>

    <div class='q-mt-md'>
      Full directory: <b> {{full_path}} <i class='fas fa-copy' @click='e => click_copy_to_clipboard(e, full_path)'></i></b>
    </div>

    <!-- header -->

    <!-- main -->
    <div class='row q-col-gutter-sm'>
      <div class='col-6'>
        <div id='div_scene0' style='background-color:#777777; width:100%;height:50vh'>
          <div class='absolute q-pa-xs q-gutter-xs'>
            <q-btn size='sm' label='Prediction' color='primary' text-color='white' square dense unelevated />
          </div>
        </div>
        <div style="margin-top:50px">
          <q-btn class='q-my-sm' size='sm' label='Prediction' color='primary' text-color='white' square dense unelevated />
          <img :src='img_src.pred' style='width:100%'/>
        </div>
      </div>
      <div class='col-6'>
        <div id='div_scene1' style='background-color:#777777; width:100%;height:50vh'>
          <div class='absolute q-pa-xs q-gutter-xs'>
            <q-btn size='sm' label='GT' color='primary' text-color='white' square dense unelevated />
          </div>
        </div>
        <div style="margin-top:50px">
          <q-btn class='q-my-sm' size='sm' label='GT' color='primary' text-color='white' square dense unelevated />
          <img :src='img_src.gt' style='width:100%'/>
        </div>
      </div>
    </div>
    <!-- main -->

  </div>
</template>

<script>

import Viewer from '@/components/Viewer.js';

export default Viewer;
</script>

<style scoped lang='scss'>

</style>
