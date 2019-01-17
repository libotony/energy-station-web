import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import TXCallBack from './views/TXCallBack.vue'

Vue.use(Router)

const router = new Router({
    base: process.env.BASE_URL,
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        }, {
            path: '/tx-callback/:txid',
            name: 'TXCallBack',
            component: TXCallBack,
        }
    ]
})

export default router
