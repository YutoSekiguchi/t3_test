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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { User } from "@prisma/client";
import { trpc } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ImageUploading, { ImageListType } from "react-images-uploading";
import Image from "next/image";

const schema = z.object({
  name: z.string().min(3, { message: "3文字以上で入力してください" }),
  introduction: z.string().optional(),
});

type InputType = z.infer<typeof schema>;

interface ProfileProps {
  user: User;
}

const Profile = ({ user }: ProfileProps) => {
  const router = useRouter();
  const [imageUpload, setImageUpload] = useState<ImageListType>([
    {
      dataURL: user.image || "/default.png",
    },
  ]);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || "",
      introduction: user.introduction || "",
    },
  });

  const { mutate: updateUser, isLoading } = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      toast.success("プロフィールを更新しました");
      router.refresh();
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

    updateUser({
      name: data.name,
      introduction: data.introduction,
      base64Image,
    });
  };

  const onChangeImage = (imageList: ImageListType) => {
    const file = imageList[0]?.file;
    const maxFileSize = 1024 * 1024 * 5; // 2MB

    if (file && file.size > maxFileSize) {
      toast.error("5MB以下の画像を選択してください");
      return;
    }

    setImageUpload(imageList);
  };

  return (
    <div>
      <div className="text-xl font-bold text-center mb-5">プロフィール</div>
      <Form {...form}>
        <div className="mb-5">
          <ImageUploading
            value={imageUpload}
            onChange={onChangeImage}
            maxNumber={1}
            acceptType={["jpg", "jpeg", "png"]}
          >
            {({ imageList, onImageUpdate }) => (
              <div className="w-full flex flex-col items-center justify-center">
                {imageList.map((image, index) => (
                  <div key={index}>
                    {image.dataURL && (
                      <div className="w-24 h-24 relative">
                        <Image
                          src={image.dataURL}
                          fill
                          alt={user.name || "avatar"}
                          className="rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {imageList.length > 0 && (
                  <div className="text-center mt-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        onImageUpdate(0);
                      }}
                    >
                      画像を変更
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ImageUploading>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前</FormLabel>
                <FormControl>
                  <Input placeholder="名前" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>メールアドレス</FormLabel>
            <Input value={user.email || ""} disabled />
          </FormItem>

          <FormField
            control={form.control}
            name="introduction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>自己紹介</FormLabel>
                <FormControl>
                  <Textarea placeholder="自己紹介" {...field} rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "更新"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Profile;
