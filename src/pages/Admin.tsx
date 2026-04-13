import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrollmentAnalytics } from "@/components/admin/EnrollmentAnalytics";
import { BulkEmail } from "@/components/admin/BulkEmail";
import { CouponManager } from "@/components/admin/CouponManager";

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage enrollments, emails, and coupons.</p>
        </div>

        <Tabs defaultValue="enrollments" className="w-full">
          <TabsList className="bg-gray-800 border border-gray-700 mb-6">
            <TabsTrigger
              value="enrollments"
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
            >
              Enrollment Analytics
            </TabsTrigger>
            <TabsTrigger
              value="bulk-email"
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
            >
              Bulk Email
            </TabsTrigger>
            <TabsTrigger
              value="coupons"
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
            >
              Coupons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments">
            <EnrollmentAnalytics />
          </TabsContent>

          <TabsContent value="bulk-email">
            <BulkEmail />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
