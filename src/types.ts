'use strict'

export enum ConversionType {
    ToVET,
    ToVTHO
}

export enum ConversionStatus {
    Initial,
    Start,
    Initiated,
    Processing,
    Success,
    Error
}

export enum InitStatus {
    Initial = 0b00,
    Basic = 0b01,
    List = 0b10,
    Finish = 0b11
}

export interface ConversionEvent {
    conversion?: string;
    amount?: string;
    converted?: string;
    rate?: string;
    fee?: string;
}

export type ABIDef = {
    [index: string]: any
}[]

export interface decodedReturn {
    [index: string]: any
}