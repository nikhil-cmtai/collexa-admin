"use client"

import React, { useState, useEffect } from "react";
import { MessageCircle, ArrowUp, Facebook, Instagram, Twitter } from "lucide-react";

const ICON_SIZE = 28; // uniform icon size for chat and scroll to top

const FloatingButtons = () => {
  const [showScroll, setShowScroll] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScroll(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Only show these on expand
  const expandedButtons = [
    {
      href: "https://wa.me/918000000000",
      label: "WhatsApp",
      icon: <MessageCircle size={ICON_SIZE} />,
    },
    {
      href: "https://facebook.com",
      label: "Facebook",
      icon: <Facebook size={ICON_SIZE} />,
    },
    {
      href: "https://instagram.com",
      label: "Instagram",
      icon: <Instagram size={ICON_SIZE} />,
    },
    {
      href: "https://twitter.com",
      label: "Twitter",
      icon: <Twitter size={ICON_SIZE} />,
    },
  ];


  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Expanded Social Buttons */}
      <div className="flex flex-col items-end gap-3 mb-2">
        {expanded &&
          expandedButtons.map((btn, idx) => (
            <a
              key={btn.label}
              href={btn.href}
              target={btn.href.startsWith("http") ? "_blank" : undefined}
              rel={btn.href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={btn.label}
              className={`
                group relative flex items-center justify-center h-12 w-12 rounded-full border border-primary
                transition-all duration-200
                hover:scale-110
                ${expanded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 -translate-y-2 pointer-events-none"}
              `}
              style={{
                transitionDelay: `${idx * 40}ms`,
                background: "transparent",
                color: "#222",
                boxShadow: "none",
              }}
              tabIndex={expanded ? 0 : -1}
            >
              {btn.icon}
              <span className="absolute right-14 opacity-0 group-hover:opacity-100 bg-neutral-800 text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition-all duration-200 pointer-events-none">
                {btn.label}
              </span>
            </a>
          ))}
      </div>
      {/* Main Chat Button */}
      <button
        aria-label="Open chat/social actions"
        onClick={() => setExpanded((v) => !v)}
        className={`
          flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-lg
          hover:scale-110 transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-primary
          ${expanded ? "rotate-90" : ""}
        `}
      >
        <MessageCircle size={ICON_SIZE} className="drop-shadow" />
      </button>
      {/* Scroll to Top */}
      {showScroll && (
        <button
          onClick={handleScrollTop}
          aria-label="Scroll to top"
          className="group relative mt-2 flex items-center justify-center h-12 w-12 rounded-full bg-white text-primary border border-primary shadow-lg hover:bg-secondary hover:text-white hover:scale-110 transition-all duration-150"
        >
          <ArrowUp size={ICON_SIZE} className="drop-shadow" />
          <span className="absolute right-14 opacity-0 group-hover:opacity-100 bg-secondary text-white px-3 py-1 rounded-md text-xs font-semibold shadow transition-all duration-200 pointer-events-none">
            Top
          </span>
        </button>
      )}
    </div>
  );
};

export default FloatingButtons;