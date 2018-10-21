'use strict'

import EnergyStationABI from './energy-station.json'
import EnergyABI from './energy.json'

const EnergyStationAddress = '0x7C2A6c88dEf4dcaD70716e0401423e73c2cF6b4d'
const EnergyAddress = '0x0000000000000000000000000000456E65726779'

const findInABI = function (name: string, ABIDef: {[index: string]: any}[]) {
    const ABI = ABIDef.find((abi) => {
        if (abi.name === name) {
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
    EnergyStationABI,
    EnergyABI,
    EnergyAddress,
    EnergyStationAddress,
    findInABI
}
