"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { trpc } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ImageUploading, { ImageListType } from "react-images-uploading";
import Image from "next/image";

const schema = z.object({
  title: z.string().min(3, { message: "3文字以上で入力してください" }),
  content: z.string().min(10, { message: "10文字以上で入力してください" }),
});

type InputType = z.infer<typeof schema>;

const PostNew = () => {
  const router = useRouter();
  const [imageUpload, setImageUpload] = useState<ImageListType>([]);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // 新規投稿
  const { mutate: createPost, isLoading } = trpc.post.createPost.useMutation({
    onSuccess: ({ id }: any) => {
      toast.success("投稿しました");
      router.refresh();
      router.push(`/post/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.message);
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<InputType> = async (data) => {
    let base64Image;

    if (imageUpload.length) {
      base64Image = imageUpload[0].dataURL;
    }

    createPost({
      title: data.title,
      content: data.content,
      base64Image,
    });
  };

  const onChangeImage = (imageList: ImageListType) => {
    const file = imageList[0]?.file;
    const maxFileSize = 5 * 1024 * 1024;

    if (file && file.size > maxFileSize) {
      toast.error("5MB以下の画像を選択してください");
      return;
    }

    setImageUpload(imageList);
  };

  return (
    <div>
      <div className="text-2xl font-bold mb-5 text-center">新規投稿</div>
      <Form {...form}>
        <div className="mb-3">
          <FormLabel>サムネイル</FormLabel>
          <div className="mt-2">
            <ImageUploading
              value={imageUpload}
              onChange={onChangeImage}
              maxNumber={1}
              acceptType={["jpg", "jpeg", "png"]}
            >
              {({ imageList, onImageUpload, onImageUpdate, dragProps }) => (
                <div className="w-ful">
                  {imageList.length == 0 && (
                    <button
                      className="w-full border-2 border-dashed rounded-md h-32 hover:bg-gray-50 mb-3"
                      onClick={onImageUpload}
                      {...dragProps}
                    >
                      <div className="text-gray-400 font-bold mb-2">
                        ファイル選択またはドロップ
                      </div>
                      <div className="text-gray-400 text-xs">
                        ファイル形式：jpg, jpeg, png
                      </div>
                      <div className="text-gray-400 text-xs">
                        最大サイズ：5MB
                      </div>
                    </button>
                  )}
                  {imageList.map((image, index) => (
                    <div key={index}>
                      {image.dataURL && (
                        <div className="aspect-[16/9] relative">
                          <Image
                            fill
                            src={image.dataURL}
                            alt="thumbnail"
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {imageList.length > 0 && (
                    <div className="text-center mt-3">
                      <Button
                        variant="outline"
                        onClick={() => onImageUpdate(0)}
                      >
                        画像変更
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ImageUploading>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <Textarea placeholder="投稿の内容" rows={15} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "投稿"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PostNew;
