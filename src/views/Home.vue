<template>
  <div id="app">
    <b-container class="pt-2">
        <b-row class="mb-2">
            <b-alert
                class="w-75 mx-auto"
                :variant="sysAlertType"
                :show="showSystemMsg"  
                dismissible
                fade>
                {{systemMsg}}
            </b-alert>
        </b-row>
    </b-container>
    <b-container class="pt-4">
        <div class="vld-parent">
            <loading :active="!ready" :is-full-page="false" color="#007bff" :opacity="0.6"></loading>
            <basic-info v-on:update-status="onUpdateInitStatus" v-on:error="onErrored"></basic-info>
            <conversion-records v-on:update-status="onUpdateInitStatus" v-on:error="onErrored"> </conversion-records>
            <convert-cards v-on:convert="onConvert"></convert-cards>
            <convert-modal 
            :conversion-status.sync="conversionStatus"
            :conversion-type="conversionType"
            :from-token-value="fromTokenValue"
            ></convert-modal>
        </div>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator"
import debounce from 'lodash.debounce'
import { BigNumber } from "bignumber.js"

import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import ConversionRecords from '../components/conversion-records.vue'
import BasicInfo from '../components/basic-info.vue'
import ConvertCards from '../components/convert-cards.vue'
import ConvertModal from '../components/convert-modal.vue'

import {
    EnergyStationAddress,
    methodOfEnergyStation,
    eventOfEnergyStation,
    methodOfEnergy,
    eventOfEnergy,
    extractValueFromDecoded,
    fromWeiToDisplayValue
} from "../contracts"
import {ConversionType,InitStatus, ConversionStatus} from '../types'

@Component({
    components:{
        Loading,
        ConversionRecords,
        BasicInfo,
        ConvertCards,
        ConvertModal
    }
})

export default class Main extends Vue {
    // app level message
    systemMsg = ''
    showSystemMsg = false
    sysAlertType = 'primary'
    // initiate state
    initStatus=InitStatus.Initial
    initErrored = false

    // conversion popup modal
    conversionStatus = ConversionStatus.Initial
    conversionType = ConversionType.ToVET
    fromTokenValue = '0'

    created() {
        if (!window.connex) {
            this.showSysMessage("No connex environment detacted, please download sync!", 'danger')
            this.initErrored=true
        }
    }

    get ready(){
        return !(this.initStatus ^ InitStatus.Finish) && !this.initErrored
    }

    onUpdateInitStatus(value:number){
        this.initStatus ^= value
    }
    onErrored(){
        if(!this.initErrored){
            this.showSysMessage('Init Failed!', 'danger')
            this.initErrored=true
        }
    }
    onConvert(data:{
        type: ConversionType,
        value: string
    }){
        this.conversionType = data.type
        this.fromTokenValue = data.value
        this.conversionStatus = ConversionStatus.Start
    }

    showSysMessage(msg:string, type: 'primary'|'success'|'danger' = 'danger'){
        this.sysAlertType = type
        this.systemMsg = msg
        this.showSystemMsg = true
    }

}
</script>

<style>
.info tr div{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
