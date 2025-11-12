import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, MessageSquare, Heart } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">BlogHub</h1>
          <Button variant="secondary" onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </nav>

      <main className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Share Your Story with the World
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join BlogHub to connect with writers, share your thoughts, and engage with a community of passionate bloggers.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
            Start Blogging
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Connect & Follow</h3>
            <p className="text-white/80">
              Build your network by following other writers and growing your audience.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Engage & Comment</h3>
            <p className="text-white/80">
              Join conversations and share your thoughts on posts that inspire you.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Like & Share</h3>
            <p className="text-white/80">
              Show appreciation for great content and help it reach more readers.
            </p>
          </div>
        </div>
      </main>

      <footer className="container max-w-6xl mx-auto px-4 py-8 mt-20">
        <p className="text-center text-white/60">
          © 2025 BlogHub. Made with ❤️ by the community.
        </p>
      </footer>
    </div>
  );
};

export default Index;
