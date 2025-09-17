import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";

import type { PostResponse } from "@/types/types";
import { createPost, getGuestUsername } from "@/utils/helpers";
import { deletePost, getPosts, likePost, unlikePost } from "@/utils/helpers";
import AuthForm from "@/components/AuthForm";
import PostForm from "@/components/PostForm";
import PostItem from "@/components/PostItem";
import { Button } from "@/components/ui/button";
import Search from "@/components/Search";

export default function Feed() {
	const [posts, setPosts] = useState<PostResponse[]>([]);
	const [newPost, setNewPost] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [tagFilter, setTagFilter] = useState<string | null>(null);
	const [posting, setPosting] = useState(false);
	const [deleting, setDeleting] = useState<{ [id: number]: boolean }>({});
	const [liking, setLiking] = useState<{ [id: number]: boolean }>({});
	const authorName = getGuestUsername();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setPosting(true);

		if (!newPost.trim()) {
			setPosting(false);
			return;
		}

		if (newPost.length > 255) {
			toast.error("Your post is too long! Please make sure it is 255 characters or less.");
			setPosting(false);
			return;
		}

		const normalizedTags = tags.map((t) => t.trim().toLowerCase());

		const res = await createPost(newPost, authorName, normalizedTags);

		if ("error" in res) {
			toast.error(res.error);
			setPosting(false);
			return;
		}
		setNewPost("");
		setTags([]);

		const updatedPosts = await getPosts();
		if (!("error" in updatedPosts)) {
			setPosts(updatedPosts);
		}
		setPosting(false);
	};

	const handleDelete = async (id: number) => {
		setDeleting((prev) => ({ ...prev, [id]: true }));
		const success = await deletePost(id);
		if (success) {
			const updatedPosts = await getPosts();
			if (!("error" in updatedPosts)) {
				setPosts(updatedPosts);
				setDeleting((prev) => ({ ...prev, [id]: false }));
				return;
			} else {
				toast.error(updatedPosts.error);
				setDeleting((prev) => ({ ...prev, [id]: false }));
				return;
			}
		}
		setDeleting((prev) => ({ ...prev, [id]: false }));
		return;
	};

	const handleLikeToggle = async (post: PostResponse) => {
		setLiking((prev) => ({ ...prev, [post.id]: true }));
		// optimistic update first
		setPosts((prev) =>
			prev.map((p) =>
				p.id === post.id
					? { ...p, likedByMe: !p.likedByMe, likesCount: !p.likedByMe ? p.likesCount + 1 : p.likesCount - 1 }
					: p
			)
		);

		const success = post.likedByMe ? await unlikePost(post.id) : await likePost(post.id);

		if (success) {
			// fetch the latest from backend to reconcile
			const data = await getPosts();
			if ("error" in data) {
				console.error(data.error);
			} else {
				setPosts(data);
			}
		} else {
			// revert optimistic update if failed
			setPosts((prev) =>
				prev.map((p) =>
					p.id === post.id ? { ...p, likedByMe: post.likedByMe, likesCount: post.likesCount } : p
				)
			);
		}

		setLiking((prev) => ({ ...prev, [post.id]: false }));
	};

	const handleLogOut = () => {
		localStorage.removeItem("jwt");
		localStorage.removeItem("userId");
		window.location.href = "/";
	};

	useEffect(() => {
		getPosts()
			.then((data) => {
				if (!("error" in data)) {
					setPosts(data);
				} else {
					console.error("Failed to fetch posts:", data.error);
				}
			})
			.catch(console.error);
	}, []);

	return (
		<main className="flex-grow">
			<div className="container p-4 max-w-lg mx-auto">
				<div className="flex gap-4 justify-center">
					{localStorage.getItem("jwt") ? "" : <AuthForm message={"Log In"} />}
					{localStorage.getItem("jwt") ? "" : <AuthForm message={"Register"} />}
					{localStorage.getItem("jwt") ? <Button onClick={handleLogOut}>Log out</Button> : ""}
				</div>
				<PostForm
					handleSubmit={handleSubmit}
					newPost={newPost}
					setNewPost={setNewPost}
					posting={posting}
					tags={tags}
					setTags={setTags}
				/>
				<Search tagFilter={tagFilter} setTagFilter={setTagFilter} getPosts={getPosts} setPosts={setPosts} />
				<PostItem
					posts={posts}
					handleDelete={handleDelete}
					onLikeToggle={handleLikeToggle}
					deleting={deleting}
					liking={liking}
				/>
			</div>
		</main>
	);
}
