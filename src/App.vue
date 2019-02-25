<template>
    <div id="app">
        <span id="forkongithub"><a href="https://github.com/libotony/energy-station">Fork me on GitHub</a></span>
        <nav-bar/>

        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { picasso } from '@vechain/picasso'
import { EventBus } from './eventbus'
import { store } from './store'
import NavBar from './components/nav-bar.vue'

@Component({
    components:{
        NavBar
    }
})

export default class App extends Vue {

    created(){
        const data = sessionStorage.getItem('linked-addr');
        if(!!data){
            if(/^0x[0-9a-fA-F]{40}$/i.test(data)){
                store.setLinkedAddrAction(data)
            }else{
                sessionStorage.removeItem('linked-addr');
            }
        }
    }

}


;(async()=>{
    const connex = window.connex
    for(;;){
        try{
            await connex.thor.ticker().next()
            EventBus.$emit('tick')
        }catch(e){
            console.log(e)
        }
    }
})().catch(e=>{
    console.log(e)
})

</script>

<style>
body::-webkit-scrollbar {
    display: none;
}
#forkongithub a {
    background: #42b983;
    color: #fff;
    text-decoration: none;
    font-family: arial, sans-serif;
    text-align: center;
    font-weight: bold;
    padding: 5px 40px;
    font-size: 1rem;
    line-height: 2rem;
    position: relative;
    transition: 0.5s;
}
#forkongithub a:hover {
    background: #c11;
    color: #fff;
    box-shadow: 2px 2px 5px rgba(204, 17, 17, 0.8);
}
#forkongithub a::before,
#forkongithub a::after {
    content: "";
    width: 100%;
    display: block;
    position: absolute;
    top: 1px;
    left: 0;
    height: 1px;
    background: #fff;
}
#forkongithub a::after {
    bottom: 1px;
    top: auto;
}
@media screen and (min-width: 800px) {
    #forkongithub {
        position: absolute;
        display: block;
        top: 0;
        right: 0;
        width: 165px;
        overflow: hidden;
        height: 165px;
        z-index: 2;
    }
    #forkongithub a {
        width: 250px;
        position: absolute;
        top: 45px;
        right: -60px;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        -moz-transform: rotate(45deg);
        -o-transform: rotate(45deg);
        box-shadow: 2px 2px 5px rgba(66, 185, 131, 0.8);
    }
}
@media screen and (max-width: 800px) {
    #forkongithub {
        display: none;
    }
}
</style>
