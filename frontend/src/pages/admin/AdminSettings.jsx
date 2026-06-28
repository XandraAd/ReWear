import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

useEffect(() => {
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
       .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setSettings(data);
        setSettingsId(data.id);
      } else {
        setSettings({
          store_name: "ReWear",
          tagline: "Wear it again. Save the planet.",
          contact_email: "",
          whatsapp_number: "",
          currency: "GHS",
          shipping_fee: 0,
          free_shipping_threshold: 0,
          about_content:
            "ReWear is a sustainable fashion marketplace dedicated to reducing fashion waste by giving pre-loved and new items a second life.",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchSettings();
}, []);

  const handleSave = async () => {
  setSaving(true);

  try {
    const data = {
      ...settings,
      shipping_fee: Number(settings.shipping_fee) || 0,
      free_shipping_threshold:
        Number(settings.free_shipping_threshold) || 0,
    };

    if (settingsId) {
      const { error } = await supabase
        .from("settings")
        .update(data)
        .eq("id", settingsId);

      if (error) throw error;
    } else {
      const { data: created, error } = await supabase
        .from("settings")
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setSettingsId(created.id);
    }

    toast({
      title: "Settings saved successfully",
    });
  } catch (error) {
    console.error(error);

    toast({
      title: "Error saving settings",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};

  if (loading || !settings) {
    return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
          <p className="text-white/40 text-sm mt-1">Manage your store configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-terracotta hover:bg-terracotta-dark text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Store Info */}
        <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6 space-y-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white/30">Store Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">Store Name</Label>
              <Input value={settings.store_name} onChange={e => update('store_name', e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">Tagline</Label>
              <Input value={settings.tagline} onChange={e => update('tagline', e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">Contact Email</Label>
              <Input value={settings.contact_email} onChange={e => update('contact_email', e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">WhatsApp Number</Label>
              <Input value={settings.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="233XXXXXXXXX" />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6 space-y-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white/30">Shipping & Currency</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">Currency</Label>
              <Input value={settings.currency} onChange={e => update('currency', e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">Shipping Fee (flat)</Label>
              <Input type="number" value={settings.shipping_fee} onChange={e => update('shipping_fee', e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">Free Shipping Above</Label>
              <Input type="number" value={settings.free_shipping_threshold} onChange={e => update('free_shipping_threshold', e.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="0 = no free shipping" />
            </div>
          </div>
        </div>

        {/* About Page Content */}
        <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6 space-y-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white/30">About Us Page Content</h2>
          <Textarea value={settings.about_content} onChange={e => update('about_content', e.target.value)}
            className="bg-white/5 border-white/10 text-white min-h-[200px]" />
        </div>
      </div>
    </div>
  );
}