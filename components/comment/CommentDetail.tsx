"use client"

import { Comment, User } from "@prisma/client"
import CommentNew from "./CommentNew";
import CommentItem from "./CommentItem";

interface CommentDetailProps {
  userId?: string;
  postId: string;
  comments: (Comment & {
    user: Pick<User, "id" | "name" | "image">;
  })[];
}

const CommentDetail = ({ userId, postId, comments }: CommentDetailProps) => {
  return (
    <div className="space-y-5">
      <CommentNew userId={userId} postId={postId} />

      <div className="border rounded-md">
        <div className="border-b bg-gray-50 rounded-t-xl p-2 sm:p-5 text-sm font-bold">
          コメント {comments.length}
        </div>

        {comments.length === 0 ? (
          <div className="text-center text-sm text-gray-500 my-10">
            コメントはありません
          </div>
        ): (
          <div>
            {comments.map((comment, index) => (
              <div key={comment.id} className={index !== comments.length -1 ? "border-b" : ""}>
                <CommentItem comment={comment} userId={userId!} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentDetail;