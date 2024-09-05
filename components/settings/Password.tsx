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

const schema = z
  .object({
    currentPassword: z
      .string()
      .min(3, { message: "3文字以上で入力してください" }),
    password: z.string().min(8, { message: "8文字以上で入力してください" }),
    repeatedPassword: z
      .string()
      .min(8, { message: "8文字以上で入力してください" }),
  })
  .refine((data) => data.password === data.repeatedPassword, {
    message: "パスワードが一致しません",
    path: ["resetPassword"],
  });

type InputType = z.infer<typeof schema>;

const Password = () => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      password: "",
      repeatedPassword: "",
    },
  });

  const { mutate: updatePassword, isLoading } =
    trpc.auth.updatePassword.useMutation({
      onSuccess: () => {
        form.reset();
        toast.success("パスワードを更新しました");
        router.refresh();
      },
      onError: (error: any) => {
        toast.error(error.message);
        console.error(error);
      },
    });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    updatePassword({
      currentPassword: data.currentPassword,
      password: data.password,
    });
  };

  return (
    <div>
      <div className="text-xl font-bold text-center mb-5">パスワードの変更</div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>現在のパスワード</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新しいパスワード</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repeatedPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新しいパスワード（確認用）</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
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

export default Password;
