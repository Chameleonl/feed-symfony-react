import type {
	Auth,
	CreateResponse,
	DeleteResponse,
	LikeResponse,
	ListResponse,
	LoginResponse,
	RegisterResponse,
} from "@/types/types";

const API_URL = "http://localhost:8000/api";

export function getJwt() {
	return localStorage.getItem("jwt");
}

export function getGuestToken() {
	return localStorage.getItem("guestToken");
}

export function getUserId() {
	return localStorage.getItem("userId");
}

export function setJwt(token: string) {
	localStorage.setItem("jwt", token);
}

export function setGuestToken(token: string) {
	localStorage.setItem("guestToken", token);
}

export function setUserId(token: string) {
	return localStorage.setItem("userId", token);
}

export function getAuth(): Auth {
	const jwt = getJwt();
	if (jwt) {
		return { type: "jwt", token: jwt };
	}

	let guestToken = getGuestToken();
	if (!guestToken) {
		guestToken = crypto.randomUUID();
		setGuestToken(guestToken);
	}

	return { type: "guest", token: guestToken };
}

export function getGuestUsername() {
	let username = localStorage.getItem("guestUsername");
	if (!username) {
		username = `guest${Math.floor(Math.random() * 100000)}`;
		localStorage.setItem("guestUsername", username);
	}
	return username;
}

export function getAuthHeaders(): Record<string, string> {
	const auth = getAuth();
	const headers: Record<string, string> = {};

	if (auth.type === "jwt") {
		headers["Authorization"] = "Bearer " + auth.token;
	} else if (auth.type === "guest") {
		headers["X-Guest-Token"] = auth.token;
	}

	return headers;
}

function jsonHeaders(): Record<string, string> {
	return { "Content-Type": "application/json", ...getAuthHeaders() };
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
	const headers = { ...options.headers };
	const res = await fetch(url, { ...options, headers });
	const data = await res.json();
	if (!res.ok) throw new Error(data.error || "API request failed");
	return data;
}

export async function registerUser(username: string, password: string): Promise<RegisterResponse> {
	const res = await fetch(`${API_URL}/register`, {
		method: "POST",
		headers: jsonHeaders(),
		body: JSON.stringify({ username, password }),
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || "Registration failed");
	}

	return data;
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
	const res = await fetch(`${API_URL}/login`, {
		method: "POST",
		headers: jsonHeaders(),
		body: JSON.stringify({ username, password }),
	});

	const data = await res.json();
	if (res.ok && data.token) {
		console.log(data);
		setJwt(data.token);
		if (data.user && data.user.id) {
			localStorage.setItem("userId", data.user.id);
		}
	} else {
		throw new Error(data.error || "Login failed");
	}

	return data;
}

export function logout() {
	localStorage.removeItem("jwt");
	window.location.href = "/";
}

export const getPosts = async (tag?: string): Promise<ListResponse> => {
	const headers = {
		...jsonHeaders(),
	};
	const url = tag ? `${API_URL}/posts?tag=${encodeURIComponent(tag)}` : `${API_URL}/posts`;

	return apiFetch<ListResponse>(url, { headers });
};

export async function createPost(content: string, authorName: string, tags: string[] = []): Promise<CreateResponse> {
	const headers = {
		...jsonHeaders(),
	};

	return apiFetch<CreateResponse>(`${API_URL}/posts`, {
		method: "POST",
		headers: headers,
		body: JSON.stringify({ content, authorName, tags }),
	});
}

export const deletePost = async (id: number): Promise<DeleteResponse> => {
	const headers = {
		...jsonHeaders(),
	};

	return apiFetch<DeleteResponse>(`${API_URL}/posts/${id}`, {
		method: "DELETE",
		headers: headers,
	});
};

export async function editPost(id: number, content: string, tags: string[] = []): Promise<CreateResponse> {
	const headers = {
		...jsonHeaders(),
	};

	return apiFetch<CreateResponse>(`${API_URL}/posts/${id}`, {
		method: "PUT",
		headers: headers,
		body: JSON.stringify({ id, content, tags }),
	});
}

export const likePost = async (id: number): Promise<LikeResponse> => {
	const headers = {
		...jsonHeaders(),
	};

	return apiFetch<LikeResponse>(`${API_URL}/posts/${id}/like`, {
		method: "POST",
		headers: headers,
	});
};

export const unlikePost = async (id: number): Promise<LikeResponse> => {
	const headers = {
		...jsonHeaders(),
	};

	return apiFetch<LikeResponse>(`${API_URL}/posts/${id}/like`, {
		method: "DELETE",
		headers: headers,
	});
};
