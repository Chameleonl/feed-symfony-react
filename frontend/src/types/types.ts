export type ApiError = { error: string };

export type Auth = { type: "jwt" | "guest"; token: string };

export type PostResponse = {
	id: number;
	content: string;
	createdAt: string;
	likesCount: number;
	authorName: string;
	authorId: string | null;
	authorToken: string | null;
	likedByMe: boolean;
	tags: string[];
};

export type ListResponse = PostResponse[] | ApiError;

export type CreateResponse = { id: number; content: string; createdAt: string } | ApiError;

export type DeleteResponse = { id: number; message: string } | ApiError;

export type LikeResponse = { id: number; message: string } | ApiError;

export type LoginResponse = { token: string } | ApiError;

export type RegisterResponse = { message: string } | ApiError;
