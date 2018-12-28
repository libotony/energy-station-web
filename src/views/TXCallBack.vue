<template>
  <b-container class="pt-2">
        <b-row class="mb-2">
            <b-alert
                class="w-75 mx-auto"
                variant="danger"
                :show="showSystemMsg"  
                dismissible
                fade>
                {{systemMsg}}
            </b-alert>
        </b-row>
        <convert-modal 
        :conversion-status.sync="conversionStatus"
        :txid.sync="txid"
        v-on:exit="onExit"
        ></convert-modal>
    </b-container>
</template>

<script lang="ts">
import { isBytes32 } from '../contracts'
import { Component, Vue, Prop } from "vue-property-decorator"
import ConvertModal from '../components/convert-modal.vue'
import {ConversionStatus} from '../types'

@Component({
    components:{
        ConvertModal
    }
})

export default class TXCallBack extends Vue {

    // errormessage
    systemMsg = ''
    showSystemMsg = false

    txid = ''
    conversionStatus=ConversionStatus.Initial

    created() {
        if(this.$route.query.txid){ 
            if(Array.isArray(this.$route.query.txid)){
                this.txid = this.$route.query.txid[0]
            }else{
                this.txid = this.$route.query.txid
            }
            if(!isBytes32(this.txid)){
            this.$router.push('/')
        }
        }else{
            this.$router.push('/')
        }        
    }

    mounted(){
        if (!window.connex) {
            this.systemMsg = "No connex environment detacted, please download sync!"
            this.showSystemMsg = true
        }else{
            this.conversionStatus=ConversionStatus.Confirming
        }
    }

    onExit(){
        this.$router.push('/')
    }
}
</script>
