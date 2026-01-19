import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

const courses = [
  {
    id: 1,
    name: "HTML",
    desc: "Learn the fundamentals of HTML and build the structure",
    path: "/course/1/detail",
  },
  {
    id: 2,
    name: "CSS",
    desc: "Learn the fundamentals of CSS and build the style",
    path: "/course/2/detail",
  },
];

function Header() {
  return (
    <div className="p-4 max-w-7xl flex justify-between items-center w-full ">
      <div className="flex gap-2 items-center">
        <Image src={"/logo.png"} alt="logo" width={40} height={40} />
        <h2 className="font-bold text-3xl font-inter">LynxDev HUB</h2>
      </div>
      {/*Navbar*/}

      <NavigationMenu>
        <NavigationMenuList className="gap-8">
          <NavigationMenuItem>
            <NavigationMenuTrigger>Courses</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid md:grid-cols-2 gap-2 sm:w-[400px] md:w-[500px] lg:w-[600px]">
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-accent cursor-pointer rounded-xl"
                  >
                    <h2 className="font-medium">{course.name}</h2>
                    <p className="text-sm text-gray-500">{course.desc}</p>
                  </div>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/projects">Projects</Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link href="/pricing">Pricing</Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link href="/contact-us">Contact Us</Link>
          </NavigationMenuLink>
        </NavigationMenuList>
      </NavigationMenu>

      {/*Signup button */}
      <Button className="font-game text-2xl" variant={"pixel"}>
        Signup
      </Button>
    </div>
  );
}
export default Header;
