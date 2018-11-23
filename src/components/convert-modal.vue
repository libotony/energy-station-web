<template>
    <b-modal title="Convert Tokens" 
        header-bg-variant="primary" 
        header-text-variant="light"
        v-on:hidden="onHidden"
        ref='modal'
        hide-header-close
        centered>
        <div>
            <div class="vld-parent">
                <loading :active="showLoadingSpinner" :is-full-page="false" color="#007bff" :opacity="0.6"></loading>
                <b-container fluid class="mt-3" v-show="showConvertSettings"> 
                    <b-row class="text-center" align-v="center">
                        <b-col><p><span style="font-size:1.5rem">{{fromWeiToDisplayValueWithThousandth(fromTokenValue)}}</span><span style="font-size:0.75rem;">&nbsp;&nbsp;{{fromTokenType}}</span></p></b-col>
                        <b-col><p style="font-size:3rem">⇒</p></b-col>
                        <b-col><p><span style="font-size:1.5rem">{{fromWeiToDisplayValueWithThousandth(toTokenValue)}}</span><span style="font-size:0.75rem;">&nbsp;&nbsp;{{toTokenType}}</span></p></b-col>
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
                                            <b-form-group class="mt-3" label-size="sm" label-class="text-muted" >
                                                <b-form-checkbox v-model="checkConfirmtion"><span class="text-muted">WAIT FOR CONFIRMATION</span></b-form-checkbox>
                                            </b-form-group>
                                            <b-form-group label-class="text-muted" label="NO VTHO APPROVE CLAUSE" v-show="showNoApproveOption">
                                                <b-form-checkbox v-model="noApprove"><span class="info-icon"><fa-i icon="info-circle" size="xs" v-b-tooltip.hover title="Enerngy Station will not add an approve cluase if this is checked" style="color: #6c757d;"></fa-i></span><span class="text-muted">I have appoved enough amount before this.</span></b-form-checkbox>
                                            </b-form-group>
                                        </b-collapse>
                                    </b-col>
                                </b-row>
                            </b-container>
                        </b-card>
                    </b-row>
                </b-container>
                <transition name="move-in">
                    <div v-show="showMessage" key="success-info" style="min-height:210px">
                        <b-container fluid  class="d-flex flex-column justify-content-center" style="min-height:210px">
                            <b-row> 
                                <b-col class="d-flex justify-content-center"><fa-i :icon="showSuccess?'check-circle':'times-circle'" size="6x" :style="{color: showSuccess?'#28a745':'#dc3545'}"></fa-i></b-col>
                            </b-row>
                            <b-row class="mt-3">
                                <b-col class="d-flex justify-content-center">
                                    <span :class="{'text-success': showSuccess, 'text-danger': showError}" class="text-center" style="word-wrap: break-word;word-break: break-all;overflow: hidden;">{{message}}</span>
                                </b-col>
                            </b-row>
                        </b-container>
                    </div>
                </transition>
                <transition name="move-in">
                    <div v-show="showConfirming" key="show-confirm">
                        <b-container fluid  class="d-flex flex-column justify-content-end" style="min-height:210px">
                            <b-row class="mb-3">
                                <b-col class="d-flex justify-content-center">
                                <span>{{confirmCount}}/12  <b-badge class="status-badge" :variant="confirmCount <= 0 ?'secondary' : txReverted ? 'danger':'success'" >{{confirmCount <= 0 ?'NOT PACKED' : txReverted ? 'REVERTED':'SUCCESS'}}</b-badge></span>
                                </b-col>
                            </b-row>
                        </b-container>
                    </div>
                </transition>
            </div>
        </div>
        <div slot="modal-footer" class="w-100">
            <b-btn block variant="primary" size="lg" @click="actionOK" :disabled="okDisabled"><fa-i icon="circle-notch" spin v-show="converting"></fa-i>{{converting?'&nbsp;&nbsp;Processing':'OK'}}</b-btn>
        </div>
    </b-modal>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator"
import debounce from 'lodash.debounce'
import { BigNumber } from "bignumber.js"
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'

import {
    EnergyStationAddress,
    methodOfEnergyStation,
    methodOfEnergy,
    fromWeiToDisplayValue,
    fromWeiToDisplayValueWithThousandth,
    extractValueFromDecoded
} from "../contracts"
import {ConversionType, ConversionStatus} from '../types'

const MIN_PRICE_LOSS = 1

