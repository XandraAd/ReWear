import { Leaf, Heart, Recycle, Users } from 'lucide-react';
import { useStoreSettings } from '@/lib/useStoreSettings';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

export default function About() {
  const { settings } = useStoreSettings();

  return (
    <div className="pt-20 sm:pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-sage font-mono text-xs uppercase tracking-[0.3em] mb-3">Our Story</motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl sm:text-5xl font-bold text-obsidian mb-6">About ReWear</motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-obsidian/60 text-lg leading-relaxed max-w-2xl mx-auto">
            {settings.tagline}
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8 mb-20">
          <motion.div variants={fadeUp} className="prose-rewear text-base leading-relaxed whitespace-pre-wrap">
            {settings.about_content}
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <motion.h2 variants={fadeUp} className="font-display text-2xl font-bold text-obsidian text-center mb-10">Our Values</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Leaf, title: 'Planet First', desc: 'We believe fashion can thrive without costing the earth. Every item in our store is one less in a landfill.' },
              { icon: Recycle, title: 'Circular Economy', desc: 'We keep clothes in circulation longer, reducing the demand for new production and the waste it creates.' },
              { icon: Heart, title: 'Conscious Community', desc: "We are building a community of mindful shoppers who believe in quality over quantity." },
              { icon: Users, title: 'Accessibility', desc: 'Sustainable fashion should be for everyone. We offer quality pieces at accessible price points.' },
            ].map((val, i) => (
              <motion.div key={val.title} variants={fadeUp} custom={i}
                className="p-6 rounded-2xl bg-white/50 hover:bg-white transition-colors">
                <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-4">
                  <val.icon className="w-5 h-5 text-sage" />
                </div>
                <h3 className="font-display text-lg font-semibold text-obsidian mb-2">{val.title}</h3>
                <p className="text-sm text-obsidian/60 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}