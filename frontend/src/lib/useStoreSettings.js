import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const defaults = {
  store_name: 'ReWear',
  tagline: 'Wear it again. Save the planet.',
  contact_email: '',
  whatsapp_number: '',
  currency: 'GHS',
  shipping_fee: 0,
  free_shipping_threshold: 0,
  about_content: 'ReWear is a sustainable fashion marketplace dedicated to reducing fashion waste by giving pre-loved and new items a second life. Every purchase you make helps divert clothing from landfills and reduces the environmental impact of fast fashion.'
};

export function useStoreSettings() {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('settings')
      .select('*')
      .limit(1)                          // ← replaces .single()
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setSettings({ ...defaults, ...data[0] });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}