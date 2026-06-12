import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addComment, getBlog, getComments } from '../../api/blogs';
import { follow, isFollowing, unfollow } from '../../api/social';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Textarea } from '../../components/ui/Textarea';
import { useAuth } from '../../context/AuthContext';
import type { BlogResponse, CommentResponse } from '../../types/blog';
import './BlogDetailPage.css';

export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [blog, setBlog] = useState<BlogResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [following, setFollowing] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getBlog(id), getComments(id)]).then(([b, c]) => {
      setBlog(b);
      setComments(c);
      if (user && user.id.toString() !== b.authorId) {
        isFollowing(b.authorId).then(r => setFollowing(r.following)).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoadingBlog(false));
  }, [id, user]);

  async function toggleFollow() {
    if (!blog) return;
    try {
      if (following) { await unfollow(blog.authorId); setFollowing(false); }
      else { await follow(blog.authorId); setFollowing(true); }
    } catch { /* ignore */ }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !commentText.trim()) return;
    setSubmitting(true);
    setCommentError('');
    try {
      const c = await addComment(id, commentText.trim());
      setComments(prev => [...prev, c]);
      setCommentText('');
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingBlog) return <PageShell><Spinner /></PageShell>;
  if (!blog) return <PageShell><p style={{ color: 'var(--danger)' }}>Blog not found.</p></PageShell>;

  const isAuthor = user?.id.toString() === blog.authorId;
  const canComment = isAuthor || following;

  return (
    <PageShell>
      <article className="blog-detail">
        <div className="blog-detail__header">
          <h1 className="blog-detail__title">{blog.title}</h1>
          <div className="blog-detail__meta">
            <span>by {blog.authorId}</span>
            <span>·</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            {!isAuthor && user && (
              <Button variant={following ? 'secondary' : 'primary'} size="sm" onClick={toggleFollow}>
                {following ? 'Unfollow' : 'Follow Author'}
              </Button>
            )}
          </div>
        </div>

        {blog.pictures.length > 0 && (
          <div className="blog-detail__gallery">
            {blog.pictures.map((url, i) => (
              <img key={i} src={url} alt={`${blog.title} ${i + 1}`} className="blog-detail__img" />
            ))}
          </div>
        )}

        <Card className="blog-detail__content">
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{blog.description}</p>
        </Card>

        <section className="blog-detail__comments">
          <h2>Comments ({comments.length})</h2>
          {comments.length === 0 && <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No comments yet.</p>}
          {comments.map(c => (
            <Card key={c.id} className="comment-card">
              <div className="comment-meta">
                <strong>{c.authorId}</strong>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p>{c.content}</p>
            </Card>
          ))}

          {canComment ? (
            <form onSubmit={handleComment} className="comment-form">
              <Textarea value={commentText} rows={3} placeholder="Write a comment…"
                onChange={e => setCommentText(e.target.value)} />
              {commentError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{commentError}</p>}
              <Button type="submit" size="sm" disabled={submitting || !commentText.trim()}>
                {submitting ? 'Posting…' : 'Post Comment'}
              </Button>
            </form>
          ) : (
            <p className="comment-gate">Follow this author to leave a comment.</p>
          )}
        </section>
      </article>
    </PageShell>
  );
}
