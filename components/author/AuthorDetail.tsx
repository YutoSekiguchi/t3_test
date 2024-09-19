"use client";

import { Post, User } from "@prisma/client";
import { userPostPerPage } from "@/lib/utils";
import Image from "next/image";
import AuthorPostItem from "./AuthorPostItem";
import PaginationButton from "@/components/pagers/PaginationButton";

interface AuthorDetailProps {
  user: User & {
    posts: Post[];
  };
  pageCount: number;
  totalPosts: number;
}

const AuthorDetail = ({ user, pageCount, totalPosts }: AuthorDetailProps) => {
  return (
    <div>
      <div className="flex justify-center mb-5">
        <div className="relative w-28 h-28 flex-shrink-0">
          <Image
            src={user.image || "/default.png"}
            alt={user.name || "avatar"}
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>
      <div className="space-y-5 break-words whitespace-pre-wrap mb-5">
        <div className="font-bold text-xl text-center">{user.name}</div>
        <div className="leading-relaxed">{user.introduction}</div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="font-bold mb-1">投稿 {totalPosts}</div>
          <hr />
        </div>

        {user.posts.length === 0 ? (
          <div className="text-center text-sm text-gray-500">
            投稿はありません
          </div>
        ): (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 break-words">
            {user.posts.map((post) => (
              <AuthorPostItem key={post.id} post={post} />
            ))}
          </div>
        )}
        {user.posts.length !== 0 && (
          <PaginationButton pageCount={pageCount} displayPerPage={userPostPerPage} />
        )}
      </div>
    </div>
  );
}

export default AuthorDetail;