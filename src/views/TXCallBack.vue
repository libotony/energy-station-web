<template>
  <b-container class="pt-2">
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
    txid = ''
    conversionStatus=ConversionStatus.Initial

    created() {
        if(this.$route.params.txid && isBytes32(this.$route.params.txid)){    
            this.txid = this.$route.params.txid
        }else{
            this.$router.push('/')
        }        
    }

    mounted(){
        this.conversionStatus=ConversionStatus.Confirming
    }

    onExit(){
        this.$router.push('/')
    }
}
</script>
