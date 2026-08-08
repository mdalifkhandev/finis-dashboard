import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Tenant } from '@/shared/types';
import { Upload, Palette } from 'lucide-react';

interface TenantBrandingModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant | null;
}

export function TenantBrandingModal({ isOpen, onClose, tenant }: TenantBrandingModalProps) {
    const [branding, setBranding] = useState(tenant?.whiteLabel || {
        primaryColor: '#1D4F6D',
        secondaryColor: '#FF6B35',
        logo: ''
    });

    if (!tenant) return null;

    const handleSave = () => {
        console.log('Saving branding for', tenant.name, branding);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Branding: ${tenant.name}`} maxWidth="md">
            <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Logo & Identity</h3>
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-2xl bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden">
                            {branding.logo ? (
                                <img src={branding.logo.startsWith('http') ? branding.logo : `${(import.meta.env.VITE_API_BASE_URL as string) || ''}${branding.logo.startsWith('/') ? '' : '/'}${branding.logo}`} alt="Logo Preview" className="h-full w-full object-contain" />
                            ) : (
                                <>
                                    <Upload className="h-6 w-6 text-gray-400 mb-1" />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Upload</span>
                                </>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Logo URL</label>
                            <Input
                                value={branding.logo}
                                onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                                placeholder="https://example.com/logo.png"
                            />
                            <p className="text-[10px] text-gray-400">Recommended size: 512x512px (PNG/SVG)</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Primary Color
                        </h3>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={branding.primaryColor}
                                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                className="h-12 w-12 rounded-lg cursor-pointer bg-white p-1 border border-gray-200"
                            />
                            <div className="flex-1">
                                <Input
                                    value={branding.primaryColor}
                                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Secondary Color
                        </h3>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={branding.secondaryColor}
                                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                className="h-12 w-12 rounded-lg cursor-pointer bg-white p-1 border border-gray-200"
                            />
                            <div className="flex-1">
                                <Input
                                    value={branding.secondaryColor}
                                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-900 rounded-2xl text-white">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-50">Live Preview</h3>
                    <div className="flex gap-4">
                        <div
                            className="px-6 py-2 rounded-xl font-bold text-sm shadow-lg"
                            style={{ backgroundColor: branding.primaryColor }}
                        >
                            Primary Button
                        </div>
                        <div
                            className="px-6 py-2 rounded-xl font-bold text-sm border-2"
                            style={{ borderColor: branding.secondaryColor, color: branding.secondaryColor }}
                        >
                            Secondary Action
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Branding</Button>
                </div>
            </div>
        </Modal>
    );
}
