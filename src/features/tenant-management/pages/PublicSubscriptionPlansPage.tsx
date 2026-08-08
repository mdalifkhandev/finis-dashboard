import { useEffect, useState } from 'react';
import { Check, ShieldCheck, Rocket, Building2, Lock, Mail, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { selectAuthToken, selectAuthUser } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { getPublicPlans, type SubscriptionPlanApi } from '../services/subscriptionApi';
import { config } from '@/config/env';

function featureText(plan: SubscriptionPlanApi) {
  return [
    plan.maxCompanies === null || plan.maxCompanies === undefined ? 'Unlimited companies' : `Up to ${plan.maxCompanies} companies`,
    plan.maxProjects === null || plan.maxProjects === undefined ? 'Unlimited projects' : `Up to ${plan.maxProjects} projects`,
    plan.maxUsers === null || plan.maxUsers === undefined ? 'Unlimited users' : `Up to ${plan.maxUsers} users`,
    plan.hasGeofencing ? 'Geofencing access' : 'No geofencing',
    plan.hasAdvancedReporting ? 'Advanced reporting' : 'Standard reporting',
    plan.hasWhiteLabel ? 'White-label branding' : 'Default branding',
  ];
}

export function PublicSubscriptionPlansPage() {
  const navigate = useNavigate();
  const authToken = useAppSelector(selectAuthToken);
  const authUser = useAppSelector(selectAuthUser);
  const isSuperAdmin = authUser?.role === 'super_admin';
  const [plans, setPlans] = useState<SubscriptionPlanApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ subscriptionStatus: string | null; isExpired: boolean } | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanApi | null>(null);
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getPublicPlans();
        setPlans(response.data.plans.filter((plan) => plan.isActive !== false));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const loadStatus = async () => {
      if (!authToken || isSuperAdmin) return;
      try {
        const response = await fetch(`${config.apiBaseUrl}/admin/subscription/status`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await response.json();
        if (response.ok && data?.success !== false) {
          setSubscriptionStatus({
            subscriptionStatus: data?.data?.subscriptionStatus ?? null,
            isExpired: Boolean(data?.data?.isExpired),
          });
        }
      } catch {
        // ignore status fetch failure
      }
    };
    void loadStatus();
  }, [authToken, isSuperAdmin]);

  const openBuyModal = (plan: SubscriptionPlanApi, nextInterval: 'monthly' | 'yearly') => {
    if (!isSuperAdmin && subscriptionStatus?.subscriptionStatus === 'active' && !subscriptionStatus.isExpired) {
      return;
    }
    setSelectedPlan(plan);
    setInterval(nextInterval);
    setEmail('');
    setPassword('');
    setFormError('');
    setBuyOpen(true);
  };

  const submitCheckout = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    setFormError('');
    try {
      const response = await fetch(`${config.apiBaseUrl}/subscription/verify-and-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          planId: selectedPlan.id,
          interval,
        }),
      });
      const data = await response.json();
      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || 'Checkout failed');
      }
      window.location.href = data.data.checkoutUrl;
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Invalid credentials or account not active',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(29,79,109,0.14),_transparent_28%),linear-gradient(180deg,_#f8fbfe_0%,_#eef4f8_100%)] text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[24px] border border-white/60 bg-white/80 px-5 py-4 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.22)] backdrop-blur">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">Subscription Plans</h1>
        </header>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading plans...</div>
        ) : (
          <>
            {!isSuperAdmin && subscriptionStatus?.subscriptionStatus === 'active' && !subscriptionStatus.isExpired && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Your subscription is already active. Payment is disabled until it expires.
              </div>
            )}
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={plan.id}
                className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_-18px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_-20px_rgba(15,23,42,0.26)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1D4F6D]/10 text-[#1D4F6D]">
                        {index === 0 ? <ShieldCheck className="h-5 w-5" /> : index === 1 ? <Rocket className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Monthly billing</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tight">${plan.priceMonthly}</span>
                    <span className="pb-2 text-sm font-semibold text-gray-500">/ month</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Yearly: <span className="font-bold text-gray-900">${plan.priceYearly ?? 0}</span>
                  </p>
                </div>

                <div className="mt-6 space-y-3 rounded-2xl bg-gray-50/70 p-4">
                  {featureText(plan).map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-gray-500">
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Companies</div>
                    <div className="mt-1 text-base font-black text-gray-900">
                      {plan.maxCompanies === null || plan.maxCompanies === undefined ? '∞' : plan.maxCompanies}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Projects</div>
                    <div className="mt-1 text-base font-black text-gray-900">
                      {plan.maxProjects === null || plan.maxProjects === undefined ? '∞' : plan.maxProjects}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Users</div>
                    <div className="mt-1 text-base font-black text-gray-900">
                      {plan.maxUsers === null || plan.maxUsers === undefined ? '∞' : plan.maxUsers}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    className="h-12 bg-[#1D4F6D] text-white hover:bg-[#173f58]"
                    disabled={!isSuperAdmin && subscriptionStatus?.subscriptionStatus === 'active' && !subscriptionStatus.isExpired}
                    onClick={() => openBuyModal(plan, 'monthly')}
                  >
                    Buy Monthly
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 border-gray-200 text-gray-700 hover:bg-gray-50"
                    disabled={!isSuperAdmin && subscriptionStatus?.subscriptionStatus === 'active' && !subscriptionStatus.isExpired}
                    onClick={() => openBuyModal(plan, 'yearly')}
                  >
                    Buy Yearly
                  </Button>
                </div>
                {!isSuperAdmin && subscriptionStatus?.subscriptionStatus === 'active' && !subscriptionStatus.isExpired && (
                  <div className="mt-3">
                    <Badge className="bg-emerald-100 text-emerald-700">Already Active</Badge>
                  </div>
                )}
              </Card>
            ))}
          </div>
          </>
        )}
      </div>

      <Modal
        isOpen={buyOpen}
        onClose={() => setBuyOpen(false)}
        title="Start Subscription"
        maxWidth="2xl"
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Selected Plan</div>
            <div className="mt-2 text-2xl font-black text-gray-900">{selectedPlan?.name ?? 'Plan'}</div>
            <div className="mt-1 text-sm text-gray-500">
              {interval === 'monthly' ? `Monthly ${selectedPlan?.priceMonthly ?? 0}` : `Yearly ${selectedPlan?.priceYearly ?? 0}`}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {formError && (
              <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                startIcon={<Mail className="h-4 w-4" />}
                placeholder="admin@company.com"
                className={formError ? 'border-red-300 bg-red-50 focus-visible:ring-red-300' : ''}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                startIcon={<Lock className="h-4 w-4" />}
                placeholder="Your password"
                className={formError ? 'border-red-300 bg-red-50 focus-visible:ring-red-300' : ''}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Billing Interval</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInterval('monthly')}
                  className={`rounded-2xl border p-4 text-left transition-all ${interval === 'monthly' ? 'border-[#1D4F6D] bg-[#1D4F6D]/5' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#1D4F6D]" />
                    <span className="font-bold">Monthly</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setInterval('yearly')}
                  className={`rounded-2xl border p-4 text-left transition-all ${interval === 'yearly' ? 'border-[#1D4F6D] bg-[#1D4F6D]/5' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#1D4F6D]" />
                    <span className="font-bold">Yearly</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <span>After payment success you will be redirected automatically.</span>
            <span className="font-semibold text-[#1D4F6D]">Stripe Checkout</span>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBuyOpen(false)}>Cancel</Button>
            <Button onClick={submitCheckout} disabled={submitting || !selectedPlan}>
              {submitting ? 'Redirecting...' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
