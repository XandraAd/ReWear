import { MessageCircle } from 'lucide-react';
import { useStoreSettings } from '../../lib/useStoreSettings';

export default function WhatsAppButton() {
  const { settings } = useStoreSettings();
  const number = settings.whatsapp_number || '+233201921437';

  return (
    <a
      href={`https://wa.me/${number.replace(/[^0-9]/g, '')}?text=Hi! I'm interested in your products on ReWear.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <div className="flex items-center gap-2 bg-terracotta text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-terracotta-dark transition-all duration-300 hover:shadow-xl">
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">Chat with us</span>
      </div>
    </a>
  );
}