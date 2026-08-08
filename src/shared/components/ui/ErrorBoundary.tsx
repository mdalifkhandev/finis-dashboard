import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <Card className="max-w-md w-full border-red-100 shadow-lg shadow-red-50">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-red-50 bg-red-50/30 rounded-t-xl">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-red-700">Something went wrong</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                An error occurred while rendering this component.
                            </p>

                            {this.state.error && (
                                <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-700 border border-gray-100 overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                </div>
                            )}

                            <Button
                                onClick={this.handleReload}
                                className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white shadow-red-100"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reload Page
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
