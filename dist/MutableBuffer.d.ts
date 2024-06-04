export default class MutableBuffer {
    private buffer;
    private size;
    constructor(size?: number);
    clear(): void;
    flush(): Uint8Array;
    write(data: ArrayLike<number>): MutableBuffer;
    writeUInt32LE(value: number, noAssert?: boolean): MutableBuffer;
    writeUInt16LE(value: number, noAssert?: boolean): MutableBuffer;
    writeUInt8(value: number, noAssert?: boolean): MutableBuffer;
    private resizeIfNeeded;
}
