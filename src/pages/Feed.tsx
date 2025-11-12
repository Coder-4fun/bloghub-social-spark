import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, PenSquare, LogOut } from 'lucide-react';
import PostCard from '@/components/PostCard';
import CreatePostDialog from '@/components/CreatePostDialog';
import Navbar from '@/components/Navbar';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  likes: { id: string }[];
  comments: { id: string }[];
}

const Feed = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (id, username, full_name, avatar_url),
          likes (id),
          comments (id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Feed</h1>
          <Button onClick={() => setCreatePostOpen(true)}>
            <PenSquare className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={fetchPosts}
              />
            ))
          )}
        </div>
      </main>

      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onSuccess={fetchPosts}
      />
    </div>
  );
};

export default Feed;
