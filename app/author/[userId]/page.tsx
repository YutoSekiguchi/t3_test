import { trpc } from "@/trpc/client";
import AuthorDetail from "@/components/author/AuthorDetail";

interface AuthorPageProps {
  params: {
    userId: string;
  }
}

const AuthorPage = async ({ params }: AuthorPageProps) => {
  const { userId } = params;

  const user = await trpc.user.getUserByIdPost({ userId });

  if(!user) {
    return (
      <div className="text-center">
        ユーザは存在しません
      </div>
    )
  }

  return <AuthorDetail user={user} />
}

export default AuthorPage;