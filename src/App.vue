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
            <loading :active="!ready" :is-full-page="false" :color="spinnerColor" :opacity="0.6"></loading>
            <b-row class="mb-3">
                <b-card bg-variant="light" class="w-75 mx-auto" title="EnergyStaion Info">
                    <b-table stacked small :items="[baseInfo]" class="w-100 info"></b-table>
                </b-card>
            </b-row>
            <b-row class="mb-3">
                <b-card bg-variant="light" class="w-75 mx-auto" title="Latest conversions">
                    <b-table striped boarderd outlined small responsive :items="conversions" :fields="tableFields"></b-table>
                </b-card>
            </b-row>
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
                                <b-form-input type="number" v-model="VET2VTHO" :formatter="formatUnsigedInt" @input="calcVTHOReturn"></b-form-input>
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
                                <b-form-input type="number" v-model="VTHO2VET" :formatter="formatUnsigedInt" @input="calcVETReturn"></b-form-input>   
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
    </b-container>
    <b-modal v-model="showModal" 
        title="Convert Tokens" 
        header-bg-variant="primary" 
        header-text-variant="light"
        hide-header-close
        centered>
        <div v-show="!showError && !showSuccess">
            <b-container fluid class="mt-3"> 
                <b-row class="text-center" align-v="center">
                    <b-col><p><span style="font-size:1.5rem">{{fromTokenValue}}</span><span style="font-size:0.75rem;">&nbsp;&nbsp;{{fromTokenType}}</span></p></b-col>
                    <b-col><p style="font-size:3rem">⇒</p></b-col>
                    <b-col><p><span style="font-size:1.5rem">{{toTokenValue}}</span><span style="font-size:0.75rem;">&nbsp;&nbsp;{{toTokenType}}</span></p></b-col>
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
                                        <b-form-group label-class="text-muted" label="NO VTHO APPROVE CLAUSE" v-show="showNoApproveOption">
                                            <b-form-checkbox v-model="noApprove"><span class="text-muted">I have appoved enough amount before this.</span></b-form-checkbox>
                                        </b-form-group>
                                    </b-collapse>
                                </b-col>
                            </b-row>
                        </b-container>
                    </b-card>
                </b-row>
            </b-container>
        </div>
        <transition name="move-in">
            <div v-show="showError || showSuccess">
                <b-container fluid class="mt-3">
                    <b-row> 
                        <b-col class="d-flex justify-content-center"><fa-i icon="check-circle" size="6x" style="color: #28a745"></fa-i></b-col>
                    </b-row>
                    <b-row class="mt-5">
                        <p class="text-success text-center" style="word-wrap: break-word;word-break: break-all;overflow: hidden;">Success!<br>TXID: 0xdf31422daa55e2f30eba476a72c0f66eb54be65d83f4a0318c6be52db1188a0f</p>
                    </b-row>
                </b-container>
            </div>
        </transition>
        <b-btn slot="modal-footer" block variant="primary" size="lg" @click="showSuccess=true" :disabled="converting"><fa-i icon="circle-notch" spin v-show="converting"></fa-i>{{converting?'&nbsp;&nbsp;Processing':'OK'}}</b-btn>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import { Component, Vue, Watch } from "vue-property-decorator"
import debounce from 'lodash.debounce'
import { BigNumber } from "bignumber.js"
import {
    EnergyStationAddress,
    methodOfEnergyStation,
    eventOfEnergyStation,
    methodOfEnergy,
    eventOfEnergy
} from "./contracts"

interface decodedReturn {
    [index: string]: any
}
interface Conversion{
    conversion?: string;
    amount?: string;
    converted?: string;
    rate?: string;
    fee?: string;
}
enum ConversionType{
    ToVET,
    ToVTHO
}

const MIN_PRICE_LOSS = 2

@Component({
    components:{
        Loading
    }
})

