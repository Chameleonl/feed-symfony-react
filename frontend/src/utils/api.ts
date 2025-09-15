import type { Post } from "@/types/types";

const API_URL = "http://localhost:8000/api/posts";

export const getPosts = async (guestToken: string): Promise<Post[]> => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (guestToken) {
		headers["X-Guest-Token"] = guestToken;
	}

	const res = await fetch(API_URL, { headers });
	if (!res.ok) throw new Error("Failed to fetch posts");
	return res.json();
};

export const deletePost = async (id: number, guestToken: string): Promise<boolean> => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (guestToken) {
		headers["X-Guest-Token"] = guestToken;
	}

	const res = await fetch(`${API_URL}/${id}`, {
		method: "DELETE",
		headers: headers,
	});

	if (res.ok) return true;

	const data = await res.json();
	alert(data.error);
	return false;
};

export const likePost = async (id: number, guestToken?: string, userId?: string): Promise<boolean> => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (guestToken) {
		headers["X-Guest-Token"] = guestToken;
	}

	const res = await fetch(`${API_URL}/${id}/like`, {
		method: "POST",
		headers: headers,
		body: JSON.stringify({ userId }),
	});
	if (!res.ok) {
		const data = await res.json();
		alert(data.error);
		return false;
	}

	return true;
};

export const unlikePost = async (id: number, guestToken?: string, userId?: string): Promise<boolean> => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (guestToken) {
		headers["X-Guest-Token"] = guestToken;
	}

	const res = await fetch(`${API_URL}/${id}/like`, {
		method: "DELETE",
		headers: headers,
		body: JSON.stringify({ userId }),
	});
	if (!res.ok) {
		const data = await res.json();
		alert(data.error);
		return false;
	}

	return true;
};
