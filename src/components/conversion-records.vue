<template>
    <b-row class="mb-3">
        <b-card bg-variant="light" class="w-75 mx-auto" title="CONVERSION RECORD">
            <b-table striped boarderd outlined small responsive :items="conversions" :fields="tableFields"></b-table>
        </b-card>
    </b-row>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator"
import { ConversionEvent, decodedReturn, InitStatus } from '@/types'
import {eventOfEnergyStation, extractValueFromDecoded, fromWeiToDisplayValue} from '../contracts'
import { BigNumber } from 'bignumber.js'
import { EventBus } from '../eventbus'

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
            label: 'Received'
        },
        rate:{
            label: 'VTHO/VET'
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
        this.updateRecord().then(()=>{
            this.$emit('update-status', InitStatus.List)
        })
        EventBus.$on('tick', this.updateRecord)
    }

    beforeDestroy(){
         EventBus.$off('tick', this.updateRecord)
    }

    getLastConversion = async function(){
        let logs = await eventOfEnergyStation('Conversion')!.filter([]).order('desc').apply(0, 5)
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

    updateRecord(){
        return this.getLastConversion().then((conversions)=>{
            this.conversions = conversions
        }).catch((e)=>{
            console.log(e.message)
        })
    }

}

</script>

<style>

</style>
