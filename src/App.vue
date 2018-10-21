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
                    <b-table stacked small :items="[baseInfo]"></b-table>
                </b-card>
            </b-row>
            <b-row class="mb-3">
                <b-card bg-variant="light" class="w-75 mx-auto" title="Latest conversions">
                    <b-table striped boarderd outlined small :items="conversions" :fields="tableFields"></b-table>
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
                                <b-form-input type="number" v-model="VET2VTHO" @input="calcVTHOReturn"></b-form-input>   
                            </b-input-group> 
                        </b-form-group>
                        <b-form-group horizontal>
                        <b-input-group prepend="VTHO">
                            <b-form-input v-model="convertedVTHO" readonly></b-form-input>
                            <b-input-group-append>
                            <b-btn text="Button" variant="primary" :disabled="convertedVTHO==0" @click="convertForVET">Convert</b-btn>
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
                                <b-form-input type="number" v-model="VTHO2VET" @input="calcVETReturn"></b-form-input>   
                            </b-input-group> 
                        </b-form-group>
                        <b-form-group horizontal>
                        <b-input-group prepend="VET">
                            <b-form-input v-model="convertedVET" readonly></b-form-input>
                            <b-input-group-append>
                            <b-btn text="Button" variant="primary" :disabled="convertedVET==0" @click="convertForEnergy">Convert</b-btn>
                            </b-input-group-append>
                        </b-input-group>
                        </b-form-group>
                    </b-form-group>
                </b-card>
            </b-row>
        </div>
    </b-container>
    <b-modal v-model="showModal" centered hide-header hide-footer :body-text-variant="modalType">
        <div class="d-block text-center">
            <p style="word-wrap:break-word;" v-html="modalMsg">
            </p>
        </div>
        <b-btn class="mt-3" block :variant="'outline-'+modalType" @click="showModal=false">OK</b-btn>
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
    EnergyStationABI,
    EnergyStationAddress,
    EnergyABI,
    EnergyAddress,
    findInABI
} from "./contracts"

let getEnergyReturn: Connex.Thor.Method
let getVETReturn: Connex.Thor.Method
let convertForEnergy: Connex.Thor.Method
let convertForVET: Connex.Thor.Method
let enerngyApprove: Connex.Thor.Method
let conversionEvent: Connex.Thor.EventVisitor

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

@Component({
    components:{
        Loading
    }
})

export default class App extends Vue {
    VET2VTHO = 0
    VTHO2VET = 0
    convertedVTHO = "0"
    convertedVET = "0"

    systemMsg = ''
    showSystemMsg = false
    sysAlertType = 'primary'

    ready = false
    spinnerColor='#007bff'

    baseInfo = {
        EnergyStationAddress,
        'VET Balance': '-',
        'VTHO Balance': '-',
        'Conversion Rate':'-',
        Owner: '-'
    }
    VETTokenAddress = ''

    showModal=false
    modalMsg = ''
    modalType='success'

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


    created() {
        let connex = window.connex
        if (!window.connex) {
            this.showSysMessage("No connex environment detacted, please download sync!", 'danger')
        } else {
            getEnergyReturn = connex.thor.account(EnergyStationAddress).method(findInABI("getEnergyReturn", EnergyStationABI))
            getVETReturn = connex.thor.account(EnergyStationAddress).method(findInABI("getVETReturn", EnergyStationABI))
            convertForEnergy = connex.thor.account(EnergyStationAddress).method(findInABI("convertForEnergy", EnergyStationABI))
            convertForVET = connex.thor.account(EnergyStationAddress).method(findInABI("convertForVET", EnergyStationABI))
            enerngyApprove = connex.thor.account(EnergyAddress).method(findInABI("approve", EnergyABI))
            conversionEvent = connex.thor.account(EnergyStationAddress).event(findInABI("Conversion", EnergyStationABI))

            let InitiateFuc = async()=>{
                await this.getLastConversion()
                this.ready = true
                await this.getInitialInfo()
            }

            InitiateFuc().catch((e) => {
                console.log(e)
                this.showSysMessage("Initiate failed!", 'danger')
            })
        }
    }
    showModalMessage(msg:string, type: 'primary'|'success'|'danger' = 'danger'){
        this.modalType = type
        this.modalMsg = msg
        this.showModal = true
    }