@Component({
    components:{
        Loading
    }
})
export default class ConvertModal extends Vue {
    // Prop
    @Prop(Number) conversionType!: ConversionType
    @Prop(Number) conversionStatus!: ConversionStatus
    @Prop() fromTokenValue!: string

    // Data
    toTokenValue = '0'
    showAdvanced = false
    priceLimit = '0'
    priceLoss = 2
    noApprove = false
    showNoApproveOption = false
    checkConfirmtion = false
    message = ''
    txID = ''
    stopReceiptWating = true
    confirmCount = 0
    txReverted = false

    // Computed
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
    get okDisabled(){
        switch(this.conversionStatus){
            case ConversionStatus.Start:
            case ConversionStatus.Processing:
                return true
            case ConversionStatus.Confirming:
                if(this.confirmCount > 3)
                    return false
                else
                    return true
            default:
                return false
        }
    }
    get converting(){
        return this.conversionStatus === ConversionStatus.Processing
    }
    get convertRate(){
        return new BigNumber(this.fromTokenValue).dividedBy(this.toTokenValue).dp(6).toString(10)
    }
    get showConvertSettings(){
        switch(this.conversionStatus){
            case ConversionStatus.Success:
            case ConversionStatus.Error:
            case ConversionStatus.Confirming:
                return false
            default:
                return true
        }
    }
    get showMessage(){
        return this.showSuccess || this.showError
    }
    get showSuccess(){
        return this.conversionStatus === ConversionStatus.Success
    }
    get showError(){
        return this.conversionStatus === ConversionStatus.Error
    }
    get showConfirming(){
        return this.conversionStatus === ConversionStatus.Confirming
    }
    get showLoadingSpinner(){
        return (this.conversionStatus === ConversionStatus.Start) || this.showConfirming
    }
    
