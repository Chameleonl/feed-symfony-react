export interface Post {
	id: number;
	content: string;
	createdAt: string;
	likesCount: string;
	authorName: string;
	authorId: string | null;
	authorToken: string | null;
	likedByMe: boolean;
}
