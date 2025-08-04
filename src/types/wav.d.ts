declare module 'wav' {
  import { Transform } from 'stream';

  export class Reader extends Transform {
    // Add properties and methods as needed, for now, we can keep it simple
  }

  export class Writer extends Transform {
    constructor(options?: WriterOptions);
  }

  export interface WriterOptions {
    format?: 'lpcm';
    channels?: number;
    sampleRate?: number;
    bitDepth?: number;
  }
}
