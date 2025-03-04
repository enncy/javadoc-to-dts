
export { };


declare global {
    interface JavaObject {
        toString(): string;
        equals(obj: any): boolean;
    }
}