    showSysMessage(msg:string, type: 'primary'|'success'|'danger' = 'danger'){
        this.sysAlertType = type
        this.systemMsg = msg
        this.showSystemMsg = true
    }
    calcVTHOReturn = debounce(this.getVTHOReturn, 200)
    calcVETReturn = debounce(this.getVETReturn, 200)
    getVTHOReturn() {
        if(!this.VET2VTHO){
            this.convertedVTHO = '0'
            return
        }
        getEnergyReturn.call([new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(10)]).then(output => {
            this.convertedVTHO = this.fromWeitoDisplayValue(this.exactValueFromDeocded(output ,'canAcquire'))
        })
    }
    getVETReturn() {
        if(!this.VTHO2VET){
            this.convertedVET = '0'
            return
        }
        getVETReturn.call([new BigNumber(this.VTHO2VET).multipliedBy(1e18).dp(0).toString(10)]).then(output => {
            this.convertedVET = this.fromWeitoDisplayValue(this.exactValueFromDeocded(output ,'canAcquire'))
        })
    }
    convertForVET() {
        (async () => {
            const connex = window.connex

            const VMOutPut = await getEnergyReturn.call([new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(10)])
            const convertedVET = new BigNumber((this.exactValueFromDeocded(VMOutPut ,'canAcquire')))
            let minReturn = convertedVET.multipliedBy(0.99)

            let clause = convertForEnergy.asClause([minReturn.dp(0).toString(10)],"0x" +new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(16))
            let ret = await connex.vendor.sign("tx", [{...clause, desc: `Converting ${this.VET2VTHO} VET to VTHO`}])
            this.showModalMessage(`Transaction ID: ${ret.txId}`, 'success')
        })().catch(e => {
            this.showModalMessage('Convet failed caused by: '+e.message)
        })
    }
    convertForEnergy() {
        (async () => {
            const connex = window.connex

            const amount = new BigNumber(this.VTHO2VET).multipliedBy(1e18).dp(0)
            const VMOutPut = await getEnergyReturn.call([amount.toString(10)])
            const convertedEnergy = new BigNumber(this.exactValueFromDeocded(VMOutPut ,'canAcquire'))
            let minReturn = convertedEnergy.multipliedBy(0.99)

            let approveClause = enerngyApprove.asClause([EnergyStationAddress, amount.toString(10)],"0x0")
            let convertClause = convertForVET.asClause([amount.toString(10), minReturn.dp(0).toString(10)],"0x0")

            let ret = await connex.vendor.sign("tx", [ {...approveClause,desc:`Approve EnergyStation to spent ${this.VTHO2VET} VTHO`}, {...convertClause, desc:'Convert from VTHO to VET'}])
            this.showModalMessage(`Transaction ID: ${ret.txId}`, 'success')
        })().catch(e => {
            this.showModalMessage('Convet failed caused by: '+e.message)
        })
    }
    async getLastConversion(){

        let logs = await conversionEvent.filter([]).order("desc").next(0,5)
        let conversions:Array<Conversion>= []
        for(let log of logs){
            let item:Conversion = {}
            if((log.decoded as decodedReturn)['_fromToken'] === EnergyAddress){
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
        let ret = await connex.thor.account(EnergyStationAddress).method(findInABI("vetToken", EnergyStationABI)).call([])
        this.VETTokenAddress = this.exactValueFromDeocded(ret, '0')
        ret = await connex.thor.account(this.VETTokenAddress).method(findInABI("balanceOf", EnergyABI)).call([EnergyStationAddress])
        this.baseInfo['VET Balance'] = this.fromWeitoDisplayValue(this.exactValueFromDeocded(ret, '0'))
        ret = await connex.thor.account(EnergyAddress).method(findInABI("balanceOf", EnergyABI)).call([EnergyStationAddress])
        this.baseInfo['VTHO Balance'] = this.fromWeitoDisplayValue(this.exactValueFromDeocded(ret, '0'))
        ret = await connex.thor.account(EnergyStationAddress).method(findInABI("conversionFee", EnergyStationABI)).call([])
        this.baseInfo['Conversion Rate'] = this.exactValueFromDeocded(ret, '0')/10000 + '%'
        ret = await connex.thor.account(EnergyStationAddress).method(findInABI("owner", EnergyStationABI)).call([])
        this.baseInfo['Owner'] = this.exactValueFromDeocded(ret, '0')
    }


    fromWeitoDisplayValue(input: any){
        return new BigNumber(input).dividedBy(1e18).dp(4).toString(10)
    }
    exactValueFromDeocded(output: Connex.Thor.Decoded, key:string){
        return (output.decoded as decodedReturn)[key]
    }
}
</script>

<style>
</style>