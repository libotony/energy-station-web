<template>
    <div>
        <b-row class="mb-3">
            <b-card bg-variant="light" class="w-75 mx-auto" border-variant="primary">
                <b-form-group horizontal
                                breakpoint="lg"
                                label="VET ⇒ VTHO"
                                label-size="lg"
                                label-class="font-weight-bold pt-0"
                                class="mb-0">
                    <b-form-group horizontal>
                        <b-input-group>
                            <b-form-input type="number" v-model="VET2VTHO" :formatter="formatUnsignedInt" @input="calcVTHOReturn"></b-form-input>
                        </b-input-group> 
                    </b-form-group>
                    <b-form-group horizontal>
                    <b-input-group prepend="est. VTHO">
                        <b-form-input v-model="convertedVTHO" readonly></b-form-input>
                        <b-input-group-append>
                        <b-btn text="Button" variant="primary" :disabled="convertedVTHO==0" @click="proceedForEnergy">Convert</b-btn>
                        </b-input-group-append>
                    </b-input-group>
                    </b-form-group>
                </b-form-group>
            </b-card>
        </b-row>
        <b-row class="mb-3">
            <b-card bg-variant="light" class="w-75 mx-auto" border-variant="primary" >
                <b-form-group horizontal
                                breakpoint="lg"
                                label="VTHO ⇒ VET"
                                label-size="lg"
                                label-class="font-weight-bold pt-0"
                                class="mb-0">
                    <b-form-group horizontal>
                        <b-input-group>
                            <b-form-input type="number" v-model="VTHO2VET" :formatter="formatUnsignedInt" @input="calcVETReturn"></b-form-input>   
                        </b-input-group> 
                    </b-form-group>
                    <b-form-group horizontal>
                    <b-input-group prepend="est. VET">
                        <b-form-input v-model="convertedVET" readonly></b-form-input>
                        <b-input-group-append>
                        <b-btn text="Button" variant="primary" :disabled="convertedVET==0" @click="proceedForVET">Convert</b-btn>
                        </b-input-group-append>
                    </b-input-group>
                    </b-form-group>
                </b-form-group>
            </b-card>
        </b-row>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import debounce from 'lodash.debounce'
import { BigNumber } from "bignumber.js"
import {
    methodOfEnergyStation,
    extractValueFromDecoded,
    fromWeiToDisplayValue
} from "../contracts"
import {ConversionType} from '../types'

@Component
export default class ConvertCards extends Vue {
    VET2VTHO: string|null = null
    VTHO2VET: string|null= null
    convertedVTHO = '0'
    convertedVET = '0'
    calcedVET = new BigNumber(0)
    calcedVTHO = new BigNumber(0)

    calcVTHOReturn = debounce(this.getVTHOReturn, 200)
    calcVETReturn = debounce(this.getVETReturn, 200)

    getVTHOReturn() {
        if(!this.VET2VTHO || isNaN(parseInt(this.VET2VTHO)) || parseInt(this.VET2VTHO)=== 0 ){
            this.convertedVTHO = '0'
            return
        }
        methodOfEnergyStation('getEnergyReturn', window._connex.thor).call(new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(10)).then(VMOutPut => {
            this.calcedVTHO  = new BigNumber((extractValueFromDecoded(VMOutPut ,'canAcquire')))
            this.convertedVTHO = fromWeiToDisplayValue(this.calcedVTHO)
        })
    }
    getVETReturn() {
        if(!this.VTHO2VET || isNaN(parseInt(this.VTHO2VET)) || parseInt(this.VTHO2VET)=== 0){
            this.convertedVET = '0'
            return
        }
        methodOfEnergyStation('getVETReturn', window._connex.thor).call(new BigNumber(this.VTHO2VET).multipliedBy(1e18).dp(0).toString(10)).then(VMOutPut => {
            this.calcedVET  = new BigNumber((extractValueFromDecoded(VMOutPut ,'canAcquire')))
            this.convertedVET = fromWeiToDisplayValue(this.calcedVET)
        })
    }
    formatUnsignedInt(input: string){
        if(!isNaN(parseInt(input)) && parseInt(input)>= 0){
            const num =  parseInt(input)
            return num > 0? num.toString(): null
        }else{
            return null
        }
    }
    proceedForEnergy(){
        this.$emit('convert', {
            type: ConversionType.ToVTHO,
            value: new BigNumber(this.VET2VTHO!).multipliedBy(1e18).dp(0).toString(10)
        })
    }
    proceedForVET(){
        this.$emit('convert', {
            type: ConversionType.ToVET,
            value: new BigNumber(this.VTHO2VET!).multipliedBy(1e18).dp(0).toString(10)
        })
    }
}
</script>
<style>

</style>
