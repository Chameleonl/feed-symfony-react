import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PostResponse } from "@/types/types";
import { getGuestToken, getUserId } from "@/utils/helpers";

interface Props {
	posts: PostResponse[];
	handleDelete: (id: number) => void;
	onLikeToggle: (post: PostResponse) => void;
	deleting: { [id: number]: boolean };
	liking: { [id: number]: boolean };
}

export default function PostItem({ posts, handleDelete, onLikeToggle, deleting, liking }: Props) {
	const userId = getUserId();
	const guestToken = getGuestToken();

	return (
		<ul className="flex flex-col gap-4">
			{posts.map((post) => (
				<li key={post.id}>
					<Card className="w-full shadow-md hover:shadow-lg transition rounded-xl">
						<CardHeader className="flex items-center gap-3 pb-2">
							<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
								{post.authorName[0].toUpperCase()}
							</div>
							<div>
								<CardTitle className="text-lg font-semibold">{post.authorName}</CardTitle>
								<CardDescription className="text-sm text-gray-500">
									<div className="flex flex-col">
										<p className="mb-2">
											{new Date(post.createdAt).toLocaleString(undefined, {
												year: "numeric",
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
										{post.tags.map((tag) => (
											<span key={tag} className="bg-gray-200 px-2 rounded-full text-sm mb-2">
												{tag}
											</span>
										))}
									</div>
								</CardDescription>
							</div>
						</CardHeader>

						<CardContent className="text-left text-base py-2 break-words">{post.content}</CardContent>

						<CardFooter className="flex justify-between items-center pt-2">
							<Button
								onClick={() => onLikeToggle(post)}
								className="flex items-center gap-1"
								disabled={liking[post.id]}>
								{post.likedByMe ? "❤️" : "🤍"} {post.likesCount}
							</Button>

							{(userId ? post.authorId === userId : post.authorToken === guestToken) && (
								<Button
									variant="destructive"
									size="sm"
									onClick={() => handleDelete(post.id)}
									disabled={deleting[post.id]}>
									{deleting[post.id] ? "Deleting..." : "Delete"}
								</Button>
							)}
						</CardFooter>
					</Card>
				</li>
			))}
		</ul>
	);
}
