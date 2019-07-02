import { store } from './store.js'
import LoginForm from './loginForm.js'

Vue.component('protected-page', {
  props: ['content'],
  computed: {
    displayedComponent: function() {
      if (!store.token) {
        return 'login-page';
      } else {
        return this.content;
      }
    }
  },
  template: '<component :is="displayedComponent"></component>'
});

export default function protect(component) {
  return {
    template: `<protected-page content="${component}"/>`
  }
}
