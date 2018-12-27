import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import TXCallBack from './views/TXCallBack.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }, {
        path: '/tx-callback/:txid',
        name: 'TXCallBack',
        component: TXCallBack,
        props:true
    }, {
        path: '*',
        name: 'Fallback',
        redirect: '/'
    }
  ]
})
