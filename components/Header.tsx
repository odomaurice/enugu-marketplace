'use client';
import { useEffect, useState } from "react";
import { X, ShoppingCart, Utensils, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ShowProfile from "./ShowProfile";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FiShoppingBag } from "react-icons/fi";

const navLinks = [
  { name: "About Us", href: "/about" },
  // { name: "How It Works", href: "/how-it-works" },
  // { name: "Contact", href: "/contact" },
];

function CartPreview({ token }: { token?: string }) {
  const { data: cartResponse, error } = useQuery({
    queryKey: ['cart', token],
    queryFn: async () => {
      if (!token) {
        return { data: [] };
      }
      
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
      } catch (error) {
        console.error('Cart fetch error:', error);
        return { data: [] };
      }
    },
    enabled: !!token,
    refetchInterval: 5000,
    refetchOnWindowFocus: true
  });

  const itemCount = cartResponse?.data?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;

  return (
    <div className="relative">
      <Link href="/employee-dashboard/cart">
        <Button variant="ghost" size="icon" className="hover:bg-orange-100/50 rounded-full relative transition-colors">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium">
              {itemCount}
            </span>
          )}
        </Button>
      </Link>
      {error && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
          !
        </span>
      )}
    </div>
  );
}

const Header = () => {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isAuthPage = pathname === "/register" || pathname === "/employee-login";

  const toggleMenu = () => setMenu(!menu);
  const closeMenu = () => setMenu(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Session fetch failed: ${res.status}`);
        }

        // NextAuth may return 204 No Content if no session
        if (res.status === 204) {
          return null;
        }

        try {
          return await res.json();
        } catch {
          return null;
        }
      })
      .then((data) => {
        setServerUser(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Session error:", err);
        setIsLoading(false);
      });
  }, []);

  const user = clientSession?.user || serverUser;

  return (
    <header className={cn(
      "font-header h-20 bg-white/90 backdrop-blur-md sticky top-0 text-black font-semibold z-50 w-full transition-all duration-300 border-b",
      scrolled ? "shadow-md" : "shadow-sm"
    )}>
      {/* DESKTOP */}
      <div className="hidden w-full h-full sm:flex justify-between items-center px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-12 h-12 rounded-lg  z-50 flex items-center justify-center transition-colors">
              <Image
                src={"/logo.png"}
                alt="logo"
                width={50}
                height={50}
                className="text-[40px] w-[50px] z-50 text-green-700"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Enugu Market
              </h1>
              <span className="text-sm font-medium text-green-700">
                Food Scheme
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-8 h-full">
          <nav className="flex gap-8 font-medium text-gray-700">
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.name}
                className={cn(
                  "relative py-1 transition-colors text-[15px] hover:text-green-600",
                  pathname.startsWith(link.href) 
                    ? "text-green-600 font-semibold" 
                    : "text-gray-700"
                )}
              >
                {link.name}
                {pathname.startsWith(link.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5  rounded-full"></span>
                )}
              </Link>
            ))}
            {user && (
              <Link
                href="#"
                className={cn(
                  "relative py-1 transition-colors text-[15px] hover:text-green-600 flex items-center gap-1",
                  pathname.startsWith("/employee-dashboard/products") 
                    ? "text-green-600 font-semibold" 
                    : "text-gray-700"
                )}
              >
                <FiShoppingBag className="h-4 w-4" />
                Products
                {pathname.startsWith("/employee-dashboard/products") && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-full"></span>
                )}
              </Link>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            {status === "authenticated" && user && (
              <>
                {user?.role === "user" && <CartPreview token={user?.token} />}
                
                <div className="h-6 w-px bg-gray-300"></div>
                
                <div className="flex items-center gap-2">
                  <ShowProfile />
                </div>
              </>
            )}

            {status === "unauthenticated" && (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                >
                  <Link href="/employee-login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-md bg-orange-600 hover:bg-orange-700 px-4 py-2 text-white"
                >
                  <Link href="/employee-login">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="sm:hidden w-full h-full px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          
            <Image
              src={"/logo.png"}
              alt="logo"
              width={50}
              height={50}
              className="w-[60px] z-50 "
            />
       
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Enugu Market
            </h1>
            <span className="text-xs font-medium text-green-700">
              Food Scheme
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {status === "authenticated" && user?.role === "user" && (
            <CartPreview token={user?.token} />
          )}
          
          <button 
            onClick={toggleMenu} 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {menu ? (
              <X className="text-gray-700 w-6 h-6" />
            ) : (
              <HiOutlineMenuAlt4 className="text-gray-700 w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menu && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white border-t shadow-lg animate-in slide-in-from-top">
          <div className="px-4 py-6">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "py-3 px-4 rounded-lg transition-colors",
                    pathname.startsWith(link.href)
                      ? "bg-orange-50 text-orange-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  href="#"
                  onClick={closeMenu}
                  className={cn(
                    "py-3 px-4 rounded-lg transition-colors flex items-center gap-2",
                    pathname.startsWith("/employee-dashboard/products")
                      ? "bg-orange-50 text-orange-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Utensils className="h-4 w-4" />
                  Products
                </Link>
              )}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200">
              {status === "authenticated" && user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                    
                    <ShowProfile />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-center py-3 border-gray-300"
                  >
                    <Link href="/employee-login" onClick={closeMenu}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full justify-center py-3 bg-orange-600 hover:bg-orange-700"
                  >
                    <Link href="/employee-login" onClick={closeMenu}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;