import Image from "next/image";
import React from "react";

function Header() {
  return (
    <div>
      <div className="flex gap-2 items-center">
        <Image src={"/logo.png"} alt="logo" width={40} height={40} />
        <h2 className="font-bold text-3xl font-inter">LynxDev HUB</h2>
      </div>
    </div>
  );
}
export default Header;
