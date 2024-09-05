import { TRPCError } from "@trpc/server";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinaryに画像をアップロード
export const createCloudImage = async (base64Image: string) => {
  try {
    const imageResponse = await cloudinary.v2.uploader.upload(base64Image, {
      resource_type: "image",
      folder: "t3_practice",
    });
    return imageResponse.secure_url
  } catch (error) {
    console.log(error);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "画像のアップロードに失敗しました",
    });
  }
};

// Cloudinaryの画像を削除
export const deleteCloudImage = async (publicId: string) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "画像の削除に失敗しました",
    });
  }
};