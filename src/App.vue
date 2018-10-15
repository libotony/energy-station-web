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
              <b-input-group prepend="VET" size="lg">
                <b-form-input id="vetAmount"></b-form-input>   
              </b-input-group> 
            </b-form-group>
            <b-form-group horizontal>
              <b-input-group prepend="VTHO">
                <b-form-input id="vthoAmount" readonly></b-form-input>
                <b-input-group-append>
                  <b-btn text="Button" variant="primary" disabled>Button</b-btn>
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
              <b-input-group prepend="VTHO" size="lg">
                <b-form-input id="vthoAmount"></b-form-input>   
              </b-input-group> 
            </b-form-group>
            <b-form-group horizontal>
              <b-input-group prepend="VET">
                <b-form-input id="vetAmount" readonly></b-form-input>
                <b-input-group-append>
                  <b-btn text="Button" variant="primary" disabled>Button</b-btn>
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
import { Component, Vue } from 'vue-property-decorator'

@Component({
  created(){
    let connex = window.connex


  }
})
export default class App extends Vue {}
</script>

<style>

</style>