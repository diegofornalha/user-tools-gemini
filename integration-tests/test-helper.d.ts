export class TestRig {
    bundlePath: string;
    testDir: string | null;
    setup(testName: any): void;
    testName: any;
    createFile(fileName: any, content: any): string;
    mkdir(dir: any): void;
    run(prompt: any, ...args: any[]): Buffer<ArrayBufferLike> & string;
    readFile(fileName: any): string;
}
//# sourceMappingURL=test-helper.d.ts.map