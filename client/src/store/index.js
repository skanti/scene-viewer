// persistent variables, rest is not saved in local storage
import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate';

const persisted_state = createPersistedState({ });
// for specific variables add: paths: [ 'project_dir', 'experiment_name', 'output_name' ]

const store = createStore({
  plugins: [persisted_state],
  state: {
    project_dir: '',
    experiment_name: '',
    output_name: '',
    settings: {
      camera_up: 'z',
      video_mode: false,
    }
  },
  mutations: {
    project_dir(state, project_dir) {
      state.project_dir = project_dir;
    },
    experiment_name(state, experiment_name) {
      state.experiment_name = experiment_name;
    },
    output_name(state, output_name) {
      state.output_name = output_name;
    },
    settings(state, settings) {
      state.settings = Object.assign({}, state.settings, settings);
    },
  },
  actions: {
  }
})

export default store;
