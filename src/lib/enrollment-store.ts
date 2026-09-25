import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
    students as initialStudents,
    courses as initialCourses,
    enrollments as initialEnrollments,
} from "@/lib/mock-data";
import type { Course, Enrollment, Student } from "@/lib/types";

// (1) รูปร่างของ store — ข้อมูล 3 ก้อน + action 2 ตัว (เหมือนเดิมทุกประการ)
type EnrollmentStore = {
    students: Student[];
    courses: Course[];
    enrollments: Enrollment[];
    /** ลงทะเบียนวิชาให้นักศึกษา (ถ้ามีอยู่แล้วไม่ใส่ซ้ำ) */
    enroll: (studentId: string, courseId: string) => void;
    /** ยกเลิกการลงทะเบียน */
    drop: (studentId: string, courseId: string) => void;
};

// (2) create() สร้าง hook พร้อมใช้ในบรรทัดเดียว — ไม่ต้องมี Context, ไม่ต้องมี
// Provider component, ไม่ต้องเขียน custom hook โยน error เองเหมือน Context
export const useEnrollmentStore = create<EnrollmentStore>()(
    persist(
        (set) => ({
            students: initialStudents,
            courses: initialCourses,
            enrollments: initialEnrollments,

            // (3) enroll/drop เรียก set(...) แทนการเรียก setState ของ useState
            enroll: (studentId, courseId) =>
                set((state) => ({
                    // set วิ่งไปหยิบ state มายัดเป็นพารามิเตอร์ให้เรา ซึ่ง state ตัวนี้คือค่าปัจจุบันทั้งหมดใน Store
                    enrollments: state.enrollments.some(
                        (e) => e.studentId === studentId && e.courseId === courseId,
                    )
                        ? state.enrollments // กันลงทะเบียนซ้ำ — ถ้ามีอยู่แล้วคืน array เดิม ไม่ใส่ซ้ำ
                        : [...state.enrollments, { studentId, courseId }],
                })),

            drop: (studentId, courseId) =>
                set((state) => ({
                    enrollments: state.enrollments.filter(
                        (e) => !(e.studentId === studentId && e.courseId === courseId),
                    ),
                })),
        }),
        {
            // ก้อนที่ 2: การตั้งค่า (Configuration) ของการ persist
            name: "enrollment-storage", // ชื่อ Key ที่จะไปปรากฏอยู่ใน Application -> LocalStorage ของเบราว์เซอร์
            partialize: (state) => ({
                students: state.students, // เลือกเก็บเฉพาะ students
                courses: state.courses,   // และ courses เท่านั้น (ไม่เอา enrollments)
            }),
        },
    ),
);