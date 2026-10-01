import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the break-in period for a V Collection Goodyear-welted shoe?',
      a: 'Because our shoes are built with oak bark-tanned leather insoles and pure granulated Portuguese cork infill, they will naturally conform to your specific foot arch over approximately 8 to 12 hours of light wear. Once molded, they provide bespoke orthopedic support unmatched by mass-produced footwear.',
    },
    {
      q: 'What is included in the complimentary atelier care package?',
      a: 'Every pair of V Collection shoes arrives packaged with a pair of solid aromatic red cedar shoe trees tailored to the specific shoe last, two monogrammed velvet dust protection travel bags, a jar of Saphir Médaille d’Or 1925 natural beeswax polish matching your leather finish, and a hand-turned brass shoe horn.',
    },
    {
      q: 'How does your nationwide insured delivery work across Pakistan?',
      a: 'All orders ship with certified express insured courier across Pakistan (TCS Express, Trax Logistics, or White-Glove VIP Rider). A standard drop shipping fee applies to any order regardless of location. You will never receive unexpected delivery brokerage charges at your doorstep.',
    },
    {
      q: 'How does Cash on Delivery (COD) white-glove inspection work?',
      a: 'For select metropolitan destinations, we offer White-Glove Cash on Delivery. Our courier delivers your boxed commission, allowing you to unbox and inspect the leather finish, size fit, and cedar shoe trees before tendering cash or payment via handheld card terminal.',
    },
    {
      q: 'Can V Collection shoes be resoled after years of wear?',
      a: 'Yes. Thanks to authentic Goodyear-welted and Norwegian storm-welted construction, the outsole is stitched to a separate leather welt rather than directly to the upper. This allows our atelier (or any master cobbler) to completely remove and replace the sole dozens of times over a lifetime without altering the shoe upper.',
    },
    {
      q: 'What is your exchange and return policy?',
      a: 'We offer a 30-day complimentary exchange privilege. If you require an alternate European half-size or leather tone, our concierge will dispatch a courier to collect your unworn pair in its original packaging and dispatch your replacement immediately with no return shipping fees.',
    },
  ];

  return (
    <div className="bg-[#0b0d11] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-medium flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Atelier Knowledge Base</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#f9e7c4]">
            Frequently Addressed Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Insights on bespoke cordwaining, fitting precision, and worldwide dispatch.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#12151e] border border-white/10 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-base sm:text-lg text-[#f5ebd7]"
              >
                <span>{faq.q}</span>
                {openIdx === idx ? (
                  <ChevronUp className="w-5 h-5 text-[#d4af37] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
                )}
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-light border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
