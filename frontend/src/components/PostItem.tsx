import type { Post } from "@/types/types";

interface Props {
	posts: Post[];
	guestToken: string;
	handleDelete: (id: number) => void;
	onLikeToggle: (post: Post) => void;
}

export default function PostItem({ posts, guestToken, handleDelete, onLikeToggle }: Props) {
	return (
		<ul>
			{posts.map((post) => (
				<li key={post.id} className="border-b py-2 flex justify-between items-center">
					<div>
						<b>{post.authorName}</b> {post.content}
					</div>
					<div className="flex gap-2">
						<p>{post.createdAt}</p>
						<button
							onClick={() => onLikeToggle(post)}
							className={post.likedByMe ? "text-blue-500 font-bold" : "text-gray-500"}>
							{post.likedByMe ? "❤️" : "🤍"} ({post.likesCount})
						</button>
						{post.authorToken === guestToken && (
							<button onClick={() => handleDelete(post.id)} className="text-red-500 hover:underline">
								Delete
							</button>
						)}
					</div>
				</li>
			))}
		</ul>
	);
}
