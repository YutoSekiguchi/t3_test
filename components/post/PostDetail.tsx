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
}

const PostDetail = ({ post, userId, comments }: PostDetailPageProps) => {
  const router = useRouter();

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
        {post.content}
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

      <CommentDetail userId={userId} postId={post.id} comments={comments} />
    </div>
  );
};

export default PostDetail;
