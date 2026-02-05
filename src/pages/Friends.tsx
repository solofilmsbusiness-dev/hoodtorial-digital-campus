import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { PageLayout } from "@/components/layout";
 import { FriendsList, FriendRequestsPanel } from "@/components/friends";
 import { useFriendships } from "@/hooks/useFriendships";
import { Users, Bell, UserPlus, ArrowLeft } from "lucide-react";
 import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
 
 export default function Friends() {
   const { pendingCount, outgoingRequests } = useFriendships();
 
   return (
     <PageLayout>
       <div className="py-12 px-4">
         <div className="container max-w-4xl mx-auto">
          {/* Breadcrumb */}
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
             <TabsList className="grid w-full grid-cols-3">
               <TabsTrigger value="friends" className="flex items-center gap-2">
                 <Users className="h-4 w-4" />
                 My Friends
               </TabsTrigger>
               <TabsTrigger value="requests" className="flex items-center gap-2 relative">
                 <Bell className="h-4 w-4" />
                 Requests
                 {pendingCount > 0 && (
                   <Badge variant="destructive" className="ml-1 h-5 min-w-5 flex items-center justify-center text-xs">
                     {pendingCount}
                   </Badge>
                 )}
               </TabsTrigger>
               <TabsTrigger value="sent" className="flex items-center gap-2">
                 <UserPlus className="h-4 w-4" />
                 Sent
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
                           <div className="flex-1">
                             <p className="font-semibold">
                               {request.receiver.display_name || "Unknown User"}
                             </p>
                             <p className="text-sm text-muted-foreground">Pending...</p>
                           </div>
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