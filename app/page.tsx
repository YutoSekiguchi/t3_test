import { trpc } from "@/trpc/client"
import PostItem from "@/components/post/PostItem"

const Home = async () => {
  const posts = await trpc.post.getPosts()

  // 投稿がない場合
  if (posts.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500">投稿はありません</div>
    )
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  )
}

export default Home