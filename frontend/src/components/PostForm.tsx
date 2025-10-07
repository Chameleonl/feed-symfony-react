import { TagsInput } from "@/components/TagsInput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { type FormEvent } from "react";

interface Props {
	newPost: string;
	setNewPost: (value: string) => void;
	handleSubmit: (e: FormEvent) => void;
	posting: boolean;
	tags: string[];
	setTags: (tags: string[]) => void;
}

export default function PostForm({ newPost, setNewPost, handleSubmit, posting, tags, setTags }: Props) {
	return (
		<form onSubmit={handleSubmit} className="flex flex-col mb-4 gap-4">
			<Label htmlFor="message" className="font-bold">
				Your message
			</Label>
			<Textarea
				id="message"
				value={newPost}
				onChange={(e) => setNewPost(e.target.value)}
				placeholder="Write a post..."
				className="resize-none"
			/>
			<div className="flex justify-between items-center mt-1">
				<span className={`text-sm ${newPost.length > 255 ? "text-red-500" : "text-gray-500"}`}>
					{newPost.length}/255
				</span>
			</div>
			<TagsInput
				value={tags}
				onChange={setTags}
				name="tags"
				placeHolder="Add up to 3 tags (optional)"
				maxTagsCount={3}
			/>
			<Button type="submit" disabled={posting}>
				{posting ? "Posting..." : "Post"}
			</Button>
		</form>
	);
}
