const store = {
    debug: false,
    state: {
       linkedAddr: ''
    },
    setLinkedAddrAction(newValue:string) {
        if (this.debug) console.log('setLinkedAddrAction triggered with', newValue)
        this.state.linkedAddr = newValue
    }
}

export { store }