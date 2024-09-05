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
import { FcGoogle } from "react-icons/fc";
import { trpc } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, { message: "2文字以上で入力してください" }),
  email: z
    .string()
    .email({ message: "正しいメールアドレスを入力してください" }),
  password: z.string().min(8, { message: "8文字以上で入力してください" }),
});

type InputType = z.infer<typeof schema>;

const Signup = () => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleGoogleSignup = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/" });

      if (result?.error) {
        toast.error("Googleログインに失敗しました");
      }
    } catch (error) {
      toast.error("Googleログインに失敗しました");
    }
  };

  const { mutate: signUp, isLoading } = trpc.auth.signUp.useMutation({
    onSuccess: () => {
      toast.success("登録が完了しました");

      signIn("credentials", {
        email: form.getValues("email"),
        password: form.getValues("password"),
        callbackUrl: "/",
      });

      router.refresh();
    },
    onError: (error) => {
      toast.error("アカウントの登録に失敗しました");
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    signUp(data);
  };

  return (
    <div className="max-w-[400px] m-auto">
      <div className="text-2xl font-bold text-center mb-10">新規登録</div>

      <Button className="w-full" variant="outline" onClick={handleGoogleSignup}>
        <FcGoogle className="mr-2 w-4 h-4" />
        Googleアカウント
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
            name="name"
            control={form.control}
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

          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input placeholder="xxxx@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <Input placeholder="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-sm text-gray-500">
            サインアップすることで，利用規約，プライバシーポリシーに同意したことになります．
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "アカウント作成"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-5">
        <Link href="/login" className="text-sm text-blue-500">
          すでにアカウントをお持ちの方
        </Link>
      </div>
    </div>
  );
};

export default Signup;
