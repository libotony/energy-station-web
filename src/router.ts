import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import TXCallBack from './views/TXCallBack.vue'

Vue.use(Router)

const router = new Router({
    base: process.env.BASE_URL,
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        }, {
            path: '/tx-callback',
            name: 'TXCallBack',
            component: TXCallBack,
        }, {
            path: '*',
            name: 'Fallback',
            redirect: '/'
        }
    ]
})

// router.beforeEach((to, _, next) => {
//     debugger
//     if (to.query['txid']) {
//         console.log('match')
//         next(`/tx-callback/${to.query.txid}`)
//     } else {
//         next()
//     }

// })

export default router
