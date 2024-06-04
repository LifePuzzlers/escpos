export default class MutableBuffer {
    constructor(size = 1024) {
        this.buffer = new Uint8Array(size);
        this.size = 0;
    }
    clear() {
        this.size = 0;
    }
    flush() {
        const buffer = new Uint8Array(this.buffer.slice(0, this.size));
        this.size = 0;
        return buffer;
    }
    write(data) {
        this.resizeIfNeeded(data.length);
        this.buffer.set(data, this.size);
        this.size += data.length;
        return this;
    }
    writeUInt32LE(value, noAssert) {
        this.resizeIfNeeded(4);
        this.buffer[this.size++] = (value) & 0xFF;
        this.buffer[this.size++] = (value >> 8) & 0xFF;
        this.buffer[this.size++] = (value >> 16) & 0xFF;
        this.buffer[this.size++] = (value >> 24) & 0xFF;
        return this;
    }
    writeUInt16LE(value, noAssert) {
        this.resizeIfNeeded(2);
        this.buffer[this.size++] = (value) & 0xFF;
        this.buffer[this.size++] = (value >> 8) & 0xFF;
        return this;
    }
    writeUInt8(value, noAssert) {
        this.resizeIfNeeded(1);
        this.buffer[this.size++] = value & 0xFF;
        return this;
    }
    resizeIfNeeded(need) {
        const remaining = this.buffer.length - this.size;
        if (remaining < need) {
            const oldBuffer = this.buffer;
            const factor = Math.ceil((need - remaining) / oldBuffer.length) + 1;
            this.buffer = new Uint8Array(oldBuffer.length * factor);
            this.buffer.set(oldBuffer, 0);
        }
    }
}
