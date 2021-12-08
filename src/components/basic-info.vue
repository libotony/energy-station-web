<template>
    <b-row class="mb-3">
        <b-card bg-variant="light" class="w-75 mx-auto" title="META INFO">
            <b-table stacked small :items="[basicInfo]" class="w-100 info"></b-table>
        </b-card>
    </b-row>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { InitStatus } from '@/types'
import { extractValueFromDecoded, fromWeiToDisplayValue,EnergyStationAddress, methodOfEnergyStation} from '../contracts'

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
        const connex = window._connex
        let ret = await methodOfEnergyStation('vetVirtualBalance', connex.thor).call()
        this.basicInfo['VET Supply'] = fromWeiToDisplayValue(extractValueFromDecoded(ret, '0'))
        ret = await methodOfEnergyStation('energyVirtualBalance', connex.thor).call()        
        this.basicInfo['VTHO Supply'] = fromWeiToDisplayValue(extractValueFromDecoded(ret, '0'))
        ret = await methodOfEnergyStation('conversionFee', connex.thor).call()
        this.basicInfo['Fee Rate'] = extractValueFromDecoded(ret, '0')/10000 + '%'
        ret = await methodOfEnergyStation('owner', connex.thor).call()  
        this.basicInfo['Owner'] = extractValueFromDecoded(ret, '0')
    }

}

</script>

<style>

</style>
