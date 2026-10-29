export {}

declare global {
    interface Date {
        format: (f: string) => string;
    }
}
