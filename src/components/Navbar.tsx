import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, User, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      fetchUsername();
    }
  }, [user]);

  const fetchUsername = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    
    if (data) setUsername(data.username);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Logged out successfully' });
    navigate('/auth');
  };

  return (
    <nav className="border-b bg-card sticky top-0 z-50 shadow-soft">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            BlogHub
          </button>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/feed')}
            >
              <Home className="w-4 h-4 mr-2" />
              Feed
            </Button>

            {username && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/profile/${username}`)}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
