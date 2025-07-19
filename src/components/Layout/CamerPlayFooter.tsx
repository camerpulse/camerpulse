import { Link } from 'react-router-dom';
import { Music, Upload, Search, Calendar, Trophy, Star, Users, Headphones } from 'lucide-react';

export const CamerPlayFooter = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">CamerPlay</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Cameroon's premier music streaming and discovery platform. Support local artists and discover amazing music.
            </p>
            <div className="flex space-x-4">
              <Link to="https://facebook.com" className="text-muted-foreground hover:text-primary">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              <Link to="https://instagram.com" className="text-muted-foreground hover:text-primary">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297L3.938 16.5l.77-1.186c.853.815 2.01 1.297 3.323 1.297 2.667 0 4.828-2.162 4.828-4.828 0-2.667-2.161-4.828-4.828-4.828-1.297 0-2.448.49-3.323 1.297L3.938 7.5l.77-1.186c.853.815 2.01 1.297 3.323 1.297 2.667 0 4.828 2.162 4.828 4.828 0 2.667-2.161 4.828-4.828 4.828z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Music Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Discover Music</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/camerplay/search" className="text-muted-foreground hover:text-primary flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  Search & Discover
                </Link>
              </li>
              <li>
                <Link to="/camerplay/rankings" className="text-muted-foreground hover:text-primary flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  Top Rankings
                </Link>
              </li>
              <li>
                <Link to="/camerplay/music-player" className="text-muted-foreground hover:text-primary flex items-center">
                  <Headphones className="mr-2 h-4 w-4" />
                  Music Player
                </Link>
              </li>
              <li>
                <Link to="/fan-portal" className="text-muted-foreground hover:text-primary flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Fan Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Artists Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">For Artists</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/artist-register" className="text-muted-foreground hover:text-primary flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Join as Artist
                </Link>
              </li>
              <li>
                <Link to="/camerplay/upload" className="text-muted-foreground hover:text-primary flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Music
                </Link>
              </li>
              <li>
                <Link to="/artist-dashboard" className="text-muted-foreground hover:text-primary flex items-center">
                  <Star className="mr-2 h-4 w-4" />
                  Artist Dashboard
                </Link>
              </li>
              <li>
                <Link to="/camerplay/submit-artist" className="text-muted-foreground hover:text-primary flex items-center">
                  <Star className="mr-2 h-4 w-4" />
                  Submit Artist
                </Link>
              </li>
            </ul>
          </div>

          {/* Events & Awards Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Events & Awards</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/camerplay/events" className="text-muted-foreground hover:text-primary flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/camerplay/awards" className="text-muted-foreground hover:text-primary flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  Music Awards
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-muted-foreground hover:text-primary flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Event Calendar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 CamerPlay. Supporting Cameroonian music and artists.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/camerpulse-master" className="text-sm text-muted-foreground hover:text-primary">
              Back to CamerPulse
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};