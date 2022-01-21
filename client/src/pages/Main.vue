<template>
  <div class='q-ma-sm'>

    <!-- header -->
    <div class='q-ma-md'>
      <div class='row items-center q-gutter-sm'>
        <div class='text-h5 q-mr-lg text-center self-center text-bold'> SceneCompletion Viewer </div>
          <q-btn-toggle size='sm' color='white' text-color='dark' toggle-color="blue-5" v-model='settings.camera_up' unelevated dense no-wrap no-caps
            :options="[{label: 'Y-up', value: 'y'}, {label: 'Z-up', value: 'z'} ]" @update:model-value="v => onclick_up_axis(v)" />
          <q-btn size='sm' label='Dummy' color='blue-5' icon='filter_center_focus' @click='onclick_recenter' unelevated no-caps dense />
      </div>
      <div class='row q-gutter-lg'>
        <q-input v-model='project_dir' label='Project Directory' style='width:300px' debounce='500'
          input-style='font-size: 0.8em' @update:model-value='get_experiments' outlined >
          <template v-slot:after>
            <q-btn color='blue-5' icon='refresh' @click='get_experiments' outline dense />
          </template>
        </q-input>
        <q-select v-if='project_dir' v-model='experiment_name' :options='options_experiments' label='Experiment' style='width:400px'
          @update:model-value='get_outputs' outlined >
          <template v-slot:after>
            <q-btn color='blue-5' icon='refresh' @click='get_outputs' outline dense />
          </template>
        </q-select>
        <q-select v-if='experiment_name' v-model='output_name' :options='options_outputs' label='Output' style='width:400px'
          @update:model-value='download_output' outlined >
          <template v-slot:after>
            <q-btn color='blue-5' icon='file_download' @click='download_output' outline dense />
          </template>
        </q-select>
        <q-btn :loading='loading > 0' :color='loading? "blue-5" : "green-5"' icon='check_circle' flat />
      </div>
    </div>
    <!-- header -->

    <!-- main -->
    <div class='row q-col-gutter-sm q-pa-sm'>
      <div class='col-6'>
        <div id='div_scene0' style='background-color:#777777; width:100%;height:50vh'>
          <div class='absolute q-pa-xs q-gutter-xs'>
            <q-btn size='sm' label='Source' color='primary' text-color='white' square dense unelevated />
          </div>
        </div>
      </div>
      <div class='col-6'>
        <div id='div_scene1' style='background-color:#777777; width:100%;height:50vh'>
          <div class='absolute q-pa-xs q-gutter-xs'>
            <q-btn size='sm' label='Target' color='primary' text-color='white' square dense unelevated />
          </div>
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
