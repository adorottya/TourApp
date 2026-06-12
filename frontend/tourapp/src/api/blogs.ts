import { apiFetch } from './client';
import type { BlogResponse, CommentResponse, CreateBlogRequest, UpdateBlogRequest } from '../types/blog';

export function listBlogs(page = 1, size = 20): Promise<BlogResponse[]> {
  return apiFetch(`/api/blogs?page=${page}&size=${size}`);
}

export function getBlog(id: string): Promise<BlogResponse> {
  return apiFetch(`/api/blogs/${id}`);
}

export function createBlog(req: CreateBlogRequest): Promise<BlogResponse> {
  return apiFetch('/api/blogs', { method: 'POST', body: JSON.stringify(req) });
}

export function updateBlog(id: string, req: UpdateBlogRequest): Promise<BlogResponse> {
  return apiFetch(`/api/blogs/${id}`, { method: 'PUT', body: JSON.stringify(req) });
}

export function deleteBlog(id: string): Promise<void> {
  return apiFetch(`/api/blogs/${id}`, { method: 'DELETE' });
}

export function getComments(blogId: string): Promise<CommentResponse[]> {
  return apiFetch(`/api/blogs/${blogId}/comments`);
}

export function addComment(blogId: string, content: string): Promise<CommentResponse> {
  return apiFetch(`/api/blogs/${blogId}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
}
