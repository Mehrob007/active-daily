import { fetchTransactionsSearch } from '@/features/processing-search/services/transactions-search-service';

export const fetchATM = async () => {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ATM_URL || 'http://10.64.20.84/atm-api';
        const url = `${backendUrl}/services/mtm_atm.php`;
        
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data?.items ?? [];
    } catch (error) {
        console.error("Error fetching ATM data:", error);
        throw error;
    }
};

export const fetchATMReport = async (atmId: string, fromDate: string, toDate: string) => {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ATM_URL || 'http://10.64.20.84/atm-api';
        const url = `${backendUrl}/services/mtm_atm_report.php?atmId=${atmId}&fromDate=${fromDate}&toDate=${toDate}`;

        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching ATM report:", error);
        throw error;
    }
};

export const fetchHistory = async (fromDate: string, toDate: string) => {
    try {
        return await fetchTransactionsSearch({
            transactionTypes: ['700'],
            fromDate,
            toDate,
        });
    } catch (error) {
        console.error("Error fetching ATM history:", error);
        throw error;
    }
};
