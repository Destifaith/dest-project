import React, { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import { Mail, Phone, ShoppingCart, Globe, DollarSign, Store } from "lucide-react";

interface TopNavProps {
  cartItemsCount?: number;
}

const TopNav: React.FC<TopNavProps> = ({ cartItemsCount = 0 }) => {
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const langRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    setLangOpen(false);
  };

  // Click outside to close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    if (langOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [langOpen]);

  return (
    // z-[60] is higher than your MainNavbar's z-50 so dropdown overlays it
    <div className="relative z-[60] bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 border-b border-green-500">
      <div className="container mx-auto px-4 flex justify-between items-center h-10">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {/* Email */}
          <a
            href="mailto:info@hospitality.com"
            className="hidden sm:flex items-center hover:text-green-600"
          >
            <Mail className="w-4 h-4 mr-1" />
            info@hospitality.com
          </a>
          <a href="mailto:info@hospitality.com" className="sm:hidden group relative">
            <Mail className="w-5 h-5" />
            <span className="absolute left-1/2 -translate-x-1/2 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100">
              Email
            </span>
          </a>

          {/* Phone/WhatsApp */}
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center hover:text-green-600"
          >
            <Phone className="w-4 h-4 mr-1" />
            +1 234 567 890
          </a>
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden group relative"
          >
            <Phone className="w-5 h-5" />
            <span className="absolute left-1/2 -translate-x-1/2 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100">
              WhatsApp
            </span>
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Currency (static USD for now) */}
          <div className="hidden sm:flex items-center hover:text-green-600 cursor-pointer">
            <DollarSign className="w-4 h-4 mr-1" /> USD
          </div>
          <div className="sm:hidden group relative cursor-pointer">
            <DollarSign className="w-5 h-5" />
            <span className="absolute left-1/2 -translate-x-1/2 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100">
              USD
            </span>
          </div>

          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="hidden sm:flex items-center hover:text-green-600"
              aria-haspopup="menu"
              aria-expanded={langOpen}
            >
              <Globe className="w-4 h-4 mr-1" /> {language}
            </button>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="sm:hidden group relative"
              aria-haspopup="menu"
              aria-expanded={langOpen}
            >
              <Globe className="w-5 h-5" />
              <span className="absolute left-1/2 -translate-x-1/2 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100">
                Language
              </span>
            </button>

            {langOpen && (
              <div
                className="
                  absolute right-0 top-full mt-1
                  w-36 bg-white dark:bg-gray-700
                  shadow-md rounded py-1
                  z-[70]    /* higher than MainNavbar (z-50) */
                "
                role="menu"
              >
                {["English", "Español", "French"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    role="menuitem"
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      language === lang
                        ? "bg-green-50 dark:bg-gray-600 text-green-600 dark:text-green-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Shop */}
          <Link href="/shop" className="hidden sm:flex items-center hover:text-green-600">
            <Store className="w-4 h-4 mr-1" /> Shop
          </Link>
          <Link href="/shop" className="sm:hidden group relative">
            <Store className="w-5 h-5" />
            <span className="absolute left-1/2 -translate-x-1/2 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100">
              Shop
            </span>
          </Link>

          {/* Cart with item count */}
          <Link href="/cart" className="hidden sm:flex items-center hover:text-green-600 relative">
            <ShoppingCart className="w-4 h-4 mr-1" />
            Cart
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="sm:hidden group relative">
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
            <span className="absolute left-1/2 -translate-x-1/2 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100">
              Cart
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
