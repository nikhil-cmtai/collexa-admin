"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  X, 
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationData: {
    [key: string]: {
      icon: React.ElementType;
      items: Array<{
        title: string;
        items: Array<{ title: string; href: string }>;
        badge?: string;
      }>;
    };
  };
}

const MobileMenu = ({ isOpen, onClose, navigationData }: MobileMenuProps) => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? [] // Close all sections
        : [section] // Open only this section
    );
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg md:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          
          {/* Sidebar */}
          <motion.div 
            className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200/30 md:hidden h-screen overflow-hidden flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/30 bg-white flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 group" onClick={() => {
              setTimeout(() => onClose(), 100);
            }}>
              <Image 
                src="/logo.png" 
                alt="Collexa" 
                width={120} 
                height={40} 
                className="object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-3 hover:bg-primary/15 rounded-full transition-all duration-300 hover:scale-110"
            >
              <X className="h-6 w-6 text-gray-700 hover:text-primary transition-colors duration-300" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <nav className="p-6 space-y-2">
              {/* Home Link */}
              <Link
                href="/"
                className={cn(
                  "flex items-center px-4 py-3 text-base font-medium transition-all duration-300 group",
                  isActive('/') 
                    ? "text-primary font-semibold" 
                    : "text-gray-800 hover:text-primary"
                )}
                onClick={() => {
                  setTimeout(() => onClose(), 100);
                }}
              >
                <Home className="mr-4 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                Home
              </Link>

            {/* Main Navigation Sections */}
            {Object.entries(navigationData).map(([sectionName, sectionData]) => {
              const Icon = sectionData.icon;
              const isExpanded = expandedSections.includes(sectionName);
              
              return (
                <div key={sectionName} className="space-y-1">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(sectionName)}
                    className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-800 hover:text-primary transition-all duration-300 group"
                  >
                    <div className="flex items-center">
                      <Icon className="mr-4 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      {sectionName}
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-all duration-300 group-hover:scale-110",
                        isExpanded && "rotate-180"
                      )} 
                    />
                  </button>

                  {/* Section Items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        className="ml-8 space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {sectionData.items.map((category, categoryIndex) => (
                          <motion.div 
                            key={category.title} 
                            className="space-y-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: categoryIndex * 0.1,
                              ease: "easeOut"
                            }}
                          >
                            {/* Category Header */}
                            <div className="px-4 py-2 text-sm font-semibold text-primary/80 uppercase tracking-wide border-l-4 border-primary">
                              {category.title}
                            </div>
                            
                            {/* Category Items */}
                            <div className="space-y-1">
                              {category.items.map((item, itemIndex) => (
                                <motion.div
                                  key={item.title}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ 
                                    duration: 0.3, 
                                    delay: (categoryIndex * 0.1) + (itemIndex * 0.05),
                                    ease: "easeOut"
                                  }}
                                >
                                  <Link
                                    href={item.href}
                                    className={cn(
                                      "block px-4 py-2 text-sm text-gray-600 hover:text-primary transition-all duration-300",
                                      isActive(item.href) && "text-primary font-medium"
                                    )}
                                    onClick={() => {
                                      setTimeout(() => onClose(), 100);
                                    }}
                                  >
                                    {item.title}
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

          {/* Footer */}
          <div className="border-t border-gray-200/30 p-6 bg-white flex-shrink-0">
            <div className="space-y-4">
              <Button 
                asChild
                variant="outline"
                className="w-full bg-white hover:bg-white text-secondary border-2 border-primary font-bold py-4 rounded-lg transition-all duration-300 hover:border-secondary hover:text-primary hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
              >
                <Link href="/login" onClick={() => {
                  setTimeout(() => onClose(), 100);
                }}>
                  Login / Signup
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;