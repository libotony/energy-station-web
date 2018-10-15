'use strict'

import EnergyStationABI from './energy-station.json'
import EnergyABI from './energy.json'

const EnergyStationAddress = '0xd9552dfB78C07785EB699b4F696F31064ba2a0B7'
const EnergyAddress = '0x0000000000000000000000000000456E65726779'

const findFuncInABI = function(name: string, ABIDef: {name: string}[]) {
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
    findFuncInABI
}
