'use strict'
import EnergyStationABI from './energy-station.json'
import EnergyABI from './energy.json'
import { ABIDef, decodedReturn } from '../types'
import {BigNumber} from 'bignumber.js'
import { Connex } from '@vechain/connex'

export const EnergyStationAddress = '0xD015D91B42BEd5FeaF242082b11B83B431abBf4f'
export const EnergyAddress = '0x0000000000000000000000000000456E65726779'

export const methodOfEnergyStation = function (name: string, thor: Connex.Thor): Connex.Thor.Account.Method {
    return thor.account(EnergyStationAddress).method(findInABI(name, EnergyStationABI))
}

export const eventOfEnergyStation = function (name: string, thor: Connex.Thor): Connex.Thor.Account.Event {
    return thor.account(EnergyStationAddress).event(findInABI(name, EnergyStationABI))
}

export const methodOfEnergy = function (name: string, thor: Connex.Thor): Connex.Thor.Account.Method {
    return thor.account(EnergyAddress).method(findInABI(name, EnergyABI))
}

export const eventOfEnergy = function (name: string, thor: Connex.Thor): Connex.Thor.Account.Event {
    return thor.account(EnergyAddress).event(findInABI(name, EnergyABI))
}

export const findInABI = function (name: string, abi: ABIDef) {
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

export const extractValueFromDecoded = function(output: {decoded?: object|undefined}, key: string){
    return (output.decoded as decodedReturn)[key]
}

export const fromWeiToDisplayValue = function(input: any){
    return new BigNumber(input).dividedBy(1e18).dp(4).toString(10)
}

export const fromWeiToDisplayValueWithThousandth = function (input: any) {
    return new BigNumber(input).dividedBy(1e18).dp(4).toFormat()
}

export const isBytes32 = function(val: string) {
    return /^0x[0-9a-f]{64}$/i.test(val)
}
