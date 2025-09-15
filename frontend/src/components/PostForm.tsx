import type { FormEvent } from "react";

interface Props {
	newPost: string;
	setNewPost: (value: string) => void;
	handleSubmit: (e: FormEvent) => void;
}

export default function PostForm({ newPost, setNewPost, handleSubmit }: Props) {
	return (
		<form onSubmit={handleSubmit} className="flex flex-col mb-4">
			<textarea
				value={newPost}
				onChange={(e) => setNewPost(e.target.value)}
				placeholder="Write a post..."
				className="flex-1 border p-2 rounded-l"
			/>
			<div className="flex justify-between items-center mt-1">
				<span className={`text-sm ${newPost.length > 255 ? "text-red-500" : "text-gray-500"}`}>
					{newPost.length}/255
				</span>
			</div>
			<button type="submit" className="bg-blue-500 text-white px-4 rounded-r" disabled={!newPost.trim()}>
				Post
			</button>
		</form>
	);
}
