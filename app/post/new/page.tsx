import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextauth";
import PostNew from "@/components/post/PostNew";

const PostNewPage = async () => {
  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    return (
      <div className="text-center text-sm text-gray-500">
        投稿権限がありません
      </div>
    )
  }

  return <PostNew />;
}

export default PostNewPage;