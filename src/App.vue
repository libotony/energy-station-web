<template>
    <div id="app">
        <b-navbar class="navbar navbar-dark bg-primary">
            <b-navbar-brand to="home">EnergyStation</b-navbar-brand>
        </b-navbar>
        <router-view/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"

@Component
export default class App extends Vue {}
</script>