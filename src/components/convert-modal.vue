<template>
    <b-modal title="Convert Tokens" 
        header-bg-variant="primary" 
        header-text-variant="light"
        v-on:hide="onHide"
        ref='modal'
        hide-header-close
        centered>
        <div>
            <div class="vld-parent">
            <loading :active="modalInitiating" :is-full-page="false" color="#007bff" :opacity="0.6"></loading>
                <b-container fluid class="mt-3"> 
                    <b-row class="text-center" align-v="center">
                        <b-col><p><span style="font-size:1.5rem">{{fromWeiToDisplayValue(fromTokenValue)}}</span><span style="font-size:0.75rem;">&nbsp;&nbsp;{{fromTokenType}}</span></p></b-col>
                        <b-col><p style="font-size:3rem">⇒</p></b-col>
                        <b-col><p><span style="font-size:1.5rem">{{fromWeiToDisplayValue(toTokenValue)}}</span><span style="font-size:0.75rem;">&nbsp;&nbsp;{{toTokenType}}</span></p></b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                            <p style="font-size:0.75rem" class="d-flex justify-content-end"><span class="text-muted">Rate:&nbsp;</span><span class="">1 {{toTokenType}}={{convertRate}} {{fromTokenType}}</span></p>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-card class="w-100">
                            <b-container fluid> 
                                <b-row align-h="between" @click="showAdvanced=!showAdvanced">
                                    <b-col class="d-flex justify-content-start text-muted">ADVANCED SEETINGS</b-col>
                                    <b-col class="d-flex justify-content-end text-muted"><fa-i :icon="showAdvanced?'angle-double-up':'angle-double-down'" size="lg"></fa-i></b-col>
                                </b-row>
                                <b-row>
                                    <b-col>
                                        <b-collapse v-model="showAdvanced" id="advanced">
                                            <b-form-group class="mt-3" label="PRICE LIMIT" label-size="sm" label-class="text-muted" >
                                                <b-input-group size="sm" :append="fromTokenType">
                                                    <b-form-input v-model="priceLimit" readonly></b-form-input>
                                                </b-input-group>
                                            </b-form-group>
                                            <b-form-group class="mt-3" label="PRICE CHANGE" label-size="sm" label-class="text-muted" >
                                                <b-input-group size="sm" append="%">
                                                    <b-form-input v-model="priceLoss" type="number" :formatter="formatPercentage" @input="calcPriceLimit"></b-form-input>
                                                </b-input-group>
                                            </b-form-group>
                                            <b-form-group label-class="text-muted" label="NO VTHO APPROVE CLAUSE" v-show="showNoApproveOption">
                                                <b-form-checkbox v-model="noApprove"><span class="text-muted">I have appoved enough amount before this.</span></b-form-checkbox>
                                            </b-form-group>
                                        </b-collapse>
                                    </b-col>
                                </b-row>
                            </b-container>
                        </b-card>
                    </b-row>
                </b-container>
            </div>
            <transition name="move-in">
                <div v-show="showError || showSuccess">
                    <b-container fluid class="mt-3">
                        <b-row> 
                            <b-col class="d-flex justify-content-center"><fa-i icon="check-circle" size="6x" style="color: #28a745"></fa-i></b-col>
                        </b-row>
                        <b-row class="mt-5">
                            <p class="text-success text-center" style="word-wrap: break-word;word-break: break-all;overflow: hidden;">Success!<br>TXID: 0xdf31422daa55e2f30eba476a72c0f66eb54be65d83f4a0318c6be52db1188a0f</p>
                        </b-row>
                    </b-container>
                </div>
            </transition>
        </div>
        <b-btn slot="modal-footer" block variant="primary" size="lg" @click="showSuccess=true" :disabled="buttonDisabled"><fa-i icon="circle-notch" spin v-show="converting"></fa-i>{{converting?'&nbsp;&nbsp;Processing':'OK'}}</b-btn>
    </b-modal>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator"
import debounce from 'lodash.debounce'
import { BigNumber } from "bignumber.js"
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'

import {
    methodOfEnergyStation,
    methodOfEnergy,
    fromWeiToDisplayValue,
    extractValueFromDecoded
} from "../contracts"
import {ConversionType, ConversionStatus} from '../types'

const MIN_PRICE_LOSS = 2

@Component({
    components:{
        Loading
    }
})
export default class App extends Vue {
    @Prop(Number) conversionType!: ConversionType
    @Prop(Number) conversionStatus!: ConversionStatus
    @Prop() fromTokenValue!: string
    toTokenValue = '0'

    get fromTokenType(){
        if(this.conversionType === ConversionType.ToVET){
            return 'VTHO'
        }else{
            return 'VET'
        }
    }
    get toTokenType(){
        if(this.conversionType === ConversionType.ToVTHO){
            return 'VTHO'
        }else{
            return 'VET'
        }
    }
    get buttonDisabled(){
        if(this.conversionStatus === ConversionStatus.Start){
            return true
        }
        return false 
    }
    get modalInitiating(){
        return this.conversionStatus === ConversionStatus.Start
    }

    onHide(){
        this.$emit('update:conversionStatus', ConversionStatus.Initial)
    }
    init(){
        (async () => {
            const connex = window.connex
            if(this.conversionType === ConversionType.ToVTHO){
                const VMOutPut = await methodOfEnergyStation('getEnergyReturn')!.call([this.fromTokenValue], 0)
                this.toTokenValue = new BigNumber((extractValueFromDecoded(VMOutPut ,'canAcquire'))).toString(10)
            }else{
                const VMOutPut = await methodOfEnergyStation('getVETReturn')!.call([this.fromTokenValue], 0)
                this.toTokenValue = new BigNumber((extractValueFromDecoded(VMOutPut ,'canAcquire'))).toString(10)
            }
        })().then(()=>{
            this.$emit('update:conversionStatus', ConversionStatus.Initiated)
        }).catch((e)=>{
            console.log(e)
        })
    }

    fromWeiToDisplayValue = fromWeiToDisplayValue

    @Watch('conversionStatus')
    onConvensionStatusChanged(val: number, oldVal: number) {
        console.log('conversionStatus update', val, oldVal)
        if(val===ConversionStatus.Start && oldVal === ConversionStatus.Initial){
            (<Element & {show: Function}>this.$refs.modal).show()
            this.init()
        }
    } 

}
</script>

<style>
.advanced{
    font-size: 0.75rem
}
.move-in-enter-active { 
    transition: all 0.5s ease-in; 
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
