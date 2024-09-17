import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextauth";
import { trpc } from "@/trpc/client";
import PostEdit from "@/components/post/PostEdit";

interface PostEditPageProps {
  params: {
    postId: string;
  }
}

const PostEditPage = async ({ params }: PostEditPageProps) => {
  const { postId } = params;

  const user = await getAuthSession();
  const post = await trpc.post.getPostById({ postId });

  if (!user) {
    redirect("/login");
  }
  
  if(!post) {
    return (
      <div className="text-center text-sm text-gray-500">
        投稿はありません
      </div>
    )
  }

  if(user?.id !== post.userId) {
    return <div className="text-center">編集できません</div>
  }

  return <PostEdit post={post} />
}

export default PostEditPage