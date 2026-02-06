import { useNavigate, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminBackground } from "./AdminBackground";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, ExternalLink, Home, BookOpen, Users, ShoppingBag, MessageSquare } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { CommandPalette } from "./CommandPalette";
import { AdminNotifications } from "./AdminNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  pageKey?: string;
}

// Map of route paths to breadcrumb labels
const routeLabels: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/courses": "Courses",
  "/admin/community": "Community",
  "/admin/users": "Users",
  "/admin/settings": "Settings",
};

export function AdminLayout({ children, title, description, pageKey }: AdminLayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Build breadcrumbs from current path
  const buildBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const crumbs: Array<{ label: string; href: string; isLast: boolean }> = [];
    
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({
        label,
        href: currentPath,
        isLast: index === pathSegments.length - 1,
      });
    });

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            
            {/* Breadcrumbs - hidden on mobile */}
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <BreadcrumbItem key={crumb.href}>
                    {index > 0 && <BreadcrumbSeparator />}
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            {/* Mobile title */}
            <div className="md:hidden">
              <h1 className="font-semibold">{title}</h1>
            </div>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    View Site
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    <Home className="h-4 w-4 mr-2" /> Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/academics")}>
                    <BookOpen className="h-4 w-4 mr-2" /> Courses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/community")}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Community
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/student")}>
                    <Users className="h-4 w-4 mr-2" /> Student Center
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/shop")}>
                    <ShoppingBag className="h-4 w-4 mr-2" /> Shop
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CommandPalette />
              <AdminNotifications />
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <span className="text-sm text-muted-foreground hidden sm:inline-block max-w-[150px] truncate">
                {user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <AdminBackground pageKey={pageKey || "dashboard"}>
              {/* Page header on desktop */}
              <div className="hidden md:block mb-6">
                <h1 className="text-2xl font-bold">{title}</h1>
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
              </div>
              {children}
            </AdminBackground>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
