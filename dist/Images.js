export class EscPosImage {
    constructor(pixels, width, height) {
        this.data = pixels;
        this.height = height;
        this.width = width;
    }
    GetData() {
        return this.data;
    }
    GetHeight() {
        return this.height;
    }
    GetWidth() {
        return this.width;
    }
}
