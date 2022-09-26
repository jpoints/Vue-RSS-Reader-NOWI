import { createApp} from 'vue'
import Reader from './App.vue'
//const mountEl = document.querySelector("#app");
//createApp(App,{ ...mountEl.dataset }).mount('#app')

class FeedApp {
  
    constructor(props) {
      this.props = props;
      this.intializeApp();
    }
  
    intializeApp() {
      const app = createApp({
        components: {
          Reader
        }
      });
      app.provide('props', this.props);
      app.mount(this.props.mountedEl);
    }
  };

window.FeedApp = FeedApp