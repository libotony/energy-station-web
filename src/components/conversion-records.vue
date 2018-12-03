<template>
    <b-row class="mb-3">
        <b-card bg-variant="light" class="w-75 mx-auto" title="Latest conversions">
            <b-table striped boarderd outlined small responsive :items="conversions" :fields="tableFields"></b-table>
        </b-card>
    </b-row>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator"
import { ConversionEvent, decodedReturn, InitStatus } from '@/types'
import {eventOfEnergyStation, extractValueFromDecoded, fromWeiToDisplayValue} from '../contracts'
import { BigNumber } from 'bignumber.js'

@Component
export default class ConversionRecords extends Vue {
    tableFields = {
        conversion:{
            label: 'Conversion'
        },
        amount:{
            label: 'Amount'
        },
        converted:{
            label: 'Conveted'
        },
        rate:{
            label: 'Rate(VTHO/VET)'
        },
        conversionTime:{
            label: 'Time'
        },
        fee:{
            label: 'Fee'
        }
    }
    conversions: Array<ConversionEvent> = []

    created(){
        if(window.connex){
            this.getLastConversion().then((conversions)=>{
                this.conversions = conversions
                this.$emit('update-status', InitStatus.List)
            }).catch((e)=>{
                console.log(e.message)
                this.$emit('error')
            })
            ;(async()=>{
                const connex = window.connex
                for(;;){
                    await connex.thor.ticker().next()
                    this.conversions = await this.getLastConversion()
                }
            })().catch(e=>{
                console.log(e)
            })
        }
    }

    getLastConversion = async function(){
        let logs = await eventOfEnergyStation('Conversion')!.filter([]).desc().apply(0, 5)
        let conversions: Array<ConversionEvent> = []
        for (let log of logs) {
            let item: ConversionEvent = {
                id: log.meta!.txID + log.meta!.blockID
            }
            if ((log.decoded as decodedReturn)['tradeType'] == '1') {
                item.conversion = "VTHO→VET"
                item.rate = new BigNumber(extractValueFromDecoded(log, '_sellAmount')).dividedBy(extractValueFromDecoded(log, '_return')).dp(4).toString(10)
                item.fee = fromWeiToDisplayValue(extractValueFromDecoded(log, '_conversionFee')) + 'VET'
            } else {
                item.conversion = "VET→VTHO"
                item.rate = new BigNumber(extractValueFromDecoded(log, '_return')).dividedBy(extractValueFromDecoded(log, '_sellAmount')).dp(4).toString(10)
                item.fee = fromWeiToDisplayValue(extractValueFromDecoded(log, '_conversionFee')) + 'VTHO'
            }
            item.amount = fromWeiToDisplayValue(extractValueFromDecoded(log, '_sellAmount'))
            item.converted = fromWeiToDisplayValue(extractValueFromDecoded(log, '_return'))
            item.conversionTime = new Date(log.meta!.blockTimestamp * 1000).format('yyyy-MM-dd hh:mm:ss')
            conversions.push(item)
        }
        return conversions.reverse()
    }

}

</script>

<style>

</style>
