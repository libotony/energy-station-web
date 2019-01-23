export enum ConversionType {
    ToVET,
    ToVTHO
}

export enum ConversionStatus {
    Initial,
    Start,
    Initiated,
    Processing,
    Confirming,
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
    conversionTime?: string;
    id: string
}

export type ABIDef = {
    [index: string]: any
}[]

export interface decodedReturn {
    [index: string]: any
}

Date.prototype.format = function (fmt) {
    var o:{[index:string]:any} = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};