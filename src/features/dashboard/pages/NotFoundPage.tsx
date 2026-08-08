
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-extrabold text-[#1D4F6D] md:text-6xl">404</h1>
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Page Not Found</h2>
            <p className="max-w-md text-center text-sm text-gray-600 md:text-base">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <div className="mt-4 flex gap-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
                <Button onClick={() => navigate('/')}>
                    Back to Dashboard
                </Button>
            </div>
        </div>
    );
}
