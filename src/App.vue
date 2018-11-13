<template>
  <div id="app">
    <b-navbar class="navbar navbar-dark bg-primary">
        <b-navbar-brand>EnergyStation</b-navbar-brand>
    </b-navbar>
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
            <basic-info v-on:update-status="updateInitStatus" v-on:error="onError"></basic-info>
            <conversion-records v-on:update-status="updateInitStatus" v-on:error="onError"> </conversion-records>
            <convert-cards></convert-cards>
        </div>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator"
import debounce from 'lodash.debounce'
import { BigNumber } from "bignumber.js"

import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import ConversionRecords from './components/conversion-records.vue'
import BasicInfo from './components/basic-info.vue'
import ConvertCards from './components/convert-cards.vue'

import {
    EnergyStationAddress,
    methodOfEnergyStation,
    eventOfEnergyStation,
    methodOfEnergy,
    eventOfEnergy,
    extractValueFromDecoded,
    fromWeiToDisplayValue
} from "./contracts"
import {ConversionType,InitStatus} from './types'

@Component({
    components:{
        Loading,
        ConversionRecords,
        BasicInfo,
        ConvertCards
    }
})

export default class App extends Vue {
    // app level message
    systemMsg = ''
    showSystemMsg = false
    sysAlertType = 'primary'
    // initiate state
    initStatus=InitStatus.Initial
    initErrored = false


    // conversion popup modal
    showModal=false
    conversionType:ConversionType = ConversionType.ToVTHO
    fromTokenValue = '0'
    toTokenValue = '0'
    showAdvanced = false
    priceLoss = 2
    priceLimit = '0'
    showNoApproveOption = false
    noApprove = false
    converting=false
    showError=false
    showSuccess=false
    resultMsg = ''

    created() {
        if (!window.connex) {
            this.showSysMessage("No connex environment detacted, please download sync!", 'danger')
            this.initErrored=true
        }
    }
    showSysMessage(msg:string, type: 'primary'|'success'|'danger' = 'danger'){
        this.sysAlertType = type
        this.systemMsg = msg
        this.showSystemMsg = true
    }
    get ready(){
        return !(this.initStatus ^ InitStatus.Finish) && !this.initErrored
    }
    updateInitStatus(value:number){
        this.initStatus ^= value
    }
    onError(){
        if(!this.initErrored){
            this.showSysMessage('Init Failed!', 'danger')
            this.initErrored=true
        }
    }


    // proceedForEnergy() {
    //     this.initConvertModal(ConversionType.ToVTHO)
    //     this.showModal = true
    // }
    // proceedForVET() {
    //     this.initConvertModal(ConversionType.ToVET)
    //     // this.checkApproval()
    //     this.showModal = true
    // }
    // doConvert(){
    //     this.converting=true;
    //     (async () => {
    //         const connex = window.connex
    //         if(this.conversionType === ConversionType.ToVTHO){
    //             const VMOutPut = await methodOfEnergyStation('getEnergyReturn')!.call([new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(10)], '0x0')
    //             const convertedEnergy = new BigNumber((extractValueFromDecoded(VMOutPut ,'canAcquire')))
    //             let minReturn = convertedEnergy.dividedBy(this.priceLoss/100+1)
                
    //             console.log('minReturn', minReturn.dividedBy(1e18).toString())
    //             let clause = methodOfEnergyStation('convertForEnergy')!.asClause([minReturn.dp(0).toString(10)],"0x" +new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(16))
    //             let ret = await connex.vendor.sign("tx", [{...clause, desc: `Calling convert to VTHO function`}], {summary: `Converting ${this.VET2VTHO} VET to VTHO`})
    //             this.showSuccessMsg(`Transaction ID: ${ret.txId}`)
    //         }else{
    //             const amount = new BigNumber(this.VTHO2VET).multipliedBy(1e18).dp(0)
    //             const VMOutPut = await methodOfEnergyStation('getVETReturn')!.call([amount.toString(10)], '0x0')
    //             const convertedVET= new BigNumber(extractValueFromDecoded(VMOutPut ,'canAcquire'))
    //             let minReturn = convertedVET.dividedBy(this.priceLoss/100+1)

                
    //             let convertClause = methodOfEnergyStation('convertForVET')!.asClause([amount.toString(10), minReturn.dp(0).toString(10)],"0x0")
    //             let approveClause = methodOfEnergy('approve')!.asClause([EnergyStationAddress, amount.toString(10)],"0x0")

