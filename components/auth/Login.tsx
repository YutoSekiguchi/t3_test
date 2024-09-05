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
import { FcGoogle } from "react-icons/fc";
import { trpc } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

const schema = z.object({
  email: z
    .string()
    .email({ message: "正しいメールアドレスを入力してください" }),
  password: z.string().min(8, { message: "8文字以上で入力してください" }),
});

type InputType = z.infer<typeof schema>;

const Login = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Googleログイン
  const handleGoogleLogin = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/" });

      if (result?.error) {
        toast.error("Googleログインに失敗しました");
      }
    } catch (error) {
      toast.error("Googleログインに失敗しました");
    }
  };

  const onSubmit: SubmitHandler<InputType> = async (data) => {
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error("ログインに失敗しました");
        return;
      }

      toast.success("ログインしました");
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error("ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[400px] m-auto">
      <div className="text-2xl font-bold text-center mb-10">ログイン</div>

      <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
        <FcGoogle className="mr-2 w-4 h-4" />
        Googleでログイン
      </Button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "ログイン"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-5">
        <Link className="text-sm text-blue-500" href="/reset-password">
          パスワードを忘れた方はこちら
        </Link>
      </div>

      <div className="text-center mt-5">
        <span className="text-sm text-gray-500">
          アカウントをお持ちでない方は
        </span>
        <Link href="/signup" className="text-blue-500">
          新規登録
        </Link>
      </div>
    </div>
  );
};

export default Login;
