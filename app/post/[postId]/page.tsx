import { trpc } from "@/trpc/client";
import { getAuthSession } from "@/lib/nextauth";
import PostDetail from "@/components/post/PostDetail";

interface PostDetailPageProps {
  params: {
    postId: string;
  }
}

const PostDetailPage = async ({ params }: PostDetailPageProps) => {
  const { postId } = params;

  const user = await getAuthSession();
  const post = await trpc.post.getPostById({ postId });

  if(!post) {
    return (
      <div className="text-center text-sm text-gray-500">
        投稿はありません
      </div>
    )
  }

  const { comments } = await trpc.comment.getComments({
    userId: user?.id!,
    postId
  })

  return <PostDetail post={post} userId={user?.id!} comments={comments} />

}

export default PostDetailPage