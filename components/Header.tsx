'use client';
import { useEffect, useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ShowProfile from "./ShowProfile";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const navLinks = [
  { name: "About Us", href: "/about" },
  { name: "Products", href: "/products" },
  { name: "Contact Us", href: "/contact" },
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
      <Link href="/cart">
        <Button variant="ghost" size="icon" className="hover:bg-transparent relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#29E252] text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
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
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isAuthPage = pathname === "/register" || pathname === "/employee-login";

  const toggleMenu = () => setMenu(!menu);
  const closeMenu = () => setMenu(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(setServerUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Close menu when navigating
  useEffect(() => {
    const handleRouteChange = () => {
      if (menu) {
        closeMenu();
      }
    };

    return () => {
      window.removeEventListener('routeChange', handleRouteChange);
    };
  }, [menu]);

const user = clientSession?.user || serverUser;

  return (
    <header className="font-header h-[75px] dark:bg-black bg-[#FAF9F6] sticky top-0 text-black font-semibold z-50 w-full">
      {/* DESKTOP */}
      <div className={`hidden w-full h-full sm:flex justify-between items-center px-2 md:px-4 ${!isAuthPage ? "xl:max-w-full xl:mx-auto" : ""}`}>
        <div className="flex md:pl-6 items-center">
          <Link href="/" className="flex items-center">
            <h1 className="font-poppins ml-2 font-bold text-[18px]">
              ENUGU MARKETPLACE
            </h1>
          </Link>
        </div>

        <div className="flex items-center h-full">
          <nav className="flex gap-8 font-header xl:gap-[50px] sm:text-[14px] md:text-[14px]">
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.name}
                className={pathname.startsWith(link.href) 
                  ? "font-bold border-green-800 border-b-2" 
                  : "font-semibold hover:text-gray-600"}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {status === "authenticated" && (
            <>
              {user?.role === "user" && <CartPreview token={user?.token} />}
              <ShowProfile />
            </>
          )}
          
          {status === "unauthenticated" && (
            <Button
              asChild
              className="rounded-full bg-[#FAF9F6] hover:bg-green-700 hover:text-white text-[16px] px-12 py-[1.7rem] text-black border-2 border-green-700"
            >
              <Link href="/employee-login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>

      {/* MOBILE */}
      <div className={`sm:hidden fixed top-0 w-full z-[999] py-4 ${menu ? "bg-white" : "bg-white"}`}>
        <div className="flex justify-between items-center mx-4">
          <Link href="/" onClick={closeMenu} className="flex items-center">
            <h1 className="font-poppins text-black font-bold text-[18px]">
              ENUGU MARKETPLACE
            </h1>
          </Link>
          
          <button onClick={toggleMenu} className="p-2">
            {menu ? (
              <X className="text-black w-6 h-6" />
            ) : (
              <HiOutlineMenuAlt4 className="text-black w-6 h-6" />
            )}
          </button>
        </div>

        {menu && (
          <div className="my-4 mx-4 animate-in slide-in-from-right">
            <nav className="flex flex-col gap-4 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className={`py-2 ${pathname.startsWith(link.href) 
                    ? "font-bold text-green-600" 
                    : "font-semibold hover:text-gray-600"}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-4 mt-4">
              {status === "authenticated" && (
                <>
                  <CartPreview token={user?.token} />
                  <ShowProfile />
                </>
              )}
            </div>

            <div className="mt-4">
              {status === "unauthenticated" && (
                <Button
                  asChild
                  className="w-full bg-green-700 rounded-full hover:bg-green-600"
                >
                  <Link href="/employee-login" onClick={closeMenu}>Employee Login</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;