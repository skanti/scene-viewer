<template>
  <q-card class="bg-primary text-white q-mt-sm">
    <q-card-section>
      <div class="text-h6">Toolbox</div>
      <div class="text-subtitle2">Animation: {{ id }}</div>
    </q-card-section>

    <q-card-section>
      <q-input
        bg-color="grey-2"
        v-model="delay_"
        label="Delay (ms)"
        placeholder="200"
        hint="Delay in ms"
        type="number"
        filled
        dense>
      </q-input>
    </q-card-section>

    <q-card-section>
      <q-btn @click="click_play" label="Animation" class="text-bold" color="red-4" icon="fas fa-play" >  </q-btn>
    </q-card-section>

  </q-card>

</template>

<script>

export default {
  name: 'Toolbox',
  components: { },
  props: [ 'ctx', 'id', 'delay' ],
  data() {
    return {
      delay_: 60,
    };
  },
  created () {
    if (this.delay)
    this.delay_ = this.delay;
  },
  methods : {
    click_play: function() {
      let evt = "play_" + this.id;
      this.ctx.event_bus.$emit(evt, { delay: this.delay_ } );
    }
  }
}
</script>

<style scoped lang="scss">

</style>
