import { log } from "node:console";
import fs from "node:fs";
import path from "node:path";

const dataDir = process.env.DATA_DIR ?? "./data";
const IMAGE_DIR = path.join(dataDir, "images");

export class ImagesService {

  static ensureDir() {
    if (!fs.existsSync(IMAGE_DIR)) {
      fs.mkdirSync(IMAGE_DIR, { recursive: true });
    }
  }

  /**
   * Absolute path of an image, creating the directory first so a caller that
   * writes the file itself — ffmpeg, in poster.ts — has somewhere to put it.
   */
  static pathFor(filename: string): string {
    ImagesService.ensureDir();

    return path.join(IMAGE_DIR, filename);
  }

  static exists(filename: string): boolean {
    try {
      return fs.existsSync(path.join(IMAGE_DIR, filename));
    } catch {
      return false;
    }
  }

  static async download(url: string, filename: string): Promise<string | null> {
    try {
      ImagesService.ensureDir();

      const res = await fetch(url);
      if (!res.ok) return null;

      const buffer = Buffer.from(await res.arrayBuffer());

      const filePath = path.join(IMAGE_DIR, filename);

      fs.writeFileSync(filePath, buffer);

      return `/images/${filename}`;
    } catch (e) {
      console.error("Image download error:", e);
      return null;
    }
  }

  static async remove(filename: string) {
    const sanitizedFilename = filename.split('/').pop() ?? filename;

    try {
      const filePath = path.join(IMAGE_DIR, sanitizedFilename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      console.error("Image delete error:", e);
    }
  }
}