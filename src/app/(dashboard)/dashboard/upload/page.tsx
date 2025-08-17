import { ImageUpload } from "@/components/dashboard/upload/image-upload";
import { ImageViewer } from "@/components/dashboard/upload/image-viewer";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">图片上传到 Cloudflare R2</h1>
          <p className="text-gray-600">使用 OpenNext 和 Cloudflare R2 实现图片上传和获取</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">上传图片</h2>
            <ImageUpload />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">查看图片</h2>
            <ImageViewer />
          </div>
        </div>
      </div>
    </main>
  );
}
