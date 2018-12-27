<template>
  <b-container class="pt-2">
        <b-row class="mb-2">
            <b-alert
                class="w-75 mx-auto"
                variant="danger"
                :show="showSystemMsg"  
                dismissible=""
                fade>
                {{systemMsg}}
            </b-alert>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { isBytes32 } from '../contracts'
import { Component, Vue, Prop } from "vue-property-decorator"

@Component
export default class TXCallBack extends Vue {
    @Prop(Number) txid!: string

    // errormessage
    systemMsg = ''
    showSystemMsg = false


    created() {
        if(!isBytes32(this.txid)){
            this.$router.push('/')
        }
        if (!window.connex) {
            this.systemMsg = "No connex environment detacted, please download sync!"
            this.showSystemMsg = true
        }
    }

    exit(){

    }
}
</script>
