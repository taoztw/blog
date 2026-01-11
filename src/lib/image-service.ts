export class ImageService {
  //  添加R2公开URL配置选项
  private static R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  /**
   * 获取图片URL - 优先使用R2公开URL，否则使用API路由
   */
  static getImageUrl(key: string): string {
    if (this.R2_PUBLIC_URL) {
      //  如果配置了R2公开URL，直接返回公开链接
      return `${this.R2_PUBLIC_URL}/${key}`;
    } else {
      //  否则使用API路由，对key进行URL编码以处理特殊字符
      return `/api/images/${encodeURIComponent(key)}`;
    }
  }

  /**
   * 验证图片key格式
   */
  static isValidKey(key: string): boolean {
    return key.length > 0 && !key.includes("..");
  }

  /**
   * 从key中提取文件名
   */
  static getFilenameFromKey(key: string): string {
    return key.split("/").pop() || key;
  }

  /**
   * 获取图片信息
   */
  static async getImageInfo(key: string) {
    try {
      const response = await fetch(`/api/images/${encodeURIComponent(key)}`, {
        method: "HEAD",
      });

      if (!response.ok) {
        throw new Error("Image not found");
      }

      return {
        contentType: response.headers.get("content-type"),
        size: response.headers.get("content-length"),
        lastModified: response.headers.get("last-modified"),
      };
    } catch (error) {
      console.error("Error getting image info:", error);
      throw error;
    }
  }
}
