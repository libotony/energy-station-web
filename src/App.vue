<template>
    <div id="app">
        <b-navbar class="navbar navbar-dark bg-primary">
            <b-navbar-brand to="/">EnergyStation</b-navbar-brand>
        </b-navbar>

        <router-view v-if="hasConnex"></router-view>

        <b-container v-else class="mt-4">
            <b-jumbotron>
                <h3>Connex <b>not detacted</b></h3>
                <p class="mt-4 mb-4">
                    It is recommended to open in <b>VeChain Sync</b>.
                </p>
                <b-btn variant="primary" size="sm" @click="openWithSync">Open in</b-btn> or <b-link :href="syncReleaseUrl">download</b-link> VeChain Sync.
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