import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Check, Send, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Bespoke Appointment');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-[#0b0d11] min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-medium">
            Atelier Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#f9e7c4]">
            Connect With Our Master Cordwainers
          </h1>
          <p className="text-zinc-400 text-sm font-light">
            Whether inquiring about sizing, express delivery across Pakistan, or product details, our client concierge is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#12151e] border border-white/10 space-y-6">
              <h3 className="font-serif text-xl text-white">Direct Communication</h3>
              
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs uppercase text-zinc-500 font-semibold">Telephone Concierge & Support</span>
                  <a
                    href="tel:+923421080908"
                    className="text-sm text-zinc-200 hover:text-[#d4af37] font-mono transition-colors block"
                  >
                    +92 342 1080908
                  </a>
                  <span className="block text-[11px] text-zinc-400">Pakistan Standard Time (PKT, Mon–Sat, 10am–8pm)</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs uppercase text-zinc-500 font-semibold">Electronic Mail</span>
                  <span className="text-sm text-zinc-200">concierge@vcollection.pk</span>
                  <span className="block text-[11px] text-zinc-400">Guaranteed response within 4 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                    <path d="M12.031 2C6.496 2 2 6.495 2 12.029c0 1.99.582 3.865 1.624 5.46L2.2 21.8l4.475-1.397a9.988 9.988 0 0 0 5.356 1.626h.004c5.534 0 10.029-4.495 10.029-10.03C22.064 6.495 17.567 2 12.031 2zm5.836 14.184c-.244.686-1.42 1.31-1.956 1.396-.51.082-1.16.117-1.873-.111-.43-.138-.987-.323-1.696-.632-2.984-1.3-4.93-4.32-5.08-4.52-.148-.198-1.205-1.602-1.205-3.056 0-1.455.76-2.17 1.03-2.464.271-.295.592-.368.79-.368.197 0 .394.002.565.01.183.008.43-.07.671.512.247.595.84 2.052.913 2.202.074.148.123.324.024.52-.098.197-.148.32-.295.493-.148.172-.31.385-.444.516-.148.147-.302.308-.13.603.173.296.768 1.266 1.65 2.052 1.135 1.01 2.091 1.323 2.387 1.47.296.148.468.123.64-.074.173-.197.74-.862.937-1.158.197-.296.395-.246.666-.148.27.098 1.727.813 2.023.961.296.148.493.222.566.345.074.123.074.715-.17 1.401z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs uppercase text-zinc-500 font-semibold">Official WhatsApp Channel</span>
                  <a
                    href="https://whatsapp.com/channel/0029VbDaihxJ3jv4LJUrRx1r"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#42e880] hover:underline font-medium block"
                  >
                    Join V Collection Channel →
                  </a>
                  <span className="block text-[11px] text-zinc-400">Instant updates for new drops and seasonal restocks</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs uppercase text-zinc-500 font-semibold">Flagship Atelier & Hub</span>
                  <span className="text-sm text-zinc-200">Gulberg III, MM Alam Road, Lahore, Pakistan</span>
                  <span className="block text-[11px] text-zinc-400">Express courier dispatch daily nationwide</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12151e] to-[#181d2a] border border-gold-subtle space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#d4af37] font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Virtual Sizing Consultation</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-light">
                Request a 20-minute video appointment with our fitting master. We will evaluate your foot measurements and recommend the ideal shoe last and leather finish.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl bg-[#12151e] border border-white/10 shadow-2xl">
              {submitted ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/50">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl text-white">Inquiry Received</h3>
                  <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                    Thank you, {name}. Our Pakistan concierge team has received your request and will reach out to <strong>{email}</strong> within 4 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2 rounded-xl bg-white/10 text-xs text-white hover:bg-white/20"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-serif text-xl text-[#f5ebd7] mb-2">Send Concierge Dispatch</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Syed Bilal"
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Inquiry Nature</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#0e1017] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Sizing Advice">Anatomical Last & Sizing Consultation (Pakistan)</option>
                      <option value="Delivery Status">Express Courier Tracking & Delivery Inquiry</option>
                      <option value="Corporate Orders">Executive & Bulk Corporate Orders</option>
                      <option value="Exchange">7-Day Size Exchange Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Your Message & Details</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please indicate your preferred appointment dates, shoe models of interest, or sizing queries..."
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e2c158] to-[#aa8329] text-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Transmit Dispatch to Concierge</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
