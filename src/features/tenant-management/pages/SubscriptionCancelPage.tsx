import { XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';

export function SubscriptionCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(29,79,109,0.14),_transparent_28%),linear-gradient(180deg,_#f8fbfe_0%,_#eef4f8_100%)] px-4">
      <div className="w-full max-w-xl rounded-[28px] border border-white/70 bg-white/90 p-8 text-center shadow-[0_24px_90px_-30px_rgba(15,23,42,0.3)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <XCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-gray-900">Payment cancelled</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          You can try again anytime from the plans page.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/plans">
            <Button variant="outline" className="h-12 px-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

