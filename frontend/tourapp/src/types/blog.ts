export interface BlogResponse {
  id: string;
  authorId: string;
  title: string;
  description: string;
  pictures: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface CreateBlogRequest {
  title: string;
  description: string;
  pictures: string[];
}

export interface UpdateBlogRequest {
  title?: string;
  description?: string;
  pictures?: string[];
}
