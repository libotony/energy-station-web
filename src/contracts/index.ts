'use strict'

import EnergyStationABI from './energy-station.json'
import EnergyABI from './energy.json'

const EnergyStationAddress = '0xE831528A32474Ec04826Cd10df762FB36b83aaFf'
const EnergyAddress = '0x0000000000000000000000000000456E65726779'

const VETTokenAddress = '0x8F88d6A817C40B1e73A488430EA7F16988Db9067'

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
    VETTokenAddress,
    EnergyStationAddress,
    findInABI
}
