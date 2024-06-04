import iconv from 'iconv-lite';
import { DrawerPin, Font, Justification, PDF417ErrorCorrectLevel, PDF417Type, QRErrorCorrectLevel, QRModel, RasterMode, TextMode, Underline } from './Commands';
import MutableBuffer from './MutableBuffer';
const ESC = 0x1B;
const GS = 0x1D;
export default class Printer {
    constructor(adapter, encoding = "ascii") {
        this.adapter = adapter;
        this.buffer = new MutableBuffer();
        this.encoding = encoding;
    }
    setEncoding(encoding) {
        this.encoding = encoding;
        return this;
    }
    async flush() {
        await this.adapter.write(this.buffer.flush());
        return;
    }
    init() {
        this.write(ESC);
        this.write("@");
        return this;
    }
    resetToDefault() {
        this.setInverse(false);
        this.setBold(false);
        this.setUnderline(Underline.NoUnderline);
        this.setJustification(Justification.Left);
        this.setTextMode(TextMode.Normal);
        this.setFont(Font.A);
        return this;
    }
    feed(feed = 1) {
        this.write(ESC);
        this.write("d");
        this.write(feed);
        return this;
    }
    reverse(feed = 1) {
        this.write(ESC);
        this.write("e");
        this.write(feed);
        return this;
    }
    setBold(bold = true) {
        this.write(ESC);
        this.write("E");
        this.write(bold ? 1 : 0);
        return this;
    }
    setDoubleStrike(double = true) {
        this.write(ESC);
        this.write("G");
        this.write(double ? 0xFF : 0);
        return this;
    }
    setInverse(inverse = true) {
        this.write(GS);
        this.write("B");
        this.write(inverse ? 1 : 0);
        return this;
    }
    setUnderline(value) {
        this.write(ESC);
        this.write("-");
        this.write(value);
        return this;
    }
    setJustification(value) {
        this.write(ESC);
        this.write("a");
        this.write(value);
        return this;
    }
    setFont(value) {
        this.write(ESC);
        this.write("M");
        this.write(value);
        return this;
    }
    cut(partial = false) {
        this.write(GS);
        this.write("VA");
        this.write(partial ? 1 : 0);
        return this;
    }
    openDrawer(pin = DrawerPin.Pin2) {
        this.write(ESC);
        this.write("p");
        this.write(pin);
        this.write(10);
        this.write(10);
        return this;
    }
    setColor(color) {
        this.write(ESC);
        this.write("r");
        this.write(color);
        return this;
    }
    setCodeTable(table) {
        this.write(ESC);
        this.write("t");
        this.write(table);
        return this;
    }
    setTextMode(mode) {
        this.write(ESC);
        this.write("!");
        this.write(mode);
        return this;
    }
    barcode(code, type, height, width, font, pos) {
        this.write(GS);
        this.write("H");
        this.write(pos);
        this.write(GS);
        this.write("f");
        this.write(font);
        this.write(GS);
        this.write("h");
        this.write(height);
        this.write(GS);
        this.write("w");
        this.write(width);
        this.write(GS);
        this.write("k");
        this.write(type);
        this.write(code);
        this.write(0);
        return this;
    }
    qr(code, options) {
        const model = options?.model ?? QRModel.MODEL1;
        const errorCorrect = options?.errorCorrect ?? QRErrorCorrectLevel.L;
        const size = options?.size ?? 4;
        this.write(new Uint8Array([0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, model, 0x0]));
        this.write(GS);
        this.write("(k");
        this.buffer.writeUInt16LE(code.length + 3);
        this.write(new Uint8Array([49, 80, 48]));
        this.write(code);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([3, 0, 49, 69]));
        this.write(errorCorrect);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([3, 0, 49, 67]));
        this.write(size);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([3, 0, 49, 81, 48]));
        return this;
    }
    pdf417(code, type = PDF417Type.Standard, height = 1, width = 20, columns = 0, rows = 0, error = PDF417ErrorCorrectLevel.Level1) {
        this.write(GS);
        this.write("(k");
        this.buffer.writeUInt16LE(code.length + 3);
        this.write(new Uint8Array([0x30, 0x50, 0x30]));
        this.write(code);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([3, 0, 48, 65]));
        this.write(columns);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([3, 0, 48, 66]));
        this.write(rows);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([3, 0, 48, 67]));
        this.write(width);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([3, 0, 48, 68]));
        this.write(height);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([4, 0, 48, 69, 48]));
        this.write(error);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([3, 0, 48, 70]));
        this.write(type);
        this.write(GS);
        this.write("(k");
        this.write(new Uint8Array([3, 0, 48, 81, 48]));
        return this;
    }
    beep(n, t) {
        this.write(ESC);
        this.write("B");
        if (!n) {
            n = 3;
        }
        if (!t) {
            t = 10;
        }
        this.write(n);
        this.write(t);
        return this;
    }
    setLineSpacing(spacing) {
        this.write(ESC);
        if (spacing) {
            this.write("3");
            this.write(spacing);
        }
        else {
            this.write("2");
        }
        return this;
    }
    raster(raster, mode = RasterMode.Normal) {
        if (raster) {
            const header = new Uint8Array([GS, 0x76, 0x30, mode]);
            this.buffer.write(header);
            this.buffer.writeUInt16LE(raster.GetWidth());
            this.buffer.writeUInt16LE(raster.GetHeight());
            this.buffer.write(raster.GetData());
        }
        return this;
    }
    writeLine(value, encoding) {
        this.write(`${value || ""}\n`, encoding);
        return this;
    }
    writeList(values, encoding) {
        for (const value of values) {
            this.writeLine(value, encoding);
        }
        return this;
    }
    async close() {
        await this.flush();
        await this.adapter.close();
        return this;
    }
    async open() {
        await this.adapter.open();
        return this;
    }
    clearBuffer() {
        this.buffer.clear();
        return this;
    }
    write(value, encoding) {
        if (typeof value === "number") {
            this.buffer.writeUInt8(value);
        }
        else if (typeof value === "string") {
            this.buffer.write(iconv.encode(value, encoding || this.encoding));
        }
        else {
            this.buffer.write(value);
        }
        return this;
    }
}
