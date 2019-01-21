<template>
  <div>
    <b-container class="mt-2">
        <b-row>
            <b-alert
                class="w-75 mx-auto mb-0"
                variant="warning"
                :show="isMainNet"  
                dismissible
                fade>
                EnergyStation is not deployed to the mainnet yet!
            </b-alert>
        </b-row>
    </b-container>
    <b-container class="mt-2">
        <div class="vld-parent">
            <loading :active="!ready" :is-full-page="false" color="#007bff" :opacity="0.6"></loading>
            <conversion-records v-on:update-status="onUpdateInitStatus"> </conversion-records>
            <convert-cards v-on:convert="onConvert"></convert-cards>
            <convert-modal 
            :conversion-status.sync="conversionStatus"
            :conversion-type="conversionType"
            :from-token-value="fromTokenValue"
            ></convert-modal>
            <basic-info v-on:update-status="onUpdateInitStatus"></basic-info>
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
    isMainNet = connex.thor.genesis.id === '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a' ? true : false
    // initiate state
    initStatus=InitStatus.Initial
    // conversion popup modal
    conversionStatus = ConversionStatus.Initial
    conversionType = ConversionType.ToVET
    fromTokenValue = '0'

    get ready(){
        return !(this.initStatus ^ InitStatus.Finish)
    }

    onUpdateInitStatus(value:number){
        this.initStatus ^= value
    }

    onConvert(data:{
        type: ConversionType,
        value: string
    }){
        this.conversionType = data.type
        this.fromTokenValue = data.value
        this.conversionStatus = ConversionStatus.Start
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
