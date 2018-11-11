'use strict'

import EnergyStationABI from './energy-station.json'
import EnergyABI from './energy.json'

type ABIDef = {
    [index: string]: any
}[]


const EnergyStationAddress = '0x9fa31d274186019EA8eF38Cd1f08b8DEe8e82939'
const EnergyAddress = '0x0000000000000000000000000000456E65726779'

const methodOfEnergyStation = function (name: string): Connex.Thor.Method | null{
    if (window.connex) {
        let contract = window.connex.thor.account(EnergyStationAddress)
        return contract.method(findInABI(name, EnergyStationABI))
    }
    return null
}

const eventOfEnergyStation = function (name: string): Connex.Thor.EventVisitor | null {
    if (window.connex) {
        let contract = window.connex.thor.account(EnergyStationAddress)
        return contract.event(findInABI(name, EnergyStationABI))
    }
    return null
}

const methodOfEnergy = function (name: string): Connex.Thor.Method | null {
    if (window.connex) {
        let contract = window.connex.thor.account(EnergyAddress)
        return contract.method(findInABI(name, EnergyABI))
    }
    return null
}

const eventOfEnergy = function (name: string): Connex.Thor.EventVisitor | null {
    if (window.connex) {
        let contract = window.connex.thor.account(EnergyAddress)
        return contract.event(findInABI(name, EnergyABI))
    }
    return null
}

const findInABI = function (name: string, abi: ABIDef) {
    const ABI = abi.find((current) => {
        if (current.name === name) {
            return true
        } else {
            return false
        }
    })
    if (!ABI) {
        throw 'No ABI found'
    }
    return ABI;
}

export {
    EnergyStationAddress,
    methodOfEnergyStation,
    eventOfEnergyStation,
    methodOfEnergy,
    eventOfEnergy
}
