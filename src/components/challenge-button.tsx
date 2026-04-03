"use client";

import { useState, useRef, useEffect } from "react";

export function ChallengeButton({ trackId, trackName, trackArtist }: {
  trackId: string;
  trackName: string;
  trackArtist: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/challenge/${trackId}`;
  const text = `Think you can survive "${trackName}" by ${trackArtist} on repeat? Prove it.`;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = `${text}\n${url}`;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1500);
  };

  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  const links = [
    { name: "X / Twitter", href: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}` },
    { name: "Reddit", href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}` },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:border-red-500 hover:text-red-400 transition"
      >
        Challenge
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-zinc-900 border border-white/10 shadow-xl overflow-hidden z-50">
          <button
            onClick={copyToClipboard}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 transition"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <div className="border-t border-white/5" />
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 transition"
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