    //             let clauses = []
    //             if(!this.noApprove){
    //                 clauses.push({...approveClause,desc:`Approve EnergyStation to spent ${this.VTHO2VET} VTHO`})
    //             }
    //             clauses.push({...convertClause, desc:'Calling convert to VET function'})

    //             let ret = await connex.vendor.sign("tx", clauses, {summary: `Converting ${this.VTHO2VET} VTHO to VET`})
    //             this.showSuccessMsg(`Transaction ID: ${ret.txId}`)
    //         }
    //     })().catch(e => {
    //         console.log(e)
    //         alert('Convet failed caused by: '+e.message)
    //     })
    // }


    // formatPercentage(input: string){
    //     if(!isNaN(parseInt(input)) && parseInt(input)>= 0){
    //         if(parseInt(input)>100){
    //             return 100
    //         }
    //         return parseInt(input)
    //     }else{
    //         return 0
    //     }
    // }
    // calcPriceLimit = debounce(this.getPriceLimit, 200)
    // getPriceLimit(){
    //     if(this.conversionType === ConversionType.ToVTHO){
    //         this.priceLimit = new BigNumber(this.VET2VTHO).multipliedBy(1e18).dividedBy(this.calcedVTHO).multipliedBy(1+this.priceLoss/100).dp(6).toString(10)
    //     }else{
    //         this.priceLimit = new BigNumber(this.VTHO2VET).multipliedBy(1e18).dividedBy(this.calcedVET).multipliedBy(1+this.priceLoss/100).dp(6).toString(10)
    //     }
    // }
    // initConvertModal(conversionType: ConversionType){
    //     this.conversionType = conversionType
    //     if(conversionType === ConversionType.ToVET){
    //         this.fromTokenValue = this.VTHO2VET
    //         this.toTokenValue = this.convertedVET
    //     }else{
    //         this.fromTokenValue = this.VET2VTHO
    //         this.toTokenValue = this.convertedVTHO
    //     }
    //     this.showAdvanced = false
    //     this.getPriceLimit()
    //     this.priceLoss = 2
    //     this.showNoApproveOption = false
    //     this.noApprove = false
    //     this.converting=false
    //     this.showSuccess=false
    //     this.showError = false
    //     this.resultMsg = ''
    // }

    // showSuccessMsg(msg: string){
    //     this.resultMsg = msg
    //     this.showSuccess = true
    // }
    // async checkApproval(){
    //     if(this.conversionType !== ConversionType.ToVET){
    //         return
    //     }
    //     // TODO: need sync to implement link account
    //     let spender = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed'
    //     let ret = await methodOfEnergy('allowance')!.call([spender, EnergyStationAddress],'0x0')
    //     const remaining  =  extractValueFromDecoded(ret, 'remaining')
    //     if(new BigNumber(remaining).dividedBy(1e18).isGreaterThanOrEqualTo(this.VTHO2VET)){
    //         this.showNoApproveOption = true
    //     }else{
    //         this.showNoApproveOption = false
    //     }
    // }
    // get convertRate(){
    //     if(this.conversionType === ConversionType.ToVTHO){
    //         return new BigNumber(this.VET2VTHO).multipliedBy(1e18).dividedBy(this.calcedVTHO).dp(6).toString(10)
    //     }else{
    //         return new BigNumber(this.VTHO2VET).multipliedBy(1e18).dividedBy(this.calcedVET).dp(6).toString(10)
    //     }
    // }
}
</script>

<style>
.info tr div{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>