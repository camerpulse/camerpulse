import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SimplifiedAdminSidebar } from './SimplifiedAdminSidebar';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

export const SimplifiedAdminLayout = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <SidebarProvider collapsedWidth={56}>
      <div className="min-h-screen flex w-full">
        <SimplifiedAdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink to="/">CamerPulse</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink to="/admin">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathSegments.slice(1).map((segment, index) => (
                    <div key={segment} className="flex items-center">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {index === pathSegments.length - 2 ? (
                          <BreadcrumbPage className="capitalize">
                            {segment.replace('-', ' ')}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            to={`/${pathSegments.slice(0, index + 2).join('/')}`}
                            className="capitalize"
                          >
                            {segment.replace('-', ' ')}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Admin Dashboard
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-muted/10">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};