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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { Comment } from "@prisma/client";
import { trpc } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  content: z.string().min(3, { message: "3文字以上で入力してください" }),
});

type InputType = z.infer<typeof schema>;

interface CommentEditProps {
  comment: Comment;
}

const CommentEdit = ({ comment }: CommentEditProps) => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: comment.content || "",
    },
  });

  const { mutate: updateComment, isLoading } =
    trpc.comment.updateComment.useMutation({
      onSuccess: ({ postId }) => {
        toast.success("コメントを更新しました");
        router.refresh();
        router.push(`/post/${postId}`);
      },
      onError: (error: any) => {
        toast.error("コメントの更新に失敗しました");
        console.error(error);
      },
    });

  const onSubmit: SubmitHandler<InputType> = async (data) => {
    updateComment({ commentId: comment.id, content: data.content });
  };

  return (
    <div>
      <div className="text-2xl font-bold text-center mb-5">コメント編集</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>コメント</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="コメントの内容" rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "更新"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CommentEdit;
