<template>
    <b-navbar type="dark" variant="primary" toggleable>
        <b-navbar-brand to="/">EnergyStation</b-navbar-brand>
        <div ref="wallet" class="mr-auto" />
    </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mountWallet } from '../wallet'

@Component
export default class NavBar extends Vue {
    private unmountWallet: (() => void) | null = null

    mounted() {
        this.unmountWallet = mountWallet(this.$refs.wallet as HTMLElement)
    }

    beforeDestroy() {
        if (this.unmountWallet) this.unmountWallet()
    }
}
</script>
