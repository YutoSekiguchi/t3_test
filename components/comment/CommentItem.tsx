"use client";

import { Comment, User, CommentLike } from "@prisma/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/trpc/react";
import CommentLikeDetail from "./CommentLikeDetail";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

interface CommentItemProps {
  comment: Comment & { user: Pick<User, "id" | "name" | "image"> } & {
    hasLiked: boolean;
    commentLikeId: string | null;
  } & { likes: CommentLike[]};
  userId: string;
}

const CommentItem = ({ comment, userId }: CommentItemProps) => {
  const router = useRouter();

  const { mutate: deleteComment, isLoading } =
    trpc.comment.deleteComment.useMutation({
      onSuccess: () => {
        toast.success("コメントを削除しました");
        router.refresh();
      },
      onError: (error: any) => {
        toast.error("コメントの削除に失敗しました");
        console.error(error);
      },
    });

  const handleDeleteComment = () => {
    if (confirm("コメントを削除しますか？")) {
      deleteComment({ commentId: comment.id });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between p-2 sm:p-5 border-b">
        <Link href={`/author/${comment.user.id}`}>
          <div className="flex items-center space-x-1">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                className="rounded-full object-cover"
                alt={comment.user.name || "avatar"}
                src={comment.user.image || "/default.png"}
                fill
              />
            </div>
            <div className="text-sm hover:underline">{comment.user.name}</div>
          </div>
        </Link>
        <div className="text-sm">
          {format(new Date(comment.updatedAt), "yyyy/MM/dd HH:mm")}
        </div>
      </div>

      <div className="p-2 sm:p-5 leading-relaxed break-words whitespace-pre-wrap">
        <div>{comment.content}</div>
      </div>

      <div className="flex items-center justify-end space-x-1 pr-1 pb-1">
        <CommentLikeDetail comment={comment} userId={userId} />
        {userId === comment.userId && (
          <>
            <Link href={`/comment/${comment.id}/edit`}>
              <div className="hover:bg-gray-100 p-2 rounded-full">
                <Pencil className="w-5 h-5" />
              </div>
            </Link>

            <button
              className="hover:bg-gray-100 p-2 rounded-full"
              disabled={isLoading}
              onClick={handleDeleteComment}
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
