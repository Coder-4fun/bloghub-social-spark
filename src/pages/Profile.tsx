import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Settings, UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

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

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (id, username, full_name, avatar_url),
          likes (id),
          comments (id)
        `)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      if (user && user.id !== profileData.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .single();

        setIsFollowing(!!followData);
      }

      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileData.id);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileData.id);

      setFollowersCount(followersCount || 0);
      setFollowingCount(followingCount || 0);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);

        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast({ title: 'Unfollowed' });
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id,
          });

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast({ title: 'Following!' });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
            </div>

            {isOwnProfile ? (
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                size="sm"
                onClick={handleFollow}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          {profile.bio && (
            <p className="mb-4 text-foreground">{profile.bio}</p>
          )}

          <div className="flex space-x-6 text-sm">
            <div>
              <span className="font-bold">{followersCount}</span>{' '}
              <span className="text-muted-foreground">Followers</span>
            </div>
            <div>
              <span className="font-bold">{followingCount}</span>{' '}
              <span className="text-muted-foreground">Following</span>
            </div>
            <div>
              <span className="font-bold">{posts.length}</span>{' '}
              <span className="text-muted-foreground">Posts</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={fetchProfile}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
