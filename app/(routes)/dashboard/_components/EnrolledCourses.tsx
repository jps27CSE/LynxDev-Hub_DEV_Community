"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

const EnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  return (
    <div className="mt-8">
      {enrolledCourses.length == 0 ? (
        <div className="flex flex-col items-center gap-3 p-7 border rounded-2xl bg-zinc-900">
          <Image src={"/book.png"} alt="book" width={90} height={90} />
          <h2 className="font-mono">You Don't have any enrolled courses</h2>
          <Button variant={"pixel"} size={"lg"} className="font-mono">
            Browse All Courses
          </Button>
        </div>
      ) : (
        <div>List</div>
      )}
    </div>
  );
};

export default EnrolledCourses;
