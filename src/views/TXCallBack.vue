<template>
    <b-modal title="Convert Tokens" 
        header-bg-variant="primary" 
        header-text-variant="light"
        @:hidden="onHidden"
        ref='modal'
        no-close-on-backdrop
        no-close-on-esc
        centered>
        <div>
            <div class="vld-parent">
                <loading :active="showLoadingSpinner" :is-full-page="false" color="#007bff" :opacity="0.6"></loading>
                <transition name="move-in">
                    <div v-show="showMessage" key="success-info">
                        <b-container fluid  class="d-flex flex-column justify-content-center" style="min-height:210px">
                            <b-row> 
                                <b-col class="d-flex justify-content-center"><fa-i :icon="showSuccess?'check-circle':'times-circle'" size="6x" :style="{color: showSuccess?'#28a745':'#dc3545'}"></fa-i></b-col>
                            </b-row>
                            <b-row class="mt-3">
                                <b-col class="d-flex justify-content-center">
                                    <span :class="{'text-success': showSuccess, 'text-danger': showError}" class="text-center" style="word-wrap: break-word;word-break: break-all;overflow: hidden;">{{message}}</span>
                                </b-col>
                            </b-row>
                        </b-container>
                    </div>
                </transition>
                <transition name="move-in">
                    <t-x-confirm 
                        v-if="showConfirming" 
                        :txid="txid"
                        @confirmThree.once="confirmThreeEvent"
                        @confirmed="confirmed"
                        key="show-confirm">
                    </t-x-confirm>
                </transition>
            </div>
        </div>
        <div slot="modal-footer" class="w-100">
            <b-btn block variant="primary" size="lg" @click="actionOK" :disabled="okDisabled">OK</b-btn>
        </div>
    </b-modal>
</template>

<script lang="ts">
import { isBytes32 } from '../contracts'
import { Component, Vue, Prop } from "vue-property-decorator"
import ConvertModal from '../components/convert-modal.vue'
import {ConversionStatus} from '../types'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import TXConfirm from '../components/tx-confirm.vue'

@Component({
    components:{
        Loading,
        TXConfirm
    }
})

export default class TXCallBack extends Vue {
    txid = ''
    showConfirming=true
    txReverted=false
    message=''
    confirmThree = false

    created() {
        if(this.$route.params.txid && isBytes32(this.$route.params.txid)){    
            this.txid = this.$route.params.txid
        }else{
            this.$router.push('/')
        }     
    }

    mounted(){
        (<Element & {show: Function}>this.$refs.modal).show()
    }

    get showLoadingSpinner(){
        return this.showConfirming
    }

    get showSuccess(){
        return !this.txReverted
    }

    get showError(){
        return this.txReverted
    }

    get showMessage(){
        return !this.showConfirming
    }

    get okDisabled(){
        return !this.confirmThree
    }

    confirmThreeEvent(txReverted: boolean){
        this.confirmThree=true
        this.txReverted = txReverted
    }

    confirmed(){
        this.actionOK()
    }

    actionOK(){
        if(this.showConfirming){
            this.showConfirming=false
            this.message = this.txReverted ? 'Transaction reverted!' : 'Successfully converted!'
        }else{
            this.$router.push('/')
        }
    }

    onHidden(){
        this.$router.push('/')
    }
}
</script>
