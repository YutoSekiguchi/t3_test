import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextauth";
import PostNew from "@/components/post/PostNew";

const PostNewPage = async () => {
  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  return <PostNew />;
}

export default PostNewPage;