<template>
    <div>
        <b-container fluid  class="d-flex flex-column justify-content-end" style="min-height:210px">
            <b-row class="mb-3">
                <b-col class="d-flex justify-content-center">
                    <span>{{confirmCount}}/12  <b-badge class="status-badge" :variant="confirmCount <= 0 ?'secondary' : txReverted ? 'danger':'success'" >{{confirmStatus}}</b-badge></span>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"
import { EventBus } from '../eventbus'

@Component
export default class TXConfirm extends Vue {
    @Prop(String) txid!:string

    confirmCount=0
    txReverted=false
    confirmThreeEmitted=false

    get confirmStatus(){
        return this.confirmCount <= 0 ?'NOT PACKED' : this.txReverted ? 'REVERTED':'SUCCESS'
    }

    created(){
        this.updateReceipt()
        EventBus.$on('tick', this.updateReceipt)
    }

    beforeDestroy(){
         EventBus.$off('tick', this.updateReceipt)
    }

    updateReceipt(){
        const connex = window._connex
        ;(async()=>{
            const tx = connex.thor.transaction(this.txid)
            let receipt = await tx.getReceipt()
            if(receipt){
                this.txReverted = receipt.reverted
                this.confirmCount = connex.thor.status.head.number - receipt.meta!.blockNumber+1
                if(!this.confirmThreeEmitted && this.confirmCount>3){
                    this.$emit('confirmThree', this.txReverted)
                    this.confirmThreeEmitted=true
                }
                if(this.confirmCount >= 12){
                    this.$emit('confirmed')
                }
            }
        })().catch(e=>{
            console.log(e)
        })
    }

}

</script>

<style>

</style>
