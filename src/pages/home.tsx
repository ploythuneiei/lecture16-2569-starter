import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function HomePage() {
  const { students } = useEnrollmentStore();
  console.log(students);
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ระบบลงทะเบียนเรียน CPE & ISNE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button render={<Link to="/admin/enrollments" />}>
            ไปหน้าจัดการการลงทะเบียน
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
