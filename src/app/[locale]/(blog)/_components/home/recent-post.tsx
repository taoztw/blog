"use client";

import { useState, useRef, useEffect, type TouchEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from "lucide-react";
import type { PostWithRelations } from "@/global";
import PostLatestCard from "../cards/post-latest-card";

export const blogPosts: PostWithRelations[] = [
  {
    id: "clx1a2b3c4d5e6f7g8h9i0j1",
    title: "AI-Powered Marketing: The Future of Customer Engagement",
    slug: "ai-powered-marketing-future",
    excerpt:
      "Explore how artificial intelligence is revolutionizing marketing strategies and creating personalized customer experiences at scale.",
    content: "Full content about AI-powered marketing...",
    imageUrl: "/tmp/p1.jpg",
    status: "PUBLISHED",
    viewCount: 1247,
    likeCount: 89,
    createdById: "usr_123456789",
    categoryId: "1",
    author: {
      id: "usr_123456789",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      image: "/avatars/sarah-chen.jpg",
    },
    category: {
      id: 1,
      name: "Artificial Intelligence",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx2b3c4d5e6f7g8h9i0j1k2",
    title: "Building Brand Loyalty Through Social Media Storytelling",
    slug: "brand-loyalty-social-media",
    excerpt:
      "Discover the art of crafting compelling brand narratives that resonate with your audience and drive long-term loyalty.",
    content: "Full content about social media storytelling...",
    imageUrl: "/tmp/p2.jpg",
    status: "PUBLISHED",
    viewCount: 892,
    likeCount: 156,
    createdById: "usr_987654321",
    categoryId: "2",
    author: {
      id: "usr_987654321",
      name: "Marcus Rodriguez",
      email: "marcus.r@example.com",
      image: "/avatars/marcus-rodriguez.jpg",
    },
    category: {
      id: 2,
      name: "Social Media",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx3c4d5e6f7g8h9i0j1k2l3",
    title: "The Rise of Voice Commerce: Optimizing for Audio Shopping",
    slug: "voice-commerce-optimization",
    excerpt:
      "Learn how voice assistants are changing the e-commerce landscape and how to optimize your business for voice commerce.",
    content: "Full content about voice commerce...",
    imageUrl: "/tmp/p3.jpg",
    status: "PUBLISHED",
    viewCount: 634,
    likeCount: 78,
    createdById: "usr_456789123",
    categoryId: "3",
    author: {
      id: "usr_456789123",
      name: "Emily Watson",
      email: "emily.watson@example.com",
      image: "/avatars/emily-watson.jpg",
    },
    category: {
      id: 3,
      name: "E-commerce",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx4d5e6f7g8h9i0j1k2l3m4",
    title: "Sustainable Marketing: Connecting with Eco-Conscious Consumers",
    slug: "sustainable-marketing-eco-conscious",
    excerpt:
      "Understand how sustainability messaging can differentiate your brand and attract environmentally conscious customers.",
    content: "Full content about sustainable marketing...",
    imageUrl: "/tmp/p4.jpg",
    status: "PUBLISHED",
    viewCount: 1089,
    likeCount: 203,
    createdById: "usr_789123456",
    categoryId: "4",
    author: {
      id: "usr_789123456",
      name: "David Kim",
      email: "david.kim@example.com",
      image: "/avatars/david-kim.jpg",
    },
    category: {
      id: 4,
      name: "Sustainability",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx5e6f7g8h9i0j1k2l3m4n5",
    title: "Micro-Influencer Marketing: Quality Over Quantity",
    slug: "micro-influencer-marketing",
    excerpt:
      "Why partnering with micro-influencers often delivers better ROI than celebrity endorsements and how to find the right partners.",
    content: "Full content about micro-influencer marketing...",
    imageUrl: "/tmp/p2.jpg",
    status: "PUBLISHED",
    viewCount: 756,
    likeCount: 124,
    createdById: "usr_321654987",
    categoryId: "2",
    author: {
      id: "usr_321654987",
      name: "Jessica Liu",
      email: "jessica.liu@example.com",
      image: "/avatars/jessica-liu.jpg",
    },
    category: {
      id: 2,
      name: "Social Media",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "clx6f7g8h9i0j1k2l3m4n5o6",
    title: "The Psychology of Color in Digital Marketing",
    slug: "color-psychology-digital-marketing",
    excerpt:
      "Explore how color choices impact consumer behavior and learn to use color psychology to improve your marketing effectiveness.",
    content: "Full content about color psychology...",
    imageUrl: "/tmp/p4.jpg",
    status: "DRAFT",
    viewCount: 0,
    likeCount: 0,
    createdById: "usr_654987321",
    categoryId: "5",
    author: {
      id: "usr_654987321",
      name: "Alex Thompson",
      email: "alex.thompson@example.com",
      image: "/avatars/alex-thompson.jpg",
    },
    category: {
      id: 5,
      name: "Design",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function RecentBlogSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible items based on screen size
  const visibleItems = screenSize.isDesktop ? 3 : screenSize.isTablet ? 2 : 1;
  const maxIndex = Math.max(0, blogPosts.length - visibleItems);

  // Initialize and update screen size
  useEffect(() => {
    const updateScreenSize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setScreenSize({
          isMobile: width < 640,
          isTablet: width >= 640 && width < 1024,
          isDesktop: width >= 1024,
        });
      }
    };

    // Initial check
    updateScreenSize();

    // Listen for resize
    window.addEventListener("resize", updateScreenSize);

    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  // Ensure current index is valid when screen size changes
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [screenSize, maxIndex]);

  // Handle navigation
  function handlePrevious() {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }

  function handleNext() {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }

  // Scroll to current index
  useEffect(() => {
    if (sliderRef.current) {
      const scrollToIndex = () => {
        if (sliderRef.current) {
          const cardWidth = sliderRef.current.querySelector(".carousel-item")?.clientWidth || 0;
          const scrollLeft = cardWidth * currentIndex;

          sliderRef.current.scrollTo({
            left: scrollLeft,
            behavior: "smooth",
          });
        }
      };

      // Small delay to ensure the DOM has updated
      const timeoutId = setTimeout(scrollToIndex, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, screenSize]);

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsSwiping(true);
    setStartX(e.touches[0]!.clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;

    const currentX = e.touches[0]!.clientX;
    const diff = startX - currentX;

    // Prevent default to stop page scrolling during swipe
    if (Math.abs(diff) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;

    const currentX = e.changedTouches[0]!.clientX;
    const diff = startX - currentX;

    // Determine if swipe is significant
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < maxIndex) {
        handleNext();
      } else if (diff < 0 && currentIndex > 0) {
        handlePrevious();
      }
    }

    setIsSwiping(false);
  };

  // Progress indicators
  const renderProgressIndicators = () => {
    return (
      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${i === currentIndex ? "bg-primary w-6" : "bg-primary/30 w-2"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    // <section className="py-4 md:py-8 lg:py-12">
    <section className="pb-4 md:pb-8 lg:pb-12">
      <div ref={containerRef} className="container mx-auto space-y-6 px-4 md:space-y-8 md:px-6 2xl:max-w-[1400px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md space-y-1">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Latest Articles</h2>
            <p className="text-muted-foreground text-sm md:text-base">Stay updated with our most recent insights</p>
          </div>
          <div className="hidden items-center space-x-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={sliderRef}
            className="scrollbar-hide -mx-4 flex touch-pan-x snap-x snap-mandatory overflow-x-auto px-4 pt-1 pb-2 md:pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {blogPosts.map((post) => (
              <PostLatestCard post={post} key={post.id} />
            ))}
          </div>

          {/* Progress indicators for mobile */}
          <div className="sm:hidden">{renderProgressIndicators()}</div>

          {/* Mobile navigation buttons - only shown on very small screens */}
          <div className="mt-6 flex items-center justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="mr-2 h-9 flex-1 text-xs"
            >
              <ChevronLeftIcon className="mr-1 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              className="ml-2 h-9 flex-1 text-xs"
            >
              Next
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
