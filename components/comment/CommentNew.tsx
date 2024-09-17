"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { trpc } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const schema = z.object({
  content: z.string().min(3, { message: "3文字以上で入力してください" }),
});

type InputType = z.infer<typeof schema>;

interface CommentNewProps {
  userId?: string;
  postId: string;
}

const CommentNew = ({ userId, postId }: CommentNewProps) => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: "",
    },
  });

  const { mutate: createComment, isLoading } =
    trpc.comment.createComment.useMutation({
      onSuccess: () => {
        toast.success("コメントを投稿しました");
        form.reset();
        router.refresh();
      },
      onError: (error: any) => {
        toast.error("コメントの投稿に失敗しました");
        console.error(error);
      },
    });

  const onSubmit: SubmitHandler<InputType> = async (data) => {
    createComment({ postId, content: data.content });
  };

  return (
    <div className="border rounded-md p-2 sm:p-5 bg-gray-50">
      <div className="text-sm font-bold mb-2 sm:mb-5">コメントする</div>
      {userId ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="content"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="コメントを入力してください"
                      className="bg-white"
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "投稿"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="text-center text-sm text-gray-500 my-10">
          コメントするには
          <Link href="/login" className="underline text-sky-500">
            ログイン
          </Link>
          してください
        </div>
      )}
    </div>
  );
};

export default CommentNew;
