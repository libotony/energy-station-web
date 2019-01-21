<template>
    <div id="app">
        <span id="forkongithub"><a href="https://github.com/libotony/energy-station">Fork me on GitHub</a></span>
        <b-navbar type="dark" variant="primary" toggleable>
            <b-navbar-brand to="/">EnergyStation</b-navbar-brand>
        </b-navbar>

        <router-view v-if="hasConnex"></router-view>

        <b-container v-else class="mt-4">
            <b-jumbotron>
                <h3>Connex <b>not detacted</b></h3>
                <p class="mt-4 mb-4">
                    It is recommended to open in <b>VeChain Sync</b>.
                </p>
                <b-btn variant="primary" size="sm" @click="openWithSync">Open in</b-btn> or <b-link :href="syncReleaseUrl">Download</b-link> VeChain Sync.
            </b-jumbotron>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { EventBus } from './eventbus'

const customProtocolDetection = require('custom-protocol-detection')

@Component
export default class App extends Vue {
    hasConnex = !!window.connex
    syncReleaseUrl = 'https://github.com/vechain/thor-sync.electron/releases'

    openWithSync() {
        const vechainAppUrl = 'vechain-app:///' + encodeURIComponent(window.location.href)
        const gotoDownload = () => {
            window.location.href = this.syncReleaseUrl
        }
        customProtocolDetection(vechainAppUrl, () => {
            gotoDownload()
        }, () => {
            console.log('opened with sync')
        }, () => {
            gotoDownload()
        })
    }
}

if(window.connex){
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
}
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
        width: 200px;
        overflow: hidden;
        height: 200px;
        z-index: 9999;
    }
    #forkongithub a {
        width: 300px;
        position: absolute;
        top: 60px;
        right: -80px;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        -moz-transform: rotate(45deg);
        -o-transform: rotate(45deg);
        box-shadow: 2px 2px 5px rgba(66, 185, 131, 0.8);
    }
}
</style>
