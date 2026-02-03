"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

const EnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  return (
    <div className="mt-8">
      <h2 className="text-3xl mb-2 font-mono font-bold">
        Your Enrolled Courses
      </h2>
      {enrolledCourses.length == 0 ? (
        <div className="flex flex-col items-center gap-3 p-7 border rounded-2xl bg-zinc-900">
          <Image src={"/book.png"} alt="book" width={90} height={90} />
          <h2 className="font-mono text-xl">
            You Don't have any enrolled courses
          </h2>
          <Button variant={"pixel"} size={"lg"} className="font-mono font-bold">
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
