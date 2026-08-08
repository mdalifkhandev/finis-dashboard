import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Globe, Copy, RefreshCw, Shield, ExternalLink, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';

interface PublicLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetName: string;
    existingLink?: {
        url: string;
        enabled: boolean;
    };
}

export function PublicLinkModal({ isOpen, onClose, targetName, existingLink }: PublicLinkModalProps) {
    const [isEnabled, setIsEnabled] = useState(existingLink?.enabled || false);
    const [url, setUrl] = useState(existingLink?.url || `https://finispro.app/public/${targetName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(7)}`);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleRegenerate = () => {
        const newUrl = `https://finispro.app/public/${targetName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(7)}`;
        setUrl(newUrl);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Public Link Control" maxWidth="md">
            <div className="space-y-6">
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
                        <Globe className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Visibility Status</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            {isEnabled
                                ? "Anyone with this link can view the public company profile and active projects."
                                : "Public access is currently disabled. External clients cannot view this profile."
                            }
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">Public Access</label>
                        <button
                            onClick={() => setIsEnabled(!isEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ${isEnabled ? 'bg-green-500 ring-green-500' : 'bg-gray-200 ring-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {isEnabled && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Shareable Link</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        value={url}
                                        readOnly
                                        className="pr-10 bg-gray-50 cursor-default font-mono text-xs"
                                    />
                                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                <Button variant="outline" onClick={handleCopy} className="gap-2 shrink-0">
                                    <Copy className="h-4 w-4" />
                                    {isCopied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50 text-xs py-1 h-auto" onClick={handleRegenerate}>
                                    <RefreshCw className="h-3 w-3 mr-1.5" />
                                    Regenerate Link
                                </Button>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 ml-auto font-medium">
                                    <ExternalLink className="h-3 w-3 mr-1.5" />
                                    Preview Public Page
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 flex items-center gap-1.5">
                        <Shield className="h-3 w-3" />
                        Security Settings
                    </h4>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Password Protection</span>
                        <Badge variant="outline">Enterprise Only</Badge>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={() => {
                        console.log('Saved settings for', targetName, { url, isEnabled });
                        onClose();
                    }}>Save Changes</Button>
                </div>
            </div>
        </Modal>
    );
}
