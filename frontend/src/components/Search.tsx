import { Button } from "@/components/ui/button";
import type { PostResponse } from "@/types/types";

interface SearchProps {
	tagFilter: string | null;
	setTagFilter: (value: string | null) => void;
	getPosts: (tag?: string) => Promise<PostResponse[] | { error: string }>;
	setPosts: (value: PostResponse[]) => void;
}

export default function Search({ tagFilter, setTagFilter, getPosts, setPosts }: SearchProps) {
	return (
		<div className="flex gap-2 mb-4">
			<input
				type="text"
				placeholder="Search by tag"
				value={tagFilter || ""}
				onChange={(e) => setTagFilter(e.target.value)}
				className="border rounded px-2 py-1 flex-grow"
			/>
			<Button
				onClick={async () => {
					const normalizedTag = tagFilter?.trim().toLowerCase();
					const postsData = await getPosts(normalizedTag);
					if (!("error" in postsData)) setPosts(postsData);
				}}
				className="text-white px-3 py-1 rounded">
				Search
			</Button>
			<button
				onClick={async () => {
					setTagFilter(null);
					const allPosts = await getPosts();
					if (!("error" in allPosts)) setPosts(allPosts);
				}}
				className="bg-gray-300 px-3 py-1 rounded">
				Reset
			</button>
		</div>
	);
}
