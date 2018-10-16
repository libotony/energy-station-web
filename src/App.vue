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
                  <b-btn text="Button" variant="primary" :disabled="convertedVET==0" @click="convertForEnergy">Convert</b-btn>
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
import { Component, Vue, Watch } from "vue-property-decorator";
import { BigNumber } from "bignumber.js";
import {
    EnergyStationABI,
    EnergyStationAddress,
    EnergyABI,
    EnergyAddress,
    findFuncInABI
} from "./contracts";

let getEnergyReturn: Connex.Thor.Method;
let getVETReturn: Connex.Thor.Method;
let convertForEnergy: Connex.Thor.Method;
let convertForVET: Connex.Thor.Method;
let enerngyApprove: Connex.Thor.Method;

interface decodedReturn {
    [index: string]: any;
}
@Component
export default class App extends Vue {
    VET2VTHO = 0;
    VTHO2VET = 0;
    convertedVTHO = "0";
    convertedVET = "0";
    created() {
        let connex = window.connex;
        if (!window.connex) {
            alert("No connex environment detacted, please download sync!");
        } else {
            getEnergyReturn = connex.thor.account(EnergyStationAddress).method(findFuncInABI("getEnergyReturn", EnergyStationABI));
            getVETReturn = connex.thor.account(EnergyStationAddress).method(findFuncInABI("getVETReturn", EnergyStationABI));
            convertForEnergy = connex.thor.account(EnergyStationAddress).method(findFuncInABI("convertForEnergy", EnergyStationABI));
            convertForVET = connex.thor.account(EnergyStationAddress).method(findFuncInABI("convertForVET", EnergyStationABI));
            enerngyApprove = connex.thor.account(EnergyAddress).method(findFuncInABI("approve", EnergyABI));
        }
    }
    calcVTHOReturn() {
        getEnergyReturn.call([new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(10)]).then(output => {
            this.convertedVTHO = new BigNumber((output.decoded as decodedReturn)["0"]).dividedBy(1e18).dp(4).toString(10);
        });
    }
    calcVETReturn() {
        getVETReturn.call([new BigNumber(this.VTHO2VET).multipliedBy(1e18).dp(0).toString(10)]).then(output => {
            this.convertedVET = new BigNumber((output.decoded as decodedReturn)["0"]).dividedBy(1e18).dp(4).toString(10);
        });
    }
    convertForVET() {
        (async () => {
            const connex = window.connex;

            const VMOutPut = await getEnergyReturn.call([new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(10)]);
            const convertedVET = new BigNumber( (VMOutPut.decoded as decodedReturn)["0"]);
            let minReturn = convertedVET.multipliedBy(0.99);

            let clause = convertForEnergy.asClause([minReturn.dp(0).toString(10)],"0x" +new BigNumber(this.VET2VTHO).multipliedBy(1e18).dp(0).toString(16));
            let signed = await connex.vendor.sign("tx", [clause]);

            let txID = await connex.thor.commit(signed.message);
            console.log(txID);
        })().catch(e => {
            console.log(e);
        });
    }
    convertForEnergy() {
        (async () => {
            const connex = window.connex;

            const amount = new BigNumber(this.VTHO2VET).multipliedBy(1e18).dp(0);
            const VMOutPut = await getEnergyReturn.call([amount.toString(10)]);
            const convertedEnergy = new BigNumber((VMOutPut.decoded as decodedReturn)["0"]);
            let minReturn = convertedEnergy.multipliedBy(0.99);

            let approveClause = enerngyApprove.asClause([EnergyStationAddress, amount.toString(10)],"0x0");
            let convertClause = convertForVET.asClause([amount.toString(10), minReturn.dp(0).toString(10)],"0x0");
            let signed = await connex.vendor.sign("tx", [ approveClause, convertClause]);

            let txID = await connex.thor.commit(signed.message);
            console.log(txID);
        })().catch(e => {
            console.log(e);
        });
    }
}
</script>

<style>
</style>