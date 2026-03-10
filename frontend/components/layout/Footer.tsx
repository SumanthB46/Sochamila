"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t">

      {/* LINKS */}
      <section className="px-6 md:px-12 lg:px-20 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm text-gray-800">

          <div>
            <p className="font-semibold mb-3">
              Language / Currency
            </p>
            <p className="hover:text-teal-600 transition">
              India | INR
            </p>
          </div>

          <div>
            <p className="font-semibold mb-3">Service</p>
            <ul className="space-y-2">
              {["Your Orders", "Help", "Contact", "Bulk Orders"].map(item => (
                <li
                  key={item}
                  className="hover:text-teal-600 cursor-pointer transition"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-3">The Company</p>
            <ul className="space-y-2">
              {[
                "About Us",
                "Sustainability",
                "Press",
                "Privacy",
                "Terms & Conditions",
              ].map(item => (
                <li
                  key={item}
                  className="hover:text-teal-600 cursor-pointer transition"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-3">Follow Us</p>
            <ul className="space-y-2">
              {["Facebook", "Instagram", "Pinterest", "YouTube"].map(item => (
                <li
                  key={item}
                  className="hover:text-teal-600 cursor-pointer transition"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* COPYRIGHT */}
      <div className="bg-gray-900 text-white text-center py-4 text-sm">
        © {new Date().getFullYear()} Sochamila. All rights reserved.
      </div>
    </footer>
  );
}
