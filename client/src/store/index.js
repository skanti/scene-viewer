import { defineStore } from 'pinia';

export default defineStore('general', {
  state: () => ({
    project_dir: '',
    experiment_selected: {},
    selected_id: '',
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
