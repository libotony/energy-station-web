<template>
  <div id="app">
    <b-navbar class="navbar navbar-dark bg-primary">
      <b-navbar-brand>EnergyStation</b-navbar-brand>
    </b-navbar>
    <b-container class="pt-5">
      <b-row class="mb-5">
        <b-card bg-variant="light" class="w-75 mx-auto">
          <b-form-group horizontal
                        breakpoint="lg"
                        label="VET to VeThor"
                        label-size="lg"
                        label-class="font-weight-bold pt-0"
                        class="mb-0">
            <b-form-group horizontal>
              <b-input-group prepend="VET">
                <b-form-input type="number" v-model="VET2VTHO"></b-form-input>   
                <b-input-group-append>
                  <b-btn text="Button" variant="primary" :disabled="VET2VTHO==='' ||VET2VTHO===0" @click="calcVTHOReturn">Calculate</b-btn>
                </b-input-group-append>
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
      <b-row>
        <b-card bg-variant="light" class="w-75 mx-auto">
          <b-form-group horizontal
                        breakpoint="lg"
                        label="VeThor to VET"
                        label-size="lg"
                        label-class="font-weight-bold pt-0"
                        class="mb-0">
            <b-form-group horizontal>
              <b-input-group prepend="VTHO">
                <b-form-input type="number" v-model="VTHO2VET"></b-form-input>   
                <b-input-group-append>
                  <b-btn text="Button" variant="primary" :disabled="VTHO2VET===''||VTHO2VET===0" @click="calcVETReturn">Calculate</b-btn>
                </b-input-group-append>
              </b-input-group> 
            </b-form-group>
            <b-form-group horizontal>
              <b-input-group prepend="VET ">
                <b-form-input v-model="convertedVET" readonly></b-form-input>
                <b-input-group-append>
                  <b-btn text="Button" variant="primary" :disabled="convertedVET==0">Convert</b-btn>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-form-group>
        </b-card>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { EnergyStationABI, EnergyStationAddress, findFuncInABI } from './contracts'

let getEnergyReturn: Connex.Thor.Method 
let getVETReturn: Connex.Thor.Method 
let convertForEnergy: Connex.Thor.Method

@Component
export default class App extends Vue {
  VET2VTHO = 0
  VTHO2VET = 0
  convertedVTHO =0
  convertedVET =0
  created(){
    let connex = window.connex
    if(!window.connex){
      alert('No connex environment detacted, please download sync!')
    }else{
      getEnergyReturn = connex.thor.account(EnergyStationAddress).method(findFuncInABI('getEnergyReturn', EnergyStationABI))
      getVETReturn = connex.thor.account(EnergyStationAddress).method(findFuncInABI('getVETReturn', EnergyStationABI))
      convertForEnergy = connex.thor.account(EnergyStationAddress).method(findFuncInABI('convertForEnergy', EnergyStationABI))
    }
  }
  calcVTHOReturn(){
    getEnergyReturn.call([this.VET2VTHO]).then(output=>{
      this.convertedVTHO = (output.decoded as {[index:string]:number})['0']
    })
  }
  calcVETReturn(){
    getVETReturn.call([this.VTHO2VET]).then(output=>{
      this.convertedVET = (output.decoded as {[index:string]:number})['0']
    })
  }
  convertForVET(){
    (async ()=>{
      const VMOutPut = await getEnergyReturn.call([this.VET2VTHO])
      const convertedVET = (VMOutPut.decoded as {[index:string]:number})['0']
      let minReturn = convertedVET * 0.99
      console.log(typeof minReturn)
      let clause = convertForEnergy.asClause([10], '0x'+this.VET2VTHO.toString(16))
      let result = await connex.vendor.sign('tx', [clause])
      console.log(result)
    })().catch(e=>{
      console.log(e)
    })
  }
  
}
</script>

<style>

</style>