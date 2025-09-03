'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';

interface ProductDetails {
  id: string;
  name: string;
  description: string;
  product_image: string;
  basePrice: number;
  currency: string;
  isPerishable: boolean;
  variants: any[]; // Keep but ignore variants
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(setServerUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const user = clientSession?.user || serverUser;

  useEffect(() => {
    if (user?.token && params.id) {
      axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => {
        const isWishlisted = res.data.data.some((item: any) => 
          item.productId === params.id
        );
        setIsInWishlist(isWishlisted);
      });
    }
  }, [user, params.id]);

  const { data: product } = useQuery({
    queryKey: ['product', params.id],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/product?product_id=${params.id}`);
      return res.data.data as ProductDetails;
    }
  });

  const handleAddToCart = async () => {
    if (!user?.token) {
      toast.error('Please login to add items to cart');
      router.push(`/employee-login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (user.role !== 'user') {
      toast.error('Only employees can add products to cart');
      return;
    }
    // if (user.status === 'PENDING') {
    //   toast.error('');
    //   return;
    // }

    // Create payload with productId only (no variantId)
    const payload = { productId: params.id, quantity };

    let toastId: string | number | undefined;
    try {
      setIsAddingToCart(true);
      toastId = toast.loading('Adding to cart...');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/cart/add-to-cart`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success('Item added to cart!', { 
          id: toastId,
          action: {
            label: 'View Cart',
            onClick: () => router.push('/cart')
          }
        });
        // Redirect to cart page after 2 seconds
        setTimeout(() => router.push('/cart'), 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart', { id: toastId });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user?.token) {
      toast.error('Please login to manage wishlist');
      router.push(`/employee-login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const payload = {
        productId: isInWishlist ? null : params.id,
        variantId: null // Always null for products
      };

      if (isInWishlist) {
        // Find and remove the specific wishlist item
        const wishlistRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const itemToRemove = wishlistRes.data.data.find((item: any) => 
          item.productId === params.id
        );
        
        if (itemToRemove) {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist/remove-from-wishlist/${itemToRemove.id}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
        }
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/wishlist/add-to-wishlist`,
          payload,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }

      setIsInWishlist(!isInWishlist);
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (isLoading) return <div className="container py-8">Loading product...</div>;

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="relative h-96 w-full rounded-lg overflow-hidden">
            <Image
              src={product?.product_image || '/placeholder-product.jpg'}
              alt={product?.name || 'Product image'}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product?.name}</h1>
          <p className="text-gray-600 mb-6">{product?.description}</p>

          <div className="mb-6">
            <span className={`text-sm px-3 py-1 rounded ${
              product?.isPerishable
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {product?.isPerishable ? "Perishable" : "Non-Perishable"}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Price</h2>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: product?.currency || 'NGN',
              }).format(product?.basePrice || 0)}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Quantity</h2>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={decrementQuantity}>
                -
              </Button>
              <span className="text-lg font-medium">{quantity}</span>
              <Button variant="outline" size="icon" onClick={incrementQuantity}>
                +
              </Button>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full bg-green-700 hover:bg-green-600 text-white"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full my-3"
            onClick={toggleWishlist}
          >
            {isInWishlist ? (
              <>
                <HeartOff className="mr-2 h-4 w-4" />
                Remove from Wishlist
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Add to Wishlist
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}