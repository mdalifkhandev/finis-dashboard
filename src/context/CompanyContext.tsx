import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Company } from '../lib/types';
import { mockCompanies } from '../lib/mockData';

interface CompanyContextType {
    companies: Company[];
    addCompany: (company: Company) => void;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    getCompany: (id: string) => Company | undefined;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
    const [companies, setCompanies] = useState<Company[]>(mockCompanies);

    const addCompany = (company: Company) => {
        setCompanies(prev => [company, ...prev]);
    };

    const updateCompany = (id: string, updates: Partial<Company>) => {
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const getCompany = (id: string) => {
        return companies.find(c => c.id === id);
    };

    return (
        <CompanyContext.Provider value={{ companies, addCompany, updateCompany, getCompany }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompanies() {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompanies must be used within a CompanyProvider');
    }
    return context;
}
