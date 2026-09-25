import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function AdminEnrollmentsPage() {
    const { students, courses, enrollments } = useEnrollmentStore();

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
                <p className="text-sm text-muted-foreground">
                    Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
                </p>
            </div>
            <p className="text-sm">
                นักศึกษา {students.length} คน · วิชา {courses.length} วิชา ·
                การลงทะเบียน {enrollments.length} รายการ
            </p>
        </div>
    );
}