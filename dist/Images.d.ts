export interface IRaster {
    GetData(): Uint8Array;
    GetHeight(): number;
    GetWidth(): number;
}
export declare class EscPosImage implements IRaster {
    private readonly data;
    private readonly height;
    private readonly width;
    constructor(pixels: Uint8Array, width: number, height: number);
    GetData(): Uint8Array;
    GetHeight(): number;
    GetWidth(): number;
}
