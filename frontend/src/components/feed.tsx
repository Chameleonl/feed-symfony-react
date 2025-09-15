import { useState, useEffect, type FormEvent } from "react";

import type { Post } from "@/types/types";
import getGuestToken from "@/utils/guestToken";
import { deletePost, getPosts, likePost, unlikePost } from "@/utils/api";
import PostForm from "@/components/PostForm";
import PostItem from "@/components/PostItem";

const API_URL = "http://localhost:8000/api/posts";

export default function Feed() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [newPost, setNewPost] = useState("");
	const [userId, setUserId] = useState("");
	const guestToken = getGuestToken();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!newPost.trim()) return;

		if (newPost.length > 255) {
			alert("Your post is too long! Please make sure it is 255 characters or less.");
			return;
		}

		await fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Guest-Token": guestToken },
			body: JSON.stringify({ content: newPost }),
		});

		setNewPost("");

		const updatedPosts = await getPosts(guestToken);
		setPosts(updatedPosts);
	};

	const handleDelete = async (id: number) => {
		const success = await deletePost(id, guestToken);
		if (success) {
			const updatedPosts = await getPosts(guestToken);
			setPosts(updatedPosts);
			return;
		}

		return;
	};

	const handleLikeToggle = async (post: Post) => {
		// optimistic
		setPosts((prev) =>
			prev.map((p) =>
				p.id === post.id
					? {
							...p,
							likedByMe: !p.likedByMe,
							likesCount: !p.likedByMe
								? (Number(p.likesCount) + 1).toString()
								: (Number(p.likesCount) - 1).toString(),
					  }
					: p
			)
		);

		const success = post.likedByMe
			? await unlikePost(post.id, guestToken, userId)
			: await likePost(post.id, guestToken, userId);

		if (success) {
			// fetch the latest from backend to reconcile
			const updatedPosts = await getPosts(guestToken);
			setPosts(updatedPosts);
		} else {
			// revert optimistic update if failed
			setPosts((prev) =>
				prev.map((p) =>
					p.id === post.id ? { ...p, likedByMe: post.likedByMe, likesCount: post.likesCount } : p
				)
			);
		}
	};

	useEffect(() => {
		getPosts(guestToken).then(setPosts).catch(console.error);
	}, [guestToken]);

	return (
		<div className="p-4 max-w-lg mx-auto">
			<PostForm handleSubmit={handleSubmit} newPost={newPost} setNewPost={setNewPost} />
			<PostItem
				posts={posts}
				guestToken={guestToken}
				handleDelete={handleDelete}
				onLikeToggle={handleLikeToggle}
			/>
		</div>
	);
}
