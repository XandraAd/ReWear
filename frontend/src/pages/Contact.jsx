import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useStoreSettings } from '../lib/useStoreSettings';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

export default function Contact() {
  const { settings } = useStoreSettings();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.name || !form.email || !form.message) return;
  setSending(true);

  try {
 await emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  {
    from_name: form.name,
    from_email: form.email,
    message: form.message,
    title: `Message from ${form.name}`,   // ← add this
    to_email: settings.contact_email || 'hello@rewear.com',
  },
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY
);
    setSent(true);
  } catch (err) {
    console.error('Email error:', err);
    alert('Failed to send message. Please try again.');
  } finally {
    setSending(false);
  }
};
  return (
    <div className="pt-20 sm:pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" className="text-center mb-14">
          <motion.p variants={fadeUp} className="text-sage font-mono text-xs uppercase tracking-[0.3em] mb-3">Get in Touch</motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl sm:text-5xl font-bold text-obsidian mb-4">Contact Us</motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-obsidian/60 max-w-lg mx-auto">
            Have a question or want to sell your pre-loved items? We'd love to hear from you.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-10">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle className="w-12 h-12 text-sage mb-4" />
              <h2 className="font-display text-2xl font-bold text-obsidian mb-2">Message Sent!</h2>
              <p className="text-obsidian/60">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Your Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-white/60 border-linen h-11" placeholder="Your name" required />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-white/60 border-linen h-11" placeholder="you@email.com" required />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Message</Label>
                <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="bg-white/60 border-linen min-h-[140px]" placeholder="Tell us what's on your mind..." required />
              </div>
              <Button type="submit" disabled={sending} className="bg-terracotta hover:bg-terracotta-dark text-white rounded-full px-8">
                <Send className="w-4 h-4 mr-2" /> {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          )}

          <div className="space-y-6">
            <div className="bg-white/50 rounded-2xl p-6 space-y-5">
              {settings.contact_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-sage mt-0.5" />
                  <div>
                    <p className="text-xs font-mono uppercase text-obsidian/40 mb-0.5">Email</p>
                    <a href={`mailto:${settings.contact_email}`} className="text-sm text-obsidian hover:text-terracotta transition-colors">{settings.contact_email}</a>
                  </div>
                </div>
              )}
              {settings.whatsapp_number && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-sage mt-0.5" />
                  <div>
                    <p className="text-xs font-mono uppercase text-obsidian/40 mb-0.5">WhatsApp</p>
                    <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-obsidian hover:text-terracotta transition-colors">{settings.whatsapp_number}</a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sage mt-0.5" />
                <div>
                  <p className="text-xs font-mono uppercase text-obsidian/40 mb-0.5">Location</p>
                  <p className="text-sm text-obsidian">Accra, Ghana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}