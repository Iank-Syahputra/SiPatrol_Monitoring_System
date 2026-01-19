import { getUserProfile } from "@/lib/sipatrol-db";
import ReportForm from "@/components/report-form";
import { redirect } from "next/navigation";

export default async function NewReportPage() {
  // 1. Fetch data on the Server
  const user = await getUserProfile();

  // 2. Protect the route (Optional but recommended)
  if (!user) {
    // redirect('/sign-in'); // Uncomment if you want strict redirect
    return <div>Unauthorized: Please log in.</div>;
  }

  // 3. Pass data to the Client Component
  return (
    <div className="p-4">
      <ReportForm user={user} />
    </div>
  );
}