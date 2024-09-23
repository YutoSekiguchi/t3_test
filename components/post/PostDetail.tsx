"use client";

import { Post, User, Comment, CommentLike } from "@prisma/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/trpc/react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import CommentDetail from "../comment/CommentDetail";

interface PostDetailPageProps {
  post: Post & {
    user: Pick<User, "id" | "name" | "image">;
  };
  userId: string;
  comments: (Comment & { user: Pick<User, "id" | "name" | "image"> } & {
    hasLiked: boolean;
    commentLikeId: string | null;
  } & { likes: CommentLike[] })[];
  pageCount: number;
  totalComments: number;
  isSubscribed: boolean;
}

const PostDetail = ({ post, userId, comments, pageCount, totalComments, isSubscribed }: PostDetailPageProps) => {
  const router = useRouter();

  const isSubscribedPost = post.premium && !isSubscribed && post.userId !== userId;

  const content = isSubscribedPost && post.content.length > 200 ? post.content.slice(0, 200) + "..." : post.content;

  // 投稿の削除
  const { mutate: deletePost, isLoading } = trpc.post.deletePost.useMutation({
    onSuccess: () => {
      toast.success("投稿を削除しました");
      router.refresh();
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error.message);
      console.error(error);
    },
  });

  const handleDeletePost = () => {
    if (post.user.id !== userId) {
      toast.error("投稿者以外は削除できません");
      return;
    }

    deletePost({ postId: post.id });
  };

  return (
    <div className="space-y-5">
      {
        post.premium && (
          <div className="bg-gradient-radial from-blue-500 to-sky-500 rounded-md text-white font-semibold px-3 py-1 text-xs inline-block">
            有料会員限定
          </div>
        )
      }
      <div className="font-bold text-2xl break-words">{post.title}</div>
      <div>
        <Link href={`/author/${post.user.id}`}>
          <div className="flex items-center space-x-1">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src={post.user.image || "/default.png"}
                alt={post.user.name || "avatar"}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="text-sm hover:underline break-words min-w-0">
              {post.user.name} |{" "}
              {format(new Date(post.createdAt), "yyyy/MM/dd HH:mm")}
            </div>
          </div>
        </Link>
      </div>

      <div className="aspect-[16/9] relative">
        <Image
          src={post.image || "/noImage.png"}
          alt={"thumbnail"}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>

      <div className="leading-relaxed break-words whitespace-pre-wrap">
        {content}
      </div>

      {userId === post.userId && (
        <div className="flex items-center justify-end space-x-1">
          <Link href={`/post/${post.id}/edit`}>
            <div className="hover:bg-gray-100 p-2 rounded-full">
              <Pencil className="w-5 h-5" />
            </div>
          </Link>
          <button
            className="hover:bg-gray-100 p-2 rounded-full"
            disabled={isLoading}
            onClick={handleDeletePost}
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

      {
        isSubscribedPost && (
          <div className="bg-gradient-radial from-blue-500 to-sky-500 rounded-md text-white p-5 sm:p-10 text-center space-y-5">
            <div>
              この記事の続きは有料会員になるとお読みいただけます。
            </div>

            <div className="inline-block">
              {userId ? (
                <Link href="/payment">
                  <div className="w-[300px] bg-white text-blue-500 hover:bg-white/90 font-bold shadow rounded-md py-2">
                    有料プランを見る
                  </div>
                </Link>
              ) : (
                <Link href="/login">
                  <div className="w-[300px] bg-white text-blue-500 hover:bg-white/90 font-bold shadow rounded-md py-2">
                    ログインする
                  </div>
                </Link>
              )}
            </div>

            <div className="text-xs">※いつでも解約可能です</div>
            <div className="font-bold">有料会員特典</div>
            <div className="text-sm">有料記事が読み放題</div>
          </div>
        )
      }

      <CommentDetail userId={userId} postId={post.id} comments={comments} pageCount={pageCount} totalComments={totalComments} />
    </div>
  );
};

export default PostDetail;
