import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout";
import { FriendsList, FriendRequestsPanel } from "@/components/friends";
import { UserSearch } from "@/components/friends/UserSearch";
import { useFriendships } from "@/hooks/useFriendships";
import { Users, Bell, UserPlus, ArrowLeft, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function Friends() {
  const { pendingCount, outgoingRequests, cancelFriendRequest } = useFriendships();

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  return (
    <PageLayout pageKey="friends">
      <div className="py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/student" className="hover:text-primary transition-colors">Student Hub</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Friends</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3 mb-8">
            <Link to="/student" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <Users className="h-8 w-8 text-primary" />
            <h1 className="heading-2">Friends</h1>
          </div>

          <Tabs defaultValue="friends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">My Friends</span>
                <span className="sm:hidden">Friends</span>
              </TabsTrigger>
              <TabsTrigger value="find" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Find Friends</span>
                <span className="sm:hidden">Find</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2 relative">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Requests</span>
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 min-w-5 flex items-center justify-center text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Sent</span>
                {outgoingRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 flex items-center justify-center text-xs">
                    {outgoingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends">
              <Card className="card-urban">
                <CardHeader>
                  <CardTitle>Your Friends</CardTitle>
                </CardHeader>
                <CardContent>
                  <FriendsList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="find">
              <Card className="card-urban">
                <CardHeader>
                  <CardTitle>Find Friends</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserSearch />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card className="card-urban">
                <CardHeader>
                  <CardTitle>Friend Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <FriendRequestsPanel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sent">
              <Card className="card-urban">
                <CardHeader>
                  <CardTitle>Sent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {outgoingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No pending requests sent</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {outgoingRequests.map((request) => (
                        <Card key={request.id} className="p-4 flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src={request.receiver.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                              {getInitials(request.receiver.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">
                              {request.receiver.display_name || "Unknown User"}
                            </p>
                            <p className="text-sm text-muted-foreground">Pending...</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => cancelFriendRequest(request.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}