import type { Post } from "@/types/types";

const API_URL = "http://localhost:8000/api/posts";

export const getPosts = async (): Promise<Post[]> => {
	const res = await fetch(API_URL);
	if (!res.ok) throw new Error("Failed to fetch posts");
	return res.json();
};

export const deletePost = async (id: number, guestToken?: string, userId?: string): Promise<boolean> => {
	const body: Record<string, string | number> = {};
	if (guestToken) body.guestToken = guestToken;
	if (userId) body.userId = userId;

	const res = await fetch(`${API_URL}/${id}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (res.ok) return true;

	const data = await res.json();
	alert(data.error);
	return false;
};
