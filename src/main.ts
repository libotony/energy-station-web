import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDoubleUp, faAngleDoubleDown, faCircleNotch, faCheckCircle, faInfoCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './registerServiceWorker'

library.add(faAngleDoubleUp, faAngleDoubleDown, faCircleNotch, faCheckCircle, faInfoCircle, faTimesCircle)

Vue.component('fa-i', FontAwesomeIcon)

import App from './App.vue'
import router from './router'

Vue.use(BootstrapVue)
Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
