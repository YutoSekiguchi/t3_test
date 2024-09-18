import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextauth";
import { trpc } from "@/trpc/client";
import CommentEdit from "@/components/comment/CommentEdit";

interface CommentEditPageProps {
  params: {
    commentId: string;
  }
}

const CommentEditPage = async ({ params }: CommentEditPageProps) => {
  const { commentId } = params;

  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  const comment = await trpc.comment.getCommentById({ commentId });

  if (!comment) {
    return (
      <div className="text-center text-sm text-gray-500">
        コメントはありません
      </div>
    )
  }

  if (user?.id !== comment.userId) {
    return <div className="text-center">編集権限がありませんkenngenngaarimasenn</div>
  }

  return <CommentEdit comment={comment} />
}

export default CommentEditPage