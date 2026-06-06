"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItemProps {
  question: string;
  answer: string | React.ReactNode;
}

export function FaqAccordion({ items }: { items: FaqItemProps[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className="border border-border/50 bg-card rounded-xl overflow-hidden transition-colors hover:border-primary/50"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
            >
              <span className="font-heading font-semibold text-lg uppercase tracking-wide">
                {item.question}
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
