import * as ImageManipulator from 'expo-image-manipulator';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  compress?: number; // 0-1
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number; // File size in bytes
}

export class ImageProcessor {
  // Process image for different use cases
  static async processImage(
    uri: string,
    options: ImageProcessingOptions = {},
  ): Promise<ProcessedImage> {
    const {
      width = 800,
      height = 600,
      quality = 0.8,
      format = 'jpeg',
      compress = 0.8,
    } = options;

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width,
            height,
          },
        },
      ],
      {
        compress,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    // Get file size
    const response = await fetch(result.uri);
    const blob = await response.blob();
    const size = blob.size;

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size,
    };
  }

  // Predefined processing for different use cases
  static async processForThumbnail(uri: string): Promise<ProcessedImage> {
    return this.processImage(uri, {
      width: 300,
      height: 200,
      quality: 0.7,
      format: 'jpeg',
      compress: 0.6,
    });
  }

  static async processForCard(uri: string): Promise<ProcessedImage> {
    return this.processImage(uri, {
      width: 400,
      height: 300,
      quality: 0.8,
      format: 'jpeg',
      compress: 0.7,
    });
  }

  static async processForDetail(uri: string): Promise<ProcessedImage> {
    return this.processImage(uri, {
      width: 800,
      height: 600,
      quality: 0.9,
      format: 'jpeg',
      compress: 0.8,
    });
  }

  static async processForHero(uri: string): Promise<ProcessedImage> {
    return this.processImage(uri, {
      width: 1200,
      height: 800,
      quality: 0.95,
      format: 'jpeg',
      compress: 0.9,
    });
  }

  // Process multiple sizes for responsive images
  static async processMultipleSizes(uri: string): Promise<{
    thumbnail: ProcessedImage;
    card: ProcessedImage;
    detail: ProcessedImage;
    hero: ProcessedImage;
  }> {
    const [thumbnail, card, detail, hero] = await Promise.all([
      this.processForThumbnail(uri),
      this.processForCard(uri),
      this.processForDetail(uri),
      this.processForHero(uri),
    ]);

    return { thumbnail, card, detail, hero };
  }

  // Get file size in human readable format
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
