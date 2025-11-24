import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  // Footer data arrays
  const exploreLinks = [
    { title: "Campus Jobs", href: "/jobs" },
    { title: "Internships", href: "internship" },
    { title: "Skill Courses", href: "/learn-skills" },
    { title: "For Employers", href: "/employers" }
  ];

  const companyLinks = [
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
    { title: "Careers", href: "/careers" },
    { title: "Blog", href: "/blogs" }
  ];

  const termsLinks = [
    { title: "Terms", href: "/terms" },
    { title: "Privacy", href: "/privacy-policy" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" }
  ];

  return (
    <footer className=" border-t border-border/40 bg-gradient-to-b from-background/95 to-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Collexa" width={140} height={40} className="object-contain" />
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              Building careers with campus jobs, internships and industry-ready courses.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={index}
                    aria-label={social.label} 
                    href={social.href} 
                    className="size-10 rounded-full border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Middle Section - All Links */}
          <div className="space-y-4 grid grid-cols-3 gap-4">
            {/* Explore */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground">Explore</h4>
              <ul className="space-y-4 text-base">
                {exploreLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors duration-300">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground">Company</h4>
              <ul className="space-y-4 text-base">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors duration-300">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Terms */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground">Terms</h4>
              <ul className="space-y-4 text-base">
                {termsLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors duration-300">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Subscribe</h4>
            <p className="text-base text-muted-foreground leading-relaxed">Get career tips, new jobs and course offers in your inbox.</p>
            <form className="flex items-stretch gap-3">
              <Input type="email" placeholder="Enter your email" className="h-12 text-base rounded-lg border-primary/20 focus:border-primary" />
              <Button type="submit" className="h-12 px-6 rounded-lg font-semibold">
                Join
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
            <p className="text-sm text-muted-foreground">By subscribing, you agree to our Terms & Privacy.</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} <span className="text-foreground font-semibold">Collexa Edu</span>. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors duration-300">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors duration-300">Terms</Link>
            <Link href="/contact" className="hover:text-primary transition-colors duration-300">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;