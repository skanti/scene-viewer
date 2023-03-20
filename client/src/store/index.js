import { defineStore } from 'pinia';

export default defineStore('general', {
  state: () => ({
    project_dir: '',
    project_dir_history: [],
    experiment_selected: {},
    output_selected: '',
    settings: {
      camera_up: 'z'
    }
  }),
  getters: {
  },
  actions: {
  },
  persist: true
})
