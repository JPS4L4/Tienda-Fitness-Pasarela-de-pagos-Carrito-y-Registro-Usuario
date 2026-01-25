export type CommentsUI = {
    id: number;
    name: string;
    role: string;
    content: string;
    avatar?: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}