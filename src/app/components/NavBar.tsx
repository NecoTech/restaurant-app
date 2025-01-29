//bottom navbar
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HomeIcon,
  ShoppingCartIcon,
  UserIcon,
  ListOrdered,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export default function NavBar({
  restaurantId = "",
}: {
  restaurantId: string;
}) {
  const [scroll, isScrolling] = useState(false);
  const { cartItems, restaurantId: currentRestaurantId } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  //useEffect to check if the user is scrolling typescript
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        isScrolling(true);
      } else {
        isScrolling(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    //center the navbar
    <nav className="fixed bottom-0 w-full z-100">
      <div
        className="container mx-auto
        flex justify-evenly
        items-center py-3 gap-10
        bg-white/20 w-[90%] mb-3 rounded-xl backdrop-blur-xl"
      >
        <Link href={`/restaurant/${restaurantId}`}>
          <div className="flex flex-col items-center">
            <HomeIcon className="h-7 w-7" color="white" />
          </div>
        </Link>
        <Link href={`/restaurant/${restaurantId}/cart`}>
          <div className="flex flex-col items-center">
            <p
              className="absolute
              text-white
              text-sm
              font-bold top-1
              ml-8 bg-white/20
              rounded-full px-1 py-  "
            >
              {itemCount}
            </p>
            <ShoppingCartIcon className="h-7 w-7" color="white" />
          </div>
        </Link>
        <Link href={`/orders/`}>
          <div className="flex flex-col items-center ">
            <ListOrdered className="h-7 w-7" color="white" />
          </div>
        </Link>
      </div>
    </nav>
  );
}
