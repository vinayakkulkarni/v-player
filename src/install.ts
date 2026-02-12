import { App as Application, Plugin } from 'vue';
import VPlayer from './components/VPlayer.vue';
import { setVueInstance } from './utils/config/index';

let installed = false;

const install: Exclude<Plugin['install'], undefined> = (
  app: Application,
) => {
  if (!installed) {
    setVueInstance(app);
    app.component('VPlayer', VPlayer);
    installed = true;
  }
};

export default install;
