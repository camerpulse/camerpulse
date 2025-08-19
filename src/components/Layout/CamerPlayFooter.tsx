import { Link } from 'react-router-dom';


export const CamerPlayFooter = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CP</span>
              </div>
              <span className="text-xl font-bold">CamerPulse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting Cameroonians worldwide through civic engagement and opportunities.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={'/villages'} className="hover:text-foreground">Villages</Link></li>
              <li><Link to={'/jobs'} className="hover:text-foreground">Jobs</Link></li>
              <li><Link to={'/social-community'} className="hover:text-foreground">Community</Link></li>
              <li><Link to={'/government-portal'} className="hover:text-foreground">Government</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={getLocalizedPath('/civic-participation')} className="hover:text-foreground">Civic Hub</Link></li>
              <li><Link to={getLocalizedPath('/about')} className="hover:text-foreground">About</Link></li>
              <li><Link to={getLocalizedPath('/help')} className="hover:text-foreground">Help</Link></li>
              <li><Link to={getLocalizedPath('/contact')} className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={getLocalizedPath('/privacy')} className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to={getLocalizedPath('/terms')} className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link to={getLocalizedPath('/cookies')} className="hover:text-foreground">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 CamerPulse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};