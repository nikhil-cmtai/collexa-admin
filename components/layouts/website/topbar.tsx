import React from 'react';
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';

const Topbar = () => {
  return (
    <div className="w-full bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b border-primary/10 py-1 z-50 relative text-xs px-4 md:text-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Contact Info */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 md:h-4 md:w-4" />
            <a href="mailto:support@collexa.com" className="hover:text-primary underline transition-colors">support@collexa.com</a>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 md:h-4 md:w-4" />
            <a href="tel:+911234567890" className="hover:text-primary underline transition-colors">+91 12345 67890</a>
          </div>
        </div>
        {/* Social Icons & Contact Us */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-primary transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-primary transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
          <Link
            href="/contact"
            className="text-primary font-medium underline hover:text-primary/80 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Topbar;