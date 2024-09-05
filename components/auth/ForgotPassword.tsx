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
import { Input } from "../ui/input";
import { trpc } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  email: z
    .string()
    .email({ message: "正しいメールアドレスを入力してください" }),
});

type InputType = z.infer<typeof schema>;

const ForgotPassword = () => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: forgotPassword, isLoading } =
    trpc.auth.forgotPassword.useMutation({
      onSuccess: () => {
        toast.success("パスワードリセットのメールを送信しました");
        form.reset();
        router.refresh();
      },
      onError: (error: any) => {
        toast.error(error.message);
        console.error(error);
      },
    });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    forgotPassword(data);
  };

  return (
    <div className="max-w-[400px] m-auto">
      <div className="text-2xl font-bold mb-10 text-center">
        パスワード再設定
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input placeholder="xxx@gmail.com" {...field} />
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
            {isLoading ? <Loader2 className="animate-spin" /> : "送信"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPassword;