    // Method
    calcPriceLimit = debounce(this.getPriceLimit, 200)
    getPriceLimit(){
        this.priceLimit = new BigNumber(this.fromTokenValue).dividedBy(this.toTokenValue).multipliedBy(1+this.priceLoss/100).dp(6).toString(10)
    }
    onHidden(){
        this.$emit('update:conversionStatus', ConversionStatus.Initial)
        if(this.stopReceiptWating !== true){
            this.stopReceiptWating = true
        }
    }
    init(){
        (async () => {
            this.toTokenValue = '0'
            this.showAdvanced = false
            this.priceLimit = '0'
            this.priceLoss = 2
            this.noApprove = false
            this.showNoApproveOption = false
            this.checkConfirmtion = false
            this.message = ''
            this.txID = ''
            this.stopReceiptWating = true
            this.confirmCount = 0
            this.txReverted =false

            const connex = window.connex
            if(this.conversionType === ConversionType.ToVTHO){
                const VMOutPut = await methodOfEnergyStation('getEnergyReturn')!.call([this.fromTokenValue], 0)
                this.toTokenValue = new BigNumber((extractValueFromDecoded(VMOutPut ,'canAcquire'))).toString(10)
            }else{
                const VMOutPut = await methodOfEnergyStation('getVETReturn')!.call([this.fromTokenValue], 0)
                this.toTokenValue = new BigNumber((extractValueFromDecoded(VMOutPut ,'canAcquire'))).toString(10)
            }
            this.getPriceLimit() 
            // await this.checkApproval()
        })().then(()=>{
            this.$emit('update:conversionStatus', ConversionStatus.Initiated)
        }).catch((e)=>{
            console.log(e)
        })
    }
    fromWeiToDisplayValue = fromWeiToDisplayValue
    fromWeiToDisplayValueWithThousandth = fromWeiToDisplayValueWithThousandth
    formatPercentage(input: string){
        if(!isNaN(parseInt(input)) && parseInt(input)>= MIN_PRICE_LOSS){
            if(parseInt(input)>100){
                return 100
            }
            return parseInt(input)
        }else{
            return MIN_PRICE_LOSS
        }
    }
    actionOK(){
        if(this.conversionStatus === ConversionStatus.Initiated){
            // this.txID = '0xc591c7fdcefb85ccf94c597b532ac7c3df060ed7783457d0b7f57fb35cb06baa'
            // this.checkReceipt()
            this.$emit('update:conversionStatus', ConversionStatus.Processing)
            ;(async () => {
                const connex = window.connex
                let signResult
                if(this.conversionType === ConversionType.ToVTHO){
                    const convertedEnergy = new BigNumber(this.toTokenValue)
                    let minReturn = convertedEnergy.dividedBy(this.priceLoss/100+1)
                    
                    let clause = methodOfEnergyStation('convertForEnergy')!.asClause([minReturn.dp(0).toString(10)],"0x" +new BigNumber(this.fromTokenValue).dp(0).toString(16))
                    signResult = await connex.vendor.sign("tx", [{...clause, desc: `Calling convert to VTHO function`}], {summary: `Converting ${fromWeiToDisplayValue(this.fromTokenValue)} VET to VTHO`})
                }else{
                    const amount = new BigNumber(this.fromTokenValue)
                    const convertedVET= new BigNumber(this.toTokenValue)
                    let minReturn = convertedVET.dividedBy(this.priceLoss/100+1)

                    let convertClause = methodOfEnergyStation('convertForVET')!.asClause([amount.dp(0).toString(10), minReturn.dp(0).toString(10)], '0x0')
                    let approveClause = methodOfEnergy('approve')!.asClause([EnergyStationAddress, amount.toString(10)], '0x0')

                    let clauses = []
                    if(!this.noApprove){
                        clauses.push({...approveClause,desc:`Approve EnergyStation to spent ${fromWeiToDisplayValue(this.fromTokenValue)} VTHO`})
                    }
                    clauses.push({...convertClause, desc:'Calling convert to VET function'})
                    signResult = await connex.vendor.sign("tx", clauses, {summary: `Converting ${fromWeiToDisplayValue(this.fromTokenValue)} VTHO to VET`})
                }
                this.txID = signResult.txId
                if(this.checkConfirmtion){
                    this.checkReceipt()
                }else{
                    this.actionShowSuccess('Trasaction addded to the queue!')
                }
            })().catch(e => {
                console.log(e)
                this.actionShowError('Sign transaction failed!')
            })
        }else if(this.conversionStatus === ConversionStatus.Success || this.conversionStatus === ConversionStatus.Error){
            (<Element & {hide: Function}>this.$refs.modal).hide()
        }else if(this.conversionStatus === ConversionStatus.Confirming){
            if(this.stopReceiptWating !== true){
                this.stopReceiptWating = true
            }
            if(this.txReverted){
                this.actionShowError('Transaction reverted!')
            }else{
                this.actionShowSuccess('Successfully converted!') 
            }
        }
    }
    actionShowSuccess(msg: string){
        this.$emit('update:conversionStatus', ConversionStatus.Success)
        this.message = msg
    }
    actionShowError(msg: string){
        this.$emit('update:conversionStatus', ConversionStatus.Error)
        this.message = msg
    }
    async checkApproval(){
        if(this.conversionType !== ConversionType.ToVET){
            return
        }
        // TODO: need sync to implement link account
        let spender = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed'
        let ret = await methodOfEnergy('allowance')!.call([spender, EnergyStationAddress],'0x0')
        const remaining  =  extractValueFromDecoded(ret, 'remaining')
        if(new BigNumber(remaining).isGreaterThanOrEqualTo(this.fromTokenValue)){
            this.showNoApproveOption = true
        }else{
            this.showNoApproveOption = false
        }
    }
    checkReceipt(){
        this.stopReceiptWating = false
        this.$emit('update:conversionStatus', ConversionStatus.Confirming)
        const connex = window.connex
        const tx = connex.thor.transaction(this.txID)

        const updateReceiptStatus = async ()=>{
            let receipt = await tx.getReceipt()
            if(receipt){
                this.txReverted = receipt.reverted
                let current = connex.thor.status.head.number
                this.confirmCount = current - receipt.meta.blockNumber
                if(this.confirmCount > 12){
                    this.actionOK()
                }
            }
            console.log(await tx.getReceipt())
        }

        ;(async()=>{
            if(this.txID){
                await updateReceiptStatus()
                for(;;){
                    if(this.stopReceiptWating){
                        break
                    }
                    await connex.thor.ticker().next()
                    await updateReceiptStatus()
                }
            }
        })().catch(e=>{
            console.log(e)
        })
    }

    // Watcher
    @Watch('conversionStatus')
    onConvensionStatusChanged(val: number, oldVal: number) {
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
    transition: all 0.3s ease-in; 
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
.info-icon{
    position: relative;
    left: -6px;
    bottom: 2px;
}
.status-badge{
    position: relative;
    bottom: 2px;
}
</style>
