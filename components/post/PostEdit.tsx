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
  FormLabel,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { trpc } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Post } from "@prisma/client";
import { Loader2 } from "lucide-react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import Image from "next/image";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(3, { message: "3文字以上で入力してください" }),
  content: z.string().min(10, { message: "10文字以上で入力してください" }),
});

type InputType = z.infer<typeof schema>;

interface PostEditProps {
  post: Post;
}

const PostEdit = ({ post }: PostEditProps) => {
  const router = useRouter();
  const [imageUpload, setImageUpload] = useState<ImageListType>([
    {
      dataURL: post.image || "/noImage.png",
    },
  ]);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title || "",
      content: post.content || "",
    },
  });

  const { mutate: updatePost, isLoading } = trpc.post.updatePost.useMutation({
    onSuccess: () => {
      toast.success("投稿を更新しました");
      router.refresh();
      router.push(`/post/${post.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message);
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<InputType> = async (data) => {
    let base64Image;

    if (
      imageUpload[0].dataURL &&
      imageUpload[0].dataURL.startsWith("data:image")
    ) {
      base64Image = imageUpload[0].dataURL;
    }

    updatePost({
      postId: post.id,
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
      <div className="text-2xl font-bold text-center mb-5">投稿編集</div>
      <Form {...form}>
        <div className="mb-5">
          <FormLabel>サムネイル</FormLabel>
          <div className="mt-2">
            <ImageUploading
              value={imageUpload}
              onChange={onChangeImage}
              maxNumber={1}
              acceptType={["jpg", "jpeg", "png"]}
            >
              {({ imageList, onImageUpdate }) => (
                <div className="w-full">
                  {imageList.map((image, index) => (
                    <div key={index}>
                      {image.dataURL && (
                        <div className="aspect-[16/9] relative">
                          <Image
                            src={image.dataURL}
                            alt="thumbnail"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {imageList.length == 0 && (
                    <div className="text-center mt-3">
                      <Button
                        variant="outline"
                        onClick={() => onImageUpdate(0)}
                      >
                        画像を変更
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
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input placeholder="投稿のタイトル" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="content"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>本文</FormLabel>
                <FormControl>
                  <Textarea placeholder="本文" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              "更新"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PostEdit;
