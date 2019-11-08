<template>
    <b-navbar type="dark" variant="primary" toggleable>
        <b-navbar-brand to="/">EnergyStation</b-navbar-brand> 
            <template v-if="hasConnex">
                <b-navbar-nav v-show="!sharedStore.linkedAddr">
                    <b-nav-item href="javascript:void(0)" @click="linkAccount">Link Account</b-nav-item>
                </b-navbar-nav>
                <div 
                    id="picasso"
                    v-show="sharedStore.linkedAddr"
                    v-b-tooltip.hover 
                    :title="picassoTip" 
                    :style="picassoStyle"
                    @click="unlink"
                    class="rounded border border-white"/>
                <b-modal 
                    ref="link" 
                    title="Link Account To EnergyStation"
                    header-bg-variant="primary" 
                    header-text-variant="light"
                    hide-header-close
                    @ok="linkOkEvent"
                    @hidden="onLinkHidden"
                    centered>
                    <div v-show="!errMsg">
                        <ul>
                            <li><p>EnergyStation will enforces the signer to the linked account</p></li>
                            <li><p>EnergyStation will check the approval for VTHO when converting from VTHO and omit VTHO approve clause if possible (This will decrease TX fee)</p></li>
                        </ul>
                    </div>
                    <transition name="move-in">
                        <div v-show="!!errMsg">
                            <div class="text-danger d-flex flex-column justify-content-center" style="min-height: 152px">
                                <div class="d-flex justify-content-center">
                                    <h6>{{errMsg}}</h6>
                                </div>
                            </div>
                        </div>
                    </transition>
                </b-modal>
                <b-modal 
                    ref="unlink" 
                    hide-header
                    @ok="unlinkOkEvent"
                    centered>
                    <div class="text-center text-danger">
                        <h6>Are you sure to remove the linked account?</h6>
                    </div>
                </b-modal>
            </template>
    </b-navbar>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator"
import { store } from '../store'
import { picasso } from '@vechain/picasso';
import { VueClass } from 'vue-class-component/lib/declarations';
import { Certificate } from 'thor-devkit'

@Component
export default class NavBar extends Vue {
    hasConnex = !!window.connex
    sharedStore = store.state
    errMsg=''

    get picassoStyle(){
        if(this.sharedStore.linkedAddr){
            return {
                background: `no-repeat url('data:image/svg+xml;utf8,${picasso(this.sharedStore.linkedAddr)}')`, 
                'background-size': 'cover'
            }
        }
        return {}
    }
    get picassoTip(){
        return this.sharedStore.linkedAddr ? 'Linked account: ' + this.sharedStore.linkedAddr :''
    }

    linkAccount(){
        (<Element & {show: Function}>this.$refs.link).show()
    }

    linkOkEvent(bvEvt:Event){
        if(!this.errMsg){
            bvEvt.preventDefault()
            const arr = new Uint8Array(20);
            window.crypto.getRandomValues(arr);
            let random = '0x'
            for(let i=0; i<arr.length; i++){
                random += ('0' + arr[i].toString(16)).slice(-2)
            }

            const signingService = window.connex.vendor.sign('cert')
            const cert: Connex.Vendor.SigningService.CertMessage = {
                purpose: 'identification',
                payload: {
                    type: 'text',
                    content: 'EnergyStation is requesting your identification with random string, choose the wallet you want to link.\r\n\r\nRandom challenge: ' + random
                }
            }
            signingService.request(cert).then(result=>{
                store.setLinkedAddrAction(result.annex.signer)
                Certificate.verify({
                    ...cert,
                    domain: result.annex.domain,
                    timestamp: result.annex.timestamp,
                    signer: result.annex.signer,
                    signature: result.signature
                })
                sessionStorage.setItem('linked-addr', result.annex.signer)
                ;(<Element & {hide: Function}>this.$refs.link).hide()
            }).catch(err=>{
                this.errMsg = err.toString()
            })
        }
    }

    onLinkHidden(){
        this.errMsg=''
    }

    unlink(){
        (<Element & {show: Function}>this.$refs.unlink).show()
    }


    unlinkOkEvent(){
        store.setLinkedAddrAction('')
        sessionStorage.removeItem('linked-addr')
    }
}

</script>

<style>
#picasso {
    height: 35px;
    width: 80px; 
}
.move-in-enter-active { 
    transition: all 0.3s ease-in; 
} 
.move-in-enter { 
    opacity: 0; 
} 
.move-in-enter { 
    transform: translateX(31px); 
}
.move-in-leave { 
    display: none; 
}
</style>
