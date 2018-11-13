<template>
    <b-row class="mb-3">
        <b-card bg-variant="light" class="w-75 mx-auto" title="EnergyStaion Info">
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
export default class App extends Vue {
    // basic info 
    basicInfo = {
        EnergyStationAddress,
        'VET Balance': '-',
        'VTHO Balance': '-',
        'Conversion Rate':'-',
        Owner: '-'
    }

    created(){
        if(window.connex){
            this.getInitialInfo().then(()=>{
                this.$emit('update-status', InitStatus.Basic)
                // throw 'e'
            }).catch((e)=>{
                console.log(e.message)
                this.$emit('error')
            })
        }
    }

    async getInitialInfo(){
        let connex = window.connex;
        let ret = await methodOfEnergyStation('vetVirtualBalance')!.call([], '0x0')
        this.basicInfo['VET Balance'] = fromWeiToDisplayValue(extractValueFromDecoded(ret, '0'))
        ret = await methodOfEnergyStation('energyVirtualBalance')!.call([], '0x0')        
        this.basicInfo['VTHO Balance'] = fromWeiToDisplayValue(extractValueFromDecoded(ret, '0'))
        ret = await methodOfEnergyStation('conversionFee')!.call([], '0x0')
        this.basicInfo['Conversion Rate'] = extractValueFromDecoded(ret, '0')/10000 + '%'
        ret = await methodOfEnergyStation('owner')!.call([], '0x0')  
        this.basicInfo['Owner'] = extractValueFromDecoded(ret, '0')
    }

}

</script>

<style>

</style>
