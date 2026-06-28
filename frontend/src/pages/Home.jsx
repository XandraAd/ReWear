import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Recycle, Heart, Droplets, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import ProductCard from '../components/store/ProductCard';
import { motion } from 'framer-motion';

import HERO_IMAGE from '../assets/Hero Image.png';
import CAT_CLOTHING from '../assets/Cat_image.png';
import CAT_BAGS from '../assets/Cat_bags.png';
import CAT_SHOES from '../assets/cat-shoes.png';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] } })
};

const STATS = [
  { value: '2,700L', label: 'water saved per tee' },
  { value: '82%', label: 'less CO₂ per garment' },
  { value: '7kg', label: 'kept from landfill' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => setFeatured(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-cream">

      {/* ── HERO ── */}
      <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_42%]">
        {/* Left — copy */}
        <div className="relative z-10 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-32 lg:py-0 bg-cream">
          <motion.div initial="hidden" animate="visible">
              <motion.p variants={fadeUp} custom={0}
              className="text-sage font-mono text-[10px] uppercase tracking-[0.35em] mb-6 flex items-center gap-2">
              <img
                src="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 1'%3E%3Crect width='24' height='1' fill='currentColor'/%3E%3C/svg%3E"
                alt="Decorative divider"
                className="w-6 h-px text-sage inline-block"
                />
              Sustainable Fashion · Accra
            </motion.p>

            <motion.h1 variants={fadeUp} custom={1}
              className="font-display text-[clamp(3rem,7vw,6rem)] font-bold text-obsidian leading-[0.95] mb-8 tracking-tight">
              Wear it<br />
              <em className="not-italic text-terracotta">again.</em><br />
              Save the<br />planet.
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              className="text-obsidian/55 text-lg leading-relaxed mb-10 max-w-sm font-body">
              Pre-loved clothing, bags and shoes — curated for quality, priced for people.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
              <Button asChild size="lg"
                className="bg-obsidian hover:bg-obsidian/85 text-cream rounded-full px-8 text-sm tracking-wide">
                <Link to="/shop">Browse the archive <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline"
                className="border-obsidian/20 text-obsidian hover:bg-obsidian/5 rounded-full px-8 text-sm">
                <Link to="/about">Our mission</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stat strip — sits at bottom of left column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-10 left-6 sm:left-12 lg:left-20 right-6 lg:right-0 flex gap-8">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold text-obsidian">{s.value}</p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-obsidian/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — hero image, full bleed */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block">
          <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
          {/* Subtle left fade so it bleeds into cream */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-transparent to-transparent w-1/3" />
          {/* Eco badge */}
          <div className="absolute top-16 right-8 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-sage" />
            <span className="text-xs font-mono uppercase tracking-wider text-obsidian/70">Circular fashion</span>
          </div>
        </motion.div>

        {/* Mobile hero image */}
        <div className="relative h-72 lg:hidden">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent" />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="flex items-end justify-between mb-12">
            <div>
              <motion.p variants={fadeUp}
                className="text-sage font-mono text-[10px] uppercase tracking-[0.35em] mb-2">The archive</motion.p>
              <motion.h2 variants={fadeUp} custom={1}
                className="font-display text-4xl sm:text-5xl font-bold text-obsidian">Shop by category</motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2} className="hidden sm:block">
              <Link to="/shop" className="text-sm font-mono text-obsidian/40 hover:text-obsidian flex items-center gap-1 transition-colors">
                All items <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Asymmetric 3-column layout */}
          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr] gap-4">
            {[
              { name: 'Clothing', image: CAT_CLOTHING, tall: true },
              { name: 'Bags', image: CAT_BAGS, tall: false },
              { name: 'Shoes', image: CAT_SHOES, tall: false },
            ].map((cat, i) => (
              <motion.div key={cat.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className={cat.tall ? 'row-span-1 sm:row-span-2' : ''}>
                <Link to={`/shop?category=${cat.name}`}
                  className={`group relative rounded-2xl overflow-hidden block ${cat.tall ? 'aspect-[2/3] sm:h-full' : 'aspect-square'}`}>
                  <img src={cat.image} alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  {/* Dark gradient from bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/75 via-obsidian/10 to-transparent" />
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/50 mb-1">{cat.name}</p>
                      <h3 className="font-display text-2xl font-bold text-white">{cat.name}</h3>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center
                      group-hover:bg-terracotta transition-colors duration-300">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="py-24 sm:py-32 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="flex items-end justify-between mb-12">
            <div>
              <motion.p variants={fadeUp}
                className="text-sage font-mono text-[10px] uppercase tracking-[0.35em] mb-2">Just dropped</motion.p>
              <motion.h2 variants={fadeUp} custom={1}
                className="font-display text-4xl sm:text-5xl font-bold text-obsidian">New arrivals</motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2}>
              <Link to="/shop"
                className="text-sm font-mono text-obsidian/40 hover:text-obsidian flex items-center gap-1 transition-colors">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-linen rounded-xl mb-3" />
                  <div className="h-3.5 bg-linen rounded w-3/4 mb-2" />
                  <div className="h-3 bg-linen rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-linen rounded-2xl">
              <p className="font-display text-xl text-obsidian/30">New pieces coming soon</p>
              <Link to="/shop" className="text-sm text-terracotta mt-3 inline-block hover:underline">Browse everything →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 items-start">

            {/* Left — heading pinned */}
            <motion.div variants={fadeUp} className="lg:sticky lg:top-28">
              <p className="text-sage font-mono text-[10px] uppercase tracking-[0.35em] mb-3">Why it matters</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-obsidian mb-5">
                Fashion without the waste.
              </h2>
              <p className="text-obsidian/55 leading-relaxed text-base mb-8">
                Every piece you buy pre-loved saves water, cuts emissions, and keeps clothing in circulation — not landfill.
              </p>
              <Button asChild variant="outline"
                className="border-obsidian/20 text-obsidian hover:bg-obsidian/5 rounded-full text-sm">
                <Link to="/about">Read our story <ArrowRight className="ml-2 w-3.5 h-3.5" /></Link>
              </Button>
            </motion.div>

            {/* Right — impact cards in 2×2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Recycle, title: 'Less waste', stat: '~7kg', desc: 'of clothing kept out of landfill per item bought second-hand.' },
                { icon: Droplets, title: 'Save water', stat: '2,700L', desc: 'saved — what it takes to make a single cotton t-shirt from new.' },
                { icon: Leaf, title: 'Cut CO₂', stat: '82%', desc: 'fewer carbon emissions per garment versus buying new.' },
                { icon: Heart, title: 'Community', stat: '100%', desc: 'of proceeds stay local, supporting a circular economy in Ghana.' },
              ].map((item, i) => (
                <motion.div key={item.title}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} custom={i}
                  className="bg-white rounded-2xl p-6 border border-linen/80">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-sage" />
                    </div>
                    <span className="font-display text-2xl font-bold text-obsidian/10">{item.stat}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-obsidian mb-1.5">{item.title}</h3>
                  <p className="text-sm text-obsidian/55 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-24 sm:pb-32 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden bg-obsidian px-10 sm:px-16 py-16 sm:py-20 text-center">
            {/* Subtle texture */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="relative z-10">
              <p className="text-sage-light font-mono text-[10px] uppercase tracking-[0.35em] mb-4">The archive is open</p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
                Find your next<br />favourite piece.
              </h2>
              <p className="text-white/50 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
                Hundreds of pre-loved items across clothing, bags and shoes — updated regularly.
              </p>
              <Button asChild size="lg"
                className="bg-terracotta hover:bg-terracotta-dark text-white rounded-full px-10 text-sm tracking-wide">
                <Link to="/shop">Shop the collection <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}