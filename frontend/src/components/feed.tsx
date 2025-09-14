import { useState, useEffect, type FormEvent } from "react";
import type { Post } from "../types/index";
import getGuestToken from "../utils/guestToken";
import { deletePost, getPosts } from "@/utils/api";

const API_URL = "http://localhost:8000/api/posts";

export default function Feed() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [newPost, setNewPost] = useState("");
	const [userId, setUserId] = useState("");
	const guestToken = getGuestToken();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!newPost.trim()) return;

		await fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content: newPost, guestToken: guestToken }),
		});

		setNewPost("");

		const updatedPosts = await getPosts();
		setPosts(updatedPosts);
	};

	const handleDelete = async (id: number) => {
		const success = await deletePost(id, guestToken, userId);
		if (success) {
			const updatedPosts = await getPosts();
			setPosts(updatedPosts);
		}
	};

	useEffect(() => {
		getPosts().then(setPosts).catch(console.error);
	}, []);

	return (
		<div className="p-4 max-w-lg mx-auto">
			<form onSubmit={handleSubmit} className="flex mb-4">
				<input
					type="text"
					value={newPost}
					onChange={(e) => setNewPost(e.target.value)}
					maxLength={255}
					placeholder="Write a post..."
					className="flex-1 border p-2 rounded-l"
				/>
				<button type="submit" className="bg-blue-500 text-white px-4 rounded-r">
					Post
				</button>
			</form>

			<ul>
				{posts.map((post) => (
					<li key={post.id} className="border-b py-2 flex justify-between items-center">
						<div>
							<b>{post.authorName}</b> {post.content}
						</div>
						{post.authorToken === guestToken && (
							<button onClick={() => handleDelete(post.id)} className="text-red-500 hover:underline">
								Delete
							</button>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
