"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z
  .object({
    password: z.string().min(8, { message: "8文字以上で入力してください" }),
    repeatedPassword: z
      .string()
      .min(8, { message: "8文字以上で入力してください" }),
  })
  .refine((data) => data.password === data.repeatedPassword, {
    message: "パスワードが一致しません",
    path: ["repeatedPassword"],
  });

type InputType = z.infer<typeof schema>;

interface ResetPasswordProps {
  token: string;
}

const ResetPassword = ({ token }: ResetPasswordProps) => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      repeatedPassword: "",
    },
  });

  const { mutate: resetPassword, isLoading } =
    trpc.auth.resetPassword.useMutation({
      onSuccess: () => {
        toast.success("パスワードをリセットしました");
        router.refresh();
        router.push("/login");
      },
      onError: (error: any) => {
        toast.error(error.message);
        console.error(error);
      },
    });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    resetPassword({ token, password: data.password });
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新しいパスワード</FormLabel>
                <Input {...field} type="password" />
                <FormMessage>
                  {form.formState.errors.password?.message}
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repeatedPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新しいパスワード（確認用）</FormLabel>
                <Input {...field} type="password" />
                <FormMessage>
                  {form.formState.errors.password?.message}
                </FormMessage>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "送信"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ResetPassword;
