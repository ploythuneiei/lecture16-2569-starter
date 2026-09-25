import { useEnrollmentStore } from "@/lib/enrollment-store";
import { useState } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Option = { value: string; label: string };

function OptionSelect({
    id,
    options,
    value,
    onChange,
    placeholder,
}: {
    id: string;
    options: Option[];
    value: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <Select
            items={options}
            value={value}
            onValueChange={(v) => onChange(v as string)}
        >
            <SelectTrigger id={id} className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default function AdminEnrollmentsPage() {
    const { students, courses, enrollments, enroll } = useEnrollmentStore();

    // state ของฟอร์มใน Dialog
    const [formStudent, setFormStudent] = useState<string | null>(null);
    // formStudent: จำรหัสนักศึกษาที่กำลังถูกเลือกในฟอร์มปัจจุบัน
    const [formCourse, setFormCourse] = useState<string | null>(null);
    // formCourse: จำรหัสวิชาที่กำลังถูกเลือกในฟอร์มปัจจุบัน
    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
    // enrollDialogOpen: ควบคุมว่าหน้าต่างป๊อปอัป (Dialog) กำลังเปิด (true) หรือปิด (false) อยู่

    // แปลงข้อมูลจาก store เป็นรูปแบบ { value, label } ที่ OptionSelect ต้องการ
    const studentOptions: Option[] = students.map((s) => ({
        value: s.studentId,
        label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
    }));
    const courseOptions: Option[] = courses.map((c) => ({
        value: c.courseId,
        label: `${c.courseId} — ${c.courseTitle}`,
    }));

    // วิชาที่นักศึกษาที่เลือกยังไม่ได้ลงทะเบียน — กันเลือกวิชาซ้ำตั้งแต่ต้นทาง
    const availableCourseOptions = courseOptions.filter(
        (c) =>
            !enrollments.some(
                (e) => e.studentId === formStudent && e.courseId === c.value
            )
    );
    // การทำงาน: วิ่งเช็คทีละวิชาใน courseOptions ใช้.some() ไปค้นในอาเรย์ enrollments ว่ามีคู่ของนักศึกษาคนนี้(formStudent) กับวิชานี้(c.value) อยู่แล้วหรือยัง
    // เครื่องหมาย! ด้านหน้าสุด ทำหน้าที่กลับค่าผลลัพธ์(ถ้าเจอ แปลว่าลงแล้ว ได้ true เติม! กลายเป็น false ➡️ คัดกรองทิ้งไม่เอามาแสดง) ดังนั้นจะมีเฉพาะวิชาที่ ยังไม่เคยลงทะเบียนเท่านั้น ที่แสดงขึ้นมาให้เลือก

    const handleEnroll = () => {
        if (!formStudent || !formCourse) return; // เช็คความปลอดภัย: ถ้าเลือกไม่ครบ ให้หยุดทำงานทันที
        enroll(formStudent, formCourse); // สั่งเรียกใช้ฟังก์ชัน enroll จาก Zustand เพื่อบันทึกข้อมูลลง Store
        setEnrollDialogOpen(false); // สั่งปิดหน้าต่าง Dialog ป๊อปอัป
    };

    // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
    // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
    const handleEnrollDialogOpenChange = (open: boolean) => {
        setEnrollDialogOpen(open);
        if (!open) {
            setFormStudent(null);
            setFormCourse(null);
        }
    };
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
                <p className="text-sm text-muted-foreground">
                    Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
                </p>
            </div>

            <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
                <DialogTrigger render={<Button />}>
                    <PlusCircle className="h-4 w-4" />
                    ลงทะเบียนให้นักศึกษา
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
                        <DialogDescription>
                            เลือกนักศึกษาก่อน แล้วเลือกวิชาที่ยังไม่ได้ลงทะเบียน
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="formStudent">นักศึกษา</Label>
                            <OptionSelect
                                id="formStudent"
                                options={studentOptions}
                                value={formStudent}
                                placeholder="เลือกนักศึกษา"
                                onChange={(v) => {
                                    // ใช้ arrow func เพราะต้องเรียก2func
                                    setFormStudent(v);
                                    setFormCourse(null);
                                }}
                            // onChange={(v) => { setFormStudent(v); setFormCourse(null); }}
                            // หน้าที่:เป็นเหตุการณ์ที่ทำงาน ทันทีเมื่อผู้ใช้คลิกเลือกชื่อนักศึกษาคนใดคนหนึ่งในรายการ
                            // ภายในรับค่าพารามิเตอร์ v (ซึ่งก็คือ studentId ของนักศึกษาที่ถูกเลือก) แล้วสั่งทำงาน 2 อย่างพร้อมกัน:
                            // setFormStudent(v): อัปเดต State formStudent ให้จำรหัสนักศึกษาคนใหม่ที่เพิ่งถูกเลือก
                            // setFormCourse(null): เคลียร์ช่องเลือกวิชาให้กลับมาเป็นค่าว่าง (null) ทันที
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="formCourse">วิชา</Label>
                            <OptionSelect
                                id="formCourse"
                                options={availableCourseOptions}
                                value={formCourse}
                                placeholder={
                                    formStudent && availableCourseOptions.length === 0
                                        ? "ลงทะเบียนครบทุกวิชาแล้ว"
                                        : "เลือกวิชา"
                                }
                                onChange={setFormCourse}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={!formStudent || !formCourse} onClick={handleEnroll}>
                            <PlusCircle className="h-4 w-4" />
                            ลงทะเบียน
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}