export default class App extends Vue {
    // app level message
    systemMsg = ''
    showSystemMsg = false
    sysAlertType = 'primary'
    // initiate state
    ready = false
    spinnerColor='#007bff'
    // base info 
    baseInfo = {
        EnergyStationAddress,
        'VET Balance': '-',
        'VTHO Balance': '-',
        'Conversion Rate':'-',
        Owner: '-'
    }
    // last conversions
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
        fee:{
            label: 'Fee'
        }
    }
    conversions: Array<Conversion> = []
    // conversion cards
    VET2VTHO = '0'
    VTHO2VET = '0'
    convertedVTHO = '0'
    convertedVET = '0'
    calcedVTHO = new BigNumber(0)
    calcedVET = new BigNumber(0)
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
        } else {
            let InitiateFuc = async()=>{
                await Promise.all([this.getInitialInfo(), this.getLastConversion()])
                this.ready = true
            }
            InitiateFuc().catch((e) => {
                console.log(e)
                this.showSysMessage("Initiate failed!", 'danger')
            })
        }
    }
    showSysMessage(msg:string, type: 'primary'|'success'|'danger' = 'danger'){
        this.sysAlertType = type
        this.systemMsg = msg
        this.showSystemMsg = true
    }

    calcVTHOReturn = debounce(this.getVTHOReturn, 200)
    calcVETReturn = debounce(this.getVETReturn, 200)

    getVTHOReturn() {
        if(!this.VET2VTHO || isNaN(parseInt(this.VET2VTHO)) || parseInt(this.VET2VTHO)=== 0 ){
            this.convertedVTHO = '0'
            return
        }
        methodOfEnergyStation('getEnergyReturn')!.call([new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(10)],'0x0').then(VMOutPut => {
            this.calcedVTHO  = new BigNumber((this.exactValueFromDeocded(VMOutPut ,'canAcquire')))
            this.convertedVTHO = this.fromWeitoDisplayValue(this.calcedVTHO)
        })
    }
    getVETReturn() {
        if(!this.VTHO2VET || isNaN(parseInt(this.VTHO2VET)) || parseInt(this.VTHO2VET)=== 0){
            this.convertedVET = '0'
            return
        }
        methodOfEnergyStation('getVETReturn')!.call([new BigNumber(this.VTHO2VET).multipliedBy(1e18).dp(0).toString(10)], '0x0').then(VMOutPut => {
            this.calcedVET  = new BigNumber((this.exactValueFromDeocded(VMOutPut ,'canAcquire')))
            this.convertedVET = this.fromWeitoDisplayValue(this.calcedVET)
        })
    }
    proceedForEnergy() {
        this.initConvertModal(ConversionType.ToVTHO)
        this.showModal = true
    }
    proceedForVET() {
        this.initConvertModal(ConversionType.ToVET)
        // this.checkApproval()
        this.showModal = true
    }
    doConvert(){
        this.converting=true;
        (async () => {
            const connex = window.connex
            if(this.conversionType === ConversionType.ToVTHO){
                const VMOutPut = await methodOfEnergyStation('getEnergyReturn')!.call([new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(10)], '0x0')
                const convertedEnergy = new BigNumber((this.exactValueFromDeocded(VMOutPut ,'canAcquire')))
                let minReturn = convertedEnergy.dividedBy(this.priceLoss/100+1)
                
                console.log('minReturn', minReturn.dividedBy(1e18).toString())
                let clause = methodOfEnergyStation('convertForEnergy')!.asClause([minReturn.dp(0).toString(10)],"0x" +new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(16))
                let ret = await connex.vendor.sign("tx", [{...clause, desc: `Calling convert to VTHO function`}], {summary: `Converting ${this.VET2VTHO} VET to VTHO`})
                this.showSuccessMsg(`Transaction ID: ${ret.txId}`)
            }else{
                const amount = new BigNumber(this.VTHO2VET).multipliedBy(1e18).dp(0)
                const VMOutPut = await methodOfEnergyStation('getVETReturn')!.call([amount.toString(10)], '0x0')
                const convertedVET= new BigNumber(this.exactValueFromDeocded(VMOutPut ,'canAcquire'))
                let minReturn = convertedVET.dividedBy(this.priceLoss/100+1)

                
                let convertClause = methodOfEnergyStation('convertForVET')!.asClause([amount.toString(10), minReturn.dp(0).toString(10)],"0x0")
                let approveClause = methodOfEnergy('approve')!.asClause([EnergyStationAddress, amount.toString(10)],"0x0")

                let clauses = []
                if(!this.noApprove){
                    clauses.push({...approveClause,desc:`Approve EnergyStation to spent ${this.VTHO2VET} VTHO`})
                }
                clauses.push({...convertClause, desc:'Calling convert to VET function'})

                let ret = await connex.vendor.sign("tx", clauses, {summary: `Converting ${this.VTHO2VET} VTHO to VET`})
                this.showSuccessMsg(`Transaction ID: ${ret.txId}`)
            }
        })().catch(e => {
            console.log(e)
            alert('Convet failed caused by: '+e.message)
        })
    }
    async getLastConversion(){

        let logs = await eventOfEnergyStation('Conversion')!.filter([]).order("desc").next(0,5)
        let conversions:Array<Conversion>= []
        for(let log of logs){
            let item:Conversion = {}
            if((log.decoded as decodedReturn)['tradeType'] == '1'){
                item.conversion = "VTHO→VET"
                item.rate = new BigNumber(this.exactValueFromDeocded(log ,'_sellAmount')).dividedBy(this.exactValueFromDeocded(log ,'_return')).dp(4).toString(10)
                item.fee = this.fromWeitoDisplayValue(this.exactValueFromDeocded(log ,'_conversionFee'))  + 'VET'
            }else{
                item.conversion = "VET→VTHO"
                item.rate = new BigNumber(this.exactValueFromDeocded(log ,'_return')).dividedBy(this.exactValueFromDeocded(log ,'_sellAmount')).dp(4).toString(10)
                item.fee = this.fromWeitoDisplayValue(this.exactValueFromDeocded(log ,'_conversionFee'))  + 'VTHO'
            }
            item.amount = this.fromWeitoDisplayValue(this.exactValueFromDeocded(log ,'_sellAmount'))
            item.converted = this.fromWeitoDisplayValue(this.exactValueFromDeocded(log ,'_return'))
            conversions.push(item)
        }
        this.conversions = conversions.reverse()
    
    }
    async getInitialInfo(){
        let connex = window.connex;
        let ret = await methodOfEnergyStation('vetVirtualBalance')!.call([], '0x0')
        this.baseInfo['VET Balance'] = this.fromWeitoDisplayValue(this.exactValueFromDeocded(ret, '0'))
        ret = await methodOfEnergyStation('energyVirtualBalance')!.call([], '0x0')        
        this.baseInfo['VTHO Balance'] = this.fromWeitoDisplayValue(this.exactValueFromDeocded(ret, '0'))
        ret = await methodOfEnergyStation('conversionFee')!.call([], '0x0')
        this.baseInfo['Conversion Rate'] = this.exactValueFromDeocded(ret, '0')/10000 + '%'
        ret = await methodOfEnergyStation('owner')!.call([], '0x0')  
        this.baseInfo['Owner'] = this.exactValueFromDeocded(ret, '0')
    }
    fromWeitoDisplayValue(input: any){
        return new BigNumber(input).dividedBy(1e18).dp(4).toString(10)
    }
    exactValueFromDeocded(output: Connex.Thor.Decoded, key:string){
        return (output.decoded as decodedReturn)[key]
    }
    formatUnsigedInt(input: string){
        if(!isNaN(parseInt(input)) && parseInt(input)>= 0){
            return parseInt(input)
        }else{
            return '0'
        }
    }
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
    calcPriceLimit = debounce(this.getPriceLimit, 200)
    getPriceLimit(){
        if(this.conversionType === ConversionType.ToVTHO){
            this.priceLimit = new BigNumber(this.VET2VTHO).multipliedBy(1e18).dividedBy(this.calcedVTHO).multipliedBy(1+this.priceLoss/100).dp(6).toString(10)
        }else{
            this.priceLimit = new BigNumber(this.VTHO2VET).multipliedBy(1e18).dividedBy(this.calcedVET).multipliedBy(1+this.priceLoss/100).dp(6).toString(10)
        }
    }
    initConvertModal(conversionType: ConversionType){
        this.conversionType = conversionType
        if(conversionType === ConversionType.ToVET){
            this.fromTokenValue = this.VTHO2VET
            this.toTokenValue = this.convertedVET
        }else{
            this.fromTokenValue = this.VET2VTHO
            this.toTokenValue = this.convertedVTHO
        }
        this.showAdvanced = false
        this.getPriceLimit()
        this.priceLoss = 2
        this.showNoApproveOption = false
        this.noApprove = false
        this.converting=false
        this.showSuccess=false
        this.showError = false
        this.resultMsg = ''
    }
    // showErrorMsg(msg: string){
        
    // }
    showSuccessMsg(msg: string){
        this.resultMsg = msg
        this.showSuccess = true
    }
    async checkApproval(){
        if(this.conversionType !== ConversionType.ToVET){
            return
        }
        // TODO: need sync to implement link account
        let spender = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed'
        let ret = await methodOfEnergy('allowance')!.call([spender, EnergyStationAddress],'0x0')
        const remaining  =  this.exactValueFromDeocded(ret, 'remaining')
        if(new BigNumber(remaining).dividedBy(1e18).isGreaterThanOrEqualTo(this.VTHO2VET)){
            this.showNoApproveOption = true
        }else{
            this.showNoApproveOption = false
        }
    }
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
    get convertRate(){
        if(this.conversionType === ConversionType.ToVTHO){
            return new BigNumber(this.VET2VTHO).multipliedBy(1e18).dividedBy(this.calcedVTHO).dp(6).toString(10)
        }else{
            return new BigNumber(this.VTHO2VET).multipliedBy(1e18).dividedBy(this.calcedVET).dp(6).toString(10)
        }
    }
}
</script>

<style>
.info tr div{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.advanced{
    font-size: 0.75rem
}
.move-in-enter-active { 
    transition: all 0.5s ease-in; 
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
</style>