"use client"

import CommentNew from "./CommentNew";

interface CommentDetailProps {
  userId?: string;
  postId: string;
}

const CommentDetail = ({ userId, postId }: CommentDetailProps) => {
  return (
    <div className="space-y-5">
      <CommentNew userId={userId} postId={postId} />
    </div>
  );
}

export default CommentDetail;