import { useState, useEffect } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value)
                ? 'fill-terracotta text-terracotta'
                : 'text-obsidian/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ reviewer_name: '', rating: 0, comment: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_date', { ascending: false })
      .limit(50);

    if (!error) setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [productId]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.reviewer_name.trim()) { setError('Please enter your name.'); return; }
    if (form.rating === 0) { setError('Please select a rating.'); return; }
    setSubmitting(true);
   try {
      const { error } = await supabase
        .from('reviews')
        .insert({ ...form, product_id: productId });

      if (error) throw error;
      setForm({ reviewer_name: '', rating: 0, comment: '' });
      setSubmitted(true);
      load();
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <section className="mt-16 pt-12 border-t border-linen">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
        <div>
          <h2 className="font-display text-2xl font-bold text-obsidian">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avgRating)} readonly />
              <span className="text-sm text-obsidian/50 font-mono">
                {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-10">
        {/* Reviews list */}
        <div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-24 bg-linen rounded-xl animate-pulse" />)}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-obsidian/40 text-sm py-6">No reviews yet — be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-5">
              {reviews.map(review => (
                <div key={review.id} className="bg-white/50 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-sm text-obsidian">{review.reviewer_name}</p>
                      <p className="text-[11px] text-obsidian/30 font-mono">{formatDate(review.created_date)}</p>
                    </div>
                    <StarRating value={review.rating} readonly />
                  </div>
                  {review.comment && <p className="text-sm text-obsidian/70 leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write a review */}
        <div className="bg-white/50 rounded-2xl p-6">
          {submitted ? (
            <div className="text-center py-6">
              <Star className="w-8 h-8 text-terracotta mx-auto mb-3 fill-terracotta" />
              <p className="font-display text-lg font-semibold text-obsidian mb-1">Thanks for your review!</p>
              <p className="text-sm text-obsidian/50">Your feedback helps other shoppers.</p>
              <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)} className="mt-4 text-obsidian/40">Write another</Button>
            </div>
          ) : (
            <>
              <h3 className="font-display text-lg font-semibold text-obsidian mb-5">Write a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-obsidian/40 mb-1.5 block">Your Name</label>
                  <Input
                    value={form.reviewer_name}
                    onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                    placeholder="e.g. Ama K."
                    className="bg-white border-linen h-10"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-obsidian/40 mb-1.5 block">Rating</label>
                  <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-obsidian/40 mb-1.5 block">Comment (optional)</label>
                  <Textarea
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    placeholder="How was the quality? Would you recommend it?"
                    className="bg-white border-linen min-h-[90px] text-sm"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <Button type="submit" disabled={submitting} className="w-full bg-terracotta hover:bg-terracotta-dark text-white rounded-full">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}