import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, LockKeyhole, Mail } from 'lucide-react';
import { useLoginMutation } from '@/store/authApi';
import { ROUTES } from '@/config/routes';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';

export function LoginPage() {
    const navigate = useNavigate();
    const [login, { isLoading, error }] = useLoginMutation();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { accessToken, user } = await login({ identifier, password, rememberMe }).unwrap();
        navigate(ROUTES.DASHBOARD, { replace: true });
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4f8_100%)] flex items-center justify-center p-4">
            <Card className="w-full max-w-md overflow-hidden rounded-[1.75rem] border-gray-100 shadow-[0_25px_70px_-30px_rgba(15,31,43,0.25)]">
                <CardContent className="p-8 sm:p-10">
                    <div className="mb-8 text-center">
                        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D4F6D]/10 text-[#1D4F6D]">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <h1 className="mt-5 text-2xl font-black text-gray-900">Sign in</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Use your account details to continue.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit} autoComplete="new-password">
                        <input
                            aria-hidden="true"
                            className="hidden"
                            type="text"
                            name="fake-username"
                            autoComplete="username"
                            tabIndex={-1}
                            readOnly
                            value=""
                        />
                        <input
                            aria-hidden="true"
                            className="hidden"
                            type="password"
                            name="fake-password"
                            autoComplete="current-password"
                            tabIndex={-1}
                            readOnly
                            value=""
                        />
                        <div className="space-y-2">
                            <Label htmlFor="identifier" className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                                Email
                            </Label>
                            <Input
                                id="identifier"
                                type="text"
                                placeholder="admin@example.com"
                                name="login-identifier-field"
                                autoComplete="new-password"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                startIcon={<Mail className="h-4 w-4" />}
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••••"
                                name="login-password-field"
                                autoComplete="new-password"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                startIcon={<LockKeyhole className="h-4 w-4" />}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-[#1D4F6D] focus:ring-[#1D4F6D]"
                                checked={rememberMe}
                                onChange={(event) => setRememberMe(event.target.checked)}
                            />
                            Remember me
                        </label>

                        {error && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                Login failed. Check your credentials.
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="h-12 w-full rounded-2xl bg-[#1D4F6D] text-white shadow-lg shadow-[#1D4F6D]/15 hover:bg-[#15384d]"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : (
                                <span className="inline-flex items-center gap-2">
                                    Sign in
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
