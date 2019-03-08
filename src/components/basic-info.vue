<template>
    <b-row class="mb-3">
        <b-card bg-variant="light" class="w-75 mx-auto" title="META INFO">
            <b-table stacked small :items="[basicInfo]" class="w-100 info"></b-table>
        </b-card>
    </b-row>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator"
import { ConversionEvent, decodedReturn, InitStatus } from '@/types'
import {eventOfEnergyStation, extractValueFromDecoded, fromWeiToDisplayValue,EnergyStationAddress, methodOfEnergyStation} from '../contracts'
import { BigNumber } from 'bignumber.js'

@Component
export default class BasicInfo extends Vue {
    // basic info 
    basicInfo = {
        'Contract Address': EnergyStationAddress,
        'VET Supply': '-',
        'VTHO Supply': '-',
        'Fee Rate':'-',
        Owner: '-'
    }

    created(){
        this.getInitialInfo().then(()=>{
            this.$emit('update-status', InitStatus.Basic)
        }).catch((e)=>{
            console.log(e.message)
        })
    }

    async getInitialInfo(){
        let connex = window.connex;
        let ret = await methodOfEnergyStation('vetVirtualBalance')!.call()
        this.basicInfo['VET Supply'] = fromWeiToDisplayValue(extractValueFromDecoded(ret, '0'))
        ret = await methodOfEnergyStation('energyVirtualBalance')!.call()        
        this.basicInfo['VTHO Supply'] = fromWeiToDisplayValue(extractValueFromDecoded(ret, '0'))
        ret = await methodOfEnergyStation('conversionFee')!.call()
        this.basicInfo['Fee Rate'] = extractValueFromDecoded(ret, '0')/10000 + '%'
        ret = await methodOfEnergyStation('owner')!.call()  
        this.basicInfo['Owner'] = extractValueFromDecoded(ret, '0')
    }

}

</script>

<style>

</style>
