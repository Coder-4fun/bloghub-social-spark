import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: {
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
  };
  onUpdate: () => void;
}

const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);
        setIsLiked(false);
      } else {
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post.id,
          });
        setIsLiked(true);
      }
      onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.profiles.id) return;

    try {
      await supabase.from('posts').delete().eq('id', post.id);
      toast({ title: 'Post deleted' });
      onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-soft hover:shadow-strong transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/profile/${post.profiles.username}`)}
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
            {post.profiles.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold hover:text-primary transition-colors">
              {post.profiles.full_name || post.profiles.username}
            </p>
            <p className="text-sm text-muted-foreground">
              @{post.profiles.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {user?.id === post.profiles.id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <p className="mb-4 whitespace-pre-wrap text-foreground">{post.content}</p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="w-full rounded-lg mb-4 max-h-96 object-cover"
        />
      )}

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={isLiked ? 'text-accent' : ''}
        >
          <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
          {post.likes.length}
        </Button>

        <Button variant="ghost" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" />
          {post.comments.length}
        </Button>
      </div>
    </Card>
  );
};

export default PostCard;
