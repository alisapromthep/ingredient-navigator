import React from "react";
import Link from "next/link";

function Navbar() {
  const navigators = [
    { name: "Home", href: "/" },
    { name: "Ingredient Finder", href: "/ingredient-finder" },
    { name: "Ingredient Search", href: "/ingredient-deep-search" },
    { name: "Report", href: "/reports" },
  ];
  return (
    <nav className="flex justify-between">
      <div>
        <h2 className="font-bold">Ingredient Navigator</h2>
      </div>
      <div className="flex gap-4">
        {navigators.map((item, i) => (
          <Link className="" key={i} href={item.href}>
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
