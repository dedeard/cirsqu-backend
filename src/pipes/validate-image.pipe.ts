import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

type Options = {
  required: boolean;
  maxSize: number; // In MB
  allowedMimes: string[];
};

@Injectable()
export class ValidateImagePipe implements PipeTransform {
  private options: Options;

  constructor(options?: Partial<Options>) {
    this.options = {
      required: true,
      maxSize: 2, // Default size in MB
      allowedMimes: ['image/jpeg', 'image/png'], // Default mime types
      ...options,
    };
    this.options.maxSize *= 1024 * 1024; // Convert size from MB to bytes for internal use
  }

  async transform(value: any) {
    if (!value && this.options.required) {
      throw new BadRequestException('No file submitted');
    }
    if (value) {
      const { fileTypeFromBuffer } = await import('file-type');
      const { mime } = await fileTypeFromBuffer(value.buffer);

      if (!this.options.allowedMimes.includes(mime)) {
        throw new BadRequestException('Invalid file type');
      }

      if (value.size > this.options.maxSize) {
        throw new BadRequestException('File too large');
      }
    }

    return value;
  }
}
