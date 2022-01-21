<template>
  <div class='q-ma-sm'>

    <!-- header -->
    <div class='q-ma-md'>
      <div class='text-h5 text-center text-bold'> Stream2Space Viewer </div>
      <div class='row q-gutter-lg'>
        <q-select outlined v-model="model_experiment" :options="options_experiments" label="Experiment" style="width:300px"/>
        <q-select v-if="model_experiment" outlined v-model="model_output" :options="options_outputs" label="Output" style="width:300px"/>
      </div>
    </div>
    <!-- header -->

    <!-- main -->
    <div class='row q-col-gutter-sm q-pa-sm'>
      <div class='col-6'>
        <div id='div_scene0' style='background-color:#777777; width:100%;height:75vh'>
          <div class='absolute q-pa-xs q-gutter-xs'>
            <q-btn size='sm' label='Prediction' color='primary' text-color='white' square dense unelevated />
          </div>
        </div>
      </div>
      <div class='col-6'>
        <div id='div_scene1' style='background-color:#777777; width:100%;height:75vh'>
          <div class='absolute q-pa-xs q-gutter-xs'>
            <q-btn size='sm' label='GT' color='primary' text-color='white' square dense unelevated />
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
