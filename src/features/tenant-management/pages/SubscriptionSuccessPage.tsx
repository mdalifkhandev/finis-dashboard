import { startTransition } from 'react';
import { CheckCircle2, ArrowRight, Sparkles, ShieldCheck, CreditCard, WandSparkles, CircleCheckBig } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';

export function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] px-4 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.2),_transparent_30%),linear-gradient(180deg,#07111f_0%,#0b1b2d_100%)]" />
      <div className="absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-[-100px] bottom-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 rounded-[32px] border border-white/10 bg-white/8 p-5 shadow-[0_30px_120px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr] md:p-7">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,26,43,0.96)_0%,rgba(9,18,31,0.98)_100%)] p-7 sm:p-10">
            <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/20">
              <CircleCheckBig className="h-6 w-6" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Subscription activated
            </div>

            <h1 className="mt-6 max-w-md text-4xl font-black tracking-tight text-white sm:text-5xl">
              Payment successful.
              <span className="mt-2 block text-cyan-200">Your plan is now live.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              The checkout completed successfully. Your subscription is active and the workspace can continue without interruption.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-1 text-sm font-semibold text-white">Active now</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <CreditCard className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Billing</p>
                <p className="mt-1 text-sm font-semibold text-white">Stripe checkout</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <WandSparkles className="h-5 w-5 text-amber-300" />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Next step</p>
                <p className="mt-1 text-sm font-semibold text-white">Start using features</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm text-emerald-50">
              Your subscription is confirmed. You can return to the plans page anytime to manage billing or upgrade later.
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 flex-1 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                onClick={() => startTransition(() => navigate('/plans'))}
              >
                Go to plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-1 border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => startTransition(() => navigate('/'))}
              >
                Back to dashboard
              </Button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_18px_60px_-24px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Checkout reference</p>
                <h2 className="mt-2 text-xl font-black text-slate-900">Payment details</h2>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Success
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {sessionId ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Session ID</p>
                  <p className="mt-2 break-all font-mono text-sm text-slate-800">{sessionId}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  No session id found in the URL.
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">What happened</p>
                <ul className="mt-3 space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Payment verified successfully
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                    Subscription status updated to active
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-400" />
                    You can continue using the app right away
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
