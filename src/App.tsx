/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Home,
  GraduationCap,
  ShoppingBag,
  Car,
  Utensils,
  Heart,
  Zap,
  Edit2,
  Trash2,
  X,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from './lib/utils';
import { Transaction, SavingsItem, MonthData } from './types';
import { storageService } from './services/storageService';
import { Loader2 } from 'lucide-react';

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

// Mock Data for Initial State
const INITIAL_DATA: MonthData[] = [
  {
    id: '1',
    name: 'JANEIRO - 2026',
    income: [
      {
        id: 'i1',
        date: '2026-01-05',
        amount: 2500,
        description: 'Salário - Empresa X',
        category: 'Salário',
        paymentMethod: 'Pix',
        bank: 'Itaú',
        isInstallment: false,
        installmentInfo: '1x',
        importance: 'Essencial'
      }
    ],
    expenses: [
      {
        id: 'e1',
        date: '2026-01-10',
        amount: 800,
        description: 'Aluguel',
        category: 'Moradia',
        paymentMethod: 'Boleto',
        bank: 'Itaú',
        isInstallment: false,
        installmentInfo: '01/01',
        importance: 'Essencial'
      }
    ],
    savings: [
      { id: 's1', amount: 200, description: 'Reserva de Emergência' }
    ]
  },
  {
    id: '2',
    name: 'FEVEREIRO - 2026',
    income: [
      {
        id: 'i2',
        date: '2026-02-26',
        amount: 2750,
        description: 'Salário - Secult',
        category: 'Salário',
        paymentMethod: 'Pix',
        bank: 'Banco do Brasil',
        isInstallment: false,
        installmentInfo: '1x',
        importance: 'Essencial'
      }
    ],
    expenses: [
      {
        id: 'e2',
        date: '2026-02-02',
        amount: 80,
        description: 'Seguro da moto',
        category: 'Desp. Fixas',
        paymentMethod: 'Pix',
        bank: 'Mercado Pago',
        isInstallment: true,
        installmentInfo: '07/11',
        importance: 'Essencial'
      },
      {
        id: 'e3',
        date: '2026-02-02',
        amount: 670,
        description: 'Parcela da moto',
        category: 'Desp. Fixas',
        paymentMethod: 'Pix',
        bank: 'NuBank',
        isInstallment: true,
        installmentInfo: '07/12',
        importance: 'Essencial'
      },
      {
        id: 'e4',
        date: '2026-02-05',
        amount: 13.90,
        description: 'Assinatura Amazon Prime',
        category: 'Moradia',
        paymentMethod: 'Cartão de Crédito',
        bank: 'NuBank',
        isInstallment: true,
        installmentInfo: '08/12',
        importance: 'Essencial'
      },
      {
        id: 'e5',
        date: '2026-02-10',
        amount: 89.70,
        description: 'Curso DDA3.0',
        category: 'Educação',
        paymentMethod: 'Cartão de Crédito',
        bank: 'Mercado Pago',
        isInstallment: true,
        installmentInfo: '12/12',
        importance: 'Essencial'
      },
      {
        id: 'e6',
        date: '2026-02-12',
        amount: 14.40,
        description: 'Perfume Natura Homem',
        category: 'Estética',
        paymentMethod: 'Cartão de Crédito',
        bank: 'Mercado Pago',
        isInstallment: true,
        installmentInfo: '02/06',
        importance: 'Não Essencial'
      },
      {
        id: 'e7',
        date: '2026-02-15',
        amount: 105,
        description: 'Plano de internet',
        category: 'Desp. Fixas',
        paymentMethod: 'Pix',
        bank: 'Mercado Pago',
        isInstallment: false,
        installmentInfo: '01/01',
        importance: 'Essencial'
      },
      {
        id: 'e8',
        date: '2026-02-20',
        amount: 350,
        description: 'Parte do supermercado',
        category: 'Desp. Fixas',
        paymentMethod: 'Pix',
        bank: 'Mercado Pago',
        isInstallment: false,
        installmentInfo: '01/01',
        importance: 'Essencial'
      }
    ],
    savings: [
      { id: 's2', amount: 170, description: 'Gasolina' },
      { id: 's3', amount: 35, description: 'Óleo' },
      { id: 's4', amount: 50, description: 'Cabelo' },
      { id: 's5', amount: 150, description: 'Sobras do Joaquim' },
      { id: 's6', amount: 50, description: 'Crea/Mútua' },
      { id: 's7', amount: 110, description: 'Seguro Desp.' },
      { id: 's8', amount: 50, description: 'Casamento' },
      { id: 's9', amount: 120, description: 'Academia' },
    ]
  }
];

const SummaryCard = ({ title, value, color, icon: Icon }: { title: string, value: number, color: string, icon: any }) => (
  <div className={cn("p-4 md:p-6 rounded-2xl shadow-sm border border-black/5 flex flex-col gap-1 md:gap-2 min-w-[140px] flex-1", color)}>
    <div className="flex justify-between items-start">
      <span className="text-[10px] md:text-sm font-medium opacity-80 uppercase tracking-wider">{title}</span>
      <Icon size={16} className="opacity-60" />
    </div>
    <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-600">
      {formatCurrency(value)}
    </span>
  </div>
);

const SortButton = ({ label, sortKey, currentConfig, onSort }: { 
  label: string, 
  sortKey: keyof Transaction, 
  currentConfig: { key: keyof Transaction, direction: 'asc' | 'desc' } | null,
  onSort: (key: keyof Transaction) => void 
}) => {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onSort(sortKey); }}
      className="flex items-center justify-center gap-1 w-full h-full hover:bg-black/5 transition-colors py-3"
    >
      {label}
    </button>
  );
};

const CategoryIcon = ({ category }: { category: string }) => {
  const iconMap: Record<string, { icon: any, color: string }> = {
    'Moradia': { icon: Home, color: 'text-blue-500' },
    'Educação': { icon: GraduationCap, color: 'text-purple-500' },
    'Estética': { icon: Heart, color: 'text-rose-500' },
    'Desp. Fixas': { icon: Zap, color: 'text-amber-500' },
    'Salário': { icon: Wallet, color: 'text-emerald-500' },
    'Alimentação': { icon: Utensils, color: 'text-orange-500' },
    'Transporte': { icon: Car, color: 'text-cyan-500' },
    'Lazer': { icon: ShoppingBag, color: 'text-pink-500' },
  };
  const config = iconMap[category] || { icon: Wallet, color: 'text-gray-400' };
  const Icon = config.icon;
  return <Icon size={14} className={cn("inline mr-2", config.color)} />;
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-black/5 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-lg">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function App() {
  const [months, setMonths] = useState<MonthData[]>(INITIAL_DATA);
  const [activeMonthId, setActiveMonthId] = useState(INITIAL_DATA[1].id);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Load data on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await storageService.getMonths();
        if (data && data.length > 0) {
          setMonths(data);
          // Try to find a month close to current date or just use the first one
          setActiveMonthId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
        setIsFirstLoad(false);
      }
    };
    loadData();
  }, []);

  // Save data when months change
  React.useEffect(() => {
    if (isFirstLoad || isLoading) return;

    const saveData = async () => {
      setIsSaving(true);
      try {
        await storageService.saveMonths(months);
      } catch (error) {
        console.error('Failed to save data:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const timeoutId = setTimeout(saveData, 1000); // Debounce save
    return () => clearTimeout(timeoutId);
  }, [months, isFirstLoad, isLoading]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense' | 'savings'>('income');
  const [detailItem, setDetailItem] = useState<{ item: Transaction | SavingsItem, type: 'income' | 'expense' | 'savings' } | null>(null);
  const [editingItem, setEditingItem] = useState<Transaction | SavingsItem | null>(null);
  const [isYearlyCalendarOpen, setIsYearlyCalendarOpen] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const createNextMonthData = (lastMonth: MonthData): MonthData => {
    const parts = lastMonth.name.split(' - ');
    const lastMonthName = parts[0].toLowerCase();
    const lastYear = parseInt(parts[1]);
    const lastMonthIndexInArray = MONTH_NAMES.indexOf(lastMonthName);
    
    const nextMonthIndex = (lastMonthIndexInArray + 1) % 12;
    const nextYear = nextMonthIndex === 0 ? lastYear + 1 : lastYear;
    const nextMonthName = MONTH_NAMES[nextMonthIndex].toUpperCase();
    
    // Copy Fixed Expenses (non-installments)
    const fixedExpenses = lastMonth.expenses
      .filter(ex => ex.category === 'Desp. Fixas' && !ex.isInstallment)
      .map(ex => {
        const oldDate = new Date(ex.date + 'T00:00:00');
        const newDate = new Date(oldDate);
        newDate.setMonth(oldDate.getMonth() + 1);
        
        return {
          ...ex,
          id: Math.random().toString(36).substr(2, 9),
          date: newDate.toISOString().split('T')[0],
          groupId: ex.groupId || ex.id
        } as Transaction;
      });

    // Copy ongoing installments
    const ongoingInstallments = lastMonth.expenses
      .filter(ex => ex.isInstallment && ex.installmentInfo.includes('/'))
      .map(ex => {
        const [current, total] = ex.installmentInfo.split('/').map(Number);
        if (current < total) {
          const oldDate = new Date(ex.date + 'T00:00:00');
          const newDate = new Date(oldDate);
          newDate.setMonth(oldDate.getMonth() + 1);

          return {
            ...ex,
            id: Math.random().toString(36).substr(2, 9),
            date: newDate.toISOString().split('T')[0],
            installmentInfo: `${String(current + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`,
            groupId: ex.groupId || ex.id
          } as Transaction;
        }
        return null;
      })
      .filter((ex): ex is Transaction => ex !== null);

    return {
      id: Math.random().toString(36).substr(2, 9),
      name: `${nextMonthName} - ${nextYear}`,
      income: [],
      expenses: [...fixedExpenses, ...ongoingInstallments],
      savings: []
    };
  };

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Salário',
    bank: 'Itaú',
    paymentMethod: 'Pix',
    importance: 'Essencial' as 'Essencial' | 'Não Essencial',
    isInstallment: false,
    installmentInfo: '1x'
  });

  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data: Transaction[]) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const activeMonth = useMemo(() => 
    months.find(m => m.id === activeMonthId) || months[0], 
    [months, activeMonthId]
  );

  const stats = useMemo(() => {
    const income = activeMonth.income.reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = activeMonth.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const savings = activeMonth.savings.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = income - expenses - savings;

    // Calculate Next Month's Expenses
    let nextMonthExpenses = 0;
    
    // 1. Try to find the next month in the existing list
    const currentIndex = months.findIndex(m => m.id === activeMonthId);
    if (currentIndex !== -1 && currentIndex < months.length - 1) {
      nextMonthExpenses = months[currentIndex + 1].expenses.reduce((acc, curr) => acc + curr.amount, 0);
    } else {
      // 2. Estimate based on current month's recurring items
      // Fixed expenses (non-installments)
      const fixed = activeMonth.expenses
        .filter(ex => ex.category === 'Desp. Fixas' && !ex.isInstallment)
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      // Ongoing installments
      const ongoingInstallments = activeMonth.expenses
        .filter(ex => ex.isInstallment && ex.installmentInfo.includes('/'))
        .reduce((acc, curr) => {
          const [current, total] = curr.installmentInfo.split('/').map(Number);
          if (current < total) {
            return acc + curr.amount;
          }
          return acc;
        }, 0);
      
      nextMonthExpenses = fixed + ongoingInstallments;
    }
    
    return { income, expenses, savings, balance, nextMonthExpenses };
  }, [activeMonth, months, activeMonthId]);

  const openAddModal = (type: 'income' | 'expense' | 'savings') => {
    setModalType(type);
    setEditingItem(null);
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: type === 'income' ? 'Salário' : 'Desp. Fixas',
      bank: 'Itaú',
      paymentMethod: 'Pix',
      importance: 'Essencial',
      isInstallment: false,
      installmentInfo: '1x'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Transaction | SavingsItem, type: 'income' | 'expense' | 'savings') => {
    setModalType(type);
    setEditingItem(item);
    if ('date' in item) {
      const t = item as Transaction;
      setFormData({
        description: t.description,
        amount: t.amount.toString(),
        date: t.date,
        category: t.category,
        bank: t.bank,
        paymentMethod: t.paymentMethod,
        importance: t.importance,
        isInstallment: t.isInstallment,
        installmentInfo: t.installmentInfo
      });
    } else {
      const s = item as SavingsItem;
      setFormData({
        ...formData,
        description: s.description,
        amount: s.amount.toString(),
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, type: 'income' | 'expense' | 'savings') => {
    setMonths(prev => {
      const activeMonthIndex = prev.findIndex(m => m.id === activeMonthId);
      if (activeMonthIndex === -1) return prev;

      // Find the item to check if it's a fixed expense
      const itemToDelete = prev[activeMonthIndex].expenses.find(ex => ex.id === id);
      const isFixedExpense = type === 'expense' && itemToDelete?.category === 'Desp. Fixas';
      const groupId = itemToDelete?.groupId;

      return prev.map((m, idx) => {
        // If it's a fixed expense, delete from current and FUTURE months
        if (isFixedExpense && groupId && idx >= activeMonthIndex) {
          return {
            ...m,
            expenses: m.expenses.filter(ex => ex.groupId !== groupId && ex.id !== id)
          };
        }

        // Standard delete logic for other items (only current month)
        if (m.id !== activeMonthId) return m;
        
        const updatedMonth = { ...m };
        if (type === 'income') {
          updatedMonth.income = m.income.filter(item => item.id !== id);
        } else if (type === 'expense') {
          updatedMonth.expenses = m.expenses.filter(item => item.id !== id);
        } else if (type === 'savings') {
          updatedMonth.savings = m.savings.filter(item => item.id !== id);
        }
        
        return updatedMonth;
      });
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount) || 0;
    
    setMonths(prev => {
      const activeMonthIndex = prev.findIndex(m => m.id === activeMonthId);
      if (activeMonthIndex === -1) return prev;

      let newMonths = [...prev];

      // Special logic for NEW installment expenses
      if (modalType === 'expense' && formData.isInstallment && !editingItem) {
        // ... (existing installment logic)
        const match = formData.installmentInfo.match(/(\d+)/g);
        const totalInstallments = match ? parseInt(match[match.length - 1]) : 1;
        const installmentAmount = amount / totalInstallments;
        const baseId = Math.random().toString(36).substr(2, 9);
        const baseDate = new Date(formData.date + 'T00:00:00');

        for (let i = 0; i < totalInstallments; i++) {
          const targetMonthIndex = activeMonthIndex + i;
          const currentDate = new Date(baseDate);
          currentDate.setMonth(baseDate.getMonth() + i);
          const dateString = currentDate.toISOString().split('T')[0];
          const installmentText = `${String(i + 1).padStart(2, '0')}/${String(totalInstallments).padStart(2, '0')}`;
          
          const newItem: Transaction = {
            id: `${baseId}-${i}`,
            date: dateString,
            amount: installmentAmount,
            description: formData.description,
            category: formData.category,
            paymentMethod: formData.paymentMethod,
            bank: formData.bank,
            isInstallment: true,
            installmentInfo: installmentText,
            importance: formData.importance
          };

          if (targetMonthIndex >= newMonths.length) {
            const lastMonth = newMonths[newMonths.length - 1];
            const newMonth = createNextMonthData(lastMonth);
            newMonths.push(newMonth);
          }

          newMonths[targetMonthIndex] = {
            ...newMonths[targetMonthIndex],
            expenses: [...newMonths[targetMonthIndex].expenses, newItem]
          };
        }
      } 
      // Special logic for "Desp. Fixas" (non-installment)
      else if (modalType === 'expense' && formData.category === 'Desp. Fixas' && !formData.isInstallment) {
        const baseId = editingItem?.id || Math.random().toString(36).substr(2, 9);
        const groupId = (editingItem as Transaction)?.groupId || baseId;

        // Update current and all FUTURE months
        newMonths = newMonths.map((m, idx) => {
          if (idx < activeMonthIndex) return m; // Don't change previous months

          const updatedMonth = { ...m };
          const newItem: Transaction = {
            id: idx === activeMonthIndex ? baseId : Math.random().toString(36).substr(2, 9),
            date: formData.date, // Note: In future months we might want to adjust the date, but keeping it simple for now
            amount,
            description: formData.description,
            category: formData.category,
            paymentMethod: formData.paymentMethod,
            bank: formData.bank,
            isInstallment: false,
            installmentInfo: formData.installmentInfo,
            importance: formData.importance,
            groupId: groupId
          };

          // Adjust date for future months to keep the same day
          if (idx > activeMonthIndex) {
            const baseDate = new Date(formData.date + 'T00:00:00');
            const newDate = new Date(baseDate);
            newDate.setMonth(baseDate.getMonth() + (idx - activeMonthIndex));
            newItem.date = newDate.toISOString().split('T')[0];
          }

          if (editingItem) {
            // Update existing item in this month (match by groupId or original id)
            const exists = m.expenses.some(ex => ex.groupId === groupId || ex.id === baseId);
            if (exists) {
              updatedMonth.expenses = m.expenses.map(ex => 
                (ex.groupId === groupId || ex.id === baseId) ? newItem : ex
              );
            } else if (idx > activeMonthIndex) {
              // If it didn't exist in a future month but should be there (repeated in all months)
              updatedMonth.expenses = [...m.expenses, newItem];
            }
          } else {
            // New item: add to current and all future months
            updatedMonth.expenses = [...m.expenses, newItem];
          }

          return updatedMonth;
        });
      }
      else {
        // Standard save logic for income, savings, or other expenses
        newMonths = newMonths.map(m => {
          if (m.id !== activeMonthId) return m;
          const updatedMonth = { ...m };

          if (modalType === 'savings') {
            const newItem: SavingsItem = {
              id: editingItem?.id || Math.random().toString(36).substr(2, 9),
              amount,
              description: formData.description
            };
            if (editingItem) {
              updatedMonth.savings = m.savings.map(s => s.id === editingItem.id ? newItem : s);
            } else {
              updatedMonth.savings = [...m.savings, newItem];
            }
          } else {
            const newItem: Transaction = {
              id: editingItem?.id || Math.random().toString(36).substr(2, 9),
              date: formData.date,
              amount,
              description: formData.description,
              category: formData.category,
              paymentMethod: formData.paymentMethod,
              bank: formData.bank,
              isInstallment: formData.isInstallment,
              installmentInfo: formData.installmentInfo,
              importance: formData.importance,
              groupId: (editingItem as Transaction)?.groupId
            };

            if (modalType === 'income') {
              if (editingItem) {
                updatedMonth.income = m.income.map(i => i.id === editingItem.id ? newItem : i);
              } else {
                updatedMonth.income = [...m.income, newItem];
              }
            } else {
              if (editingItem) {
                updatedMonth.expenses = m.expenses.map(ex => ex.id === editingItem.id ? newItem : ex);
              } else {
                updatedMonth.expenses = [...m.expenses, newItem];
              }
            }
          }
          return updatedMonth;
        });
      }

      return newMonths;
    });

    setIsModalOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentIndex = months.findIndex(m => m.id === activeMonthId);
    if (direction === 'prev' && currentIndex > 0) {
      setActiveMonthId(months[currentIndex - 1].id);
    } else if (direction === 'next') {
      if (currentIndex < months.length - 1) {
        setActiveMonthId(months[currentIndex + 1].id);
      } else {
        // Auto-create next month
        const lastMonth = months[months.length - 1];
        const newMonth = createNextMonthData(lastMonth);
        
        setMonths(prev => [...prev, newMonth]);
        setActiveMonthId(newMonth.id);
      }
    }
  };

  const selectMonthFromCalendar = (monthName: string, year: number) => {
    const targetName = `${monthName.toUpperCase()} - ${year}`;
    const existingMonth = months.find(m => m.name === targetName);
    
    if (existingMonth) {
      setActiveMonthId(existingMonth.id);
      setIsYearlyCalendarOpen(false);
    } else {
      // If it doesn't exist, we need to create it and potentially intermediate months
      // to ensure "Desp. Fixas" carry over correctly.
      setMonths(prev => {
        let currentMonths = [...prev];
        
        // Helper to get the last month chronologically
        const getLastMonth = (list: MonthData[]) => {
          return [...list].sort((a, b) => {
            const [mA, yA] = a.name.split(' - ');
            const [mB, yB] = b.name.split(' - ');
            if (yA !== yB) return parseInt(yA) - parseInt(yB);
            return MONTH_NAMES.indexOf(mA.toLowerCase()) - MONTH_NAMES.indexOf(mB.toLowerCase());
          })[list.length - 1];
        };

        let lastMonth = getLastMonth(currentMonths);
        
        // Keep creating months until we reach or pass the target
        while (true) {
          const [lM, lY] = lastMonth.name.split(' - ');
          const lYear = parseInt(lY);
          const lMonthIdx = MONTH_NAMES.indexOf(lM.toLowerCase());
          
          // Check if lastMonth is the target or after
          if (lYear > year || (lYear === year && lMonthIdx >= MONTH_NAMES.indexOf(monthName.toLowerCase()))) {
            break;
          }

          const nextMonth = createNextMonthData(lastMonth);
          currentMonths.push(nextMonth);
          lastMonth = nextMonth;
        }

        // If target still doesn't exist (e.g. it was before the first month), just add it
        if (!currentMonths.some(m => m.name === targetName)) {
          currentMonths.push({
            id: Math.random().toString(36).substr(2, 9),
            name: targetName,
            income: [],
            expenses: [],
            savings: []
          });
        }

        // Sort and return
        const sorted = currentMonths.sort((a, b) => {
          const [monthA, yearA] = a.name.split(' - ');
          const [monthB, yearB] = b.name.split(' - ');
          if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
          return MONTH_NAMES.indexOf(monthA.toLowerCase()) - MONTH_NAMES.indexOf(monthB.toLowerCase());
        });

        // Find the ID of the target month in the newly updated list
        const targetMonth = sorted.find(m => m.name === targetName);
        if (targetMonth) {
          setActiveMonthId(targetMonth.id);
        }

        return sorted;
      });
      setIsYearlyCalendarOpen(false);
    }
  };

  const openYearlyCalendar = () => {
    const year = parseInt(activeMonth.name.split(' - ')[1]);
    setCalendarYear(year);
    setIsYearlyCalendarOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans pb-12">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">Carregando Finanças Pro...</p>
        </div>
      )}
      {/* Yearly Calendar Modal */}
      <Modal
        isOpen={isYearlyCalendarOpen}
        onClose={() => setIsYearlyCalendarOpen(false)}
        title={`Calendário - ${calendarYear}`}
      >
        <div className="grid grid-cols-3 gap-3">
          {MONTH_NAMES.map((name) => {
            const isSelected = activeMonth.name === `${name.toUpperCase()} - ${calendarYear}`;
            
            return (
              <button
                key={name}
                onClick={() => selectMonthFromCalendar(name, calendarYear)}
                className={cn(
                  "py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                  isSelected 
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-md scale-105 z-10" 
                    : "bg-white border-black/5 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/30"
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <button 
            onClick={() => setCalendarYear(prev => prev - 1)}
            className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <ChevronLeft size={12} />
            Ano Anterior
          </button>
          <button 
            onClick={() => setCalendarYear(prev => prev + 1)}
            className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            Próximo Ano
            <ChevronRight size={12} />
          </button>
        </div>
      </Modal>
      {/* Header / Dashboard */}
      <header className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-6">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Wallet className="text-emerald-600" />
              Finanças Pro
            </h1>
            {isSaving && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin" />
                Salvando...
              </div>
            )}
          </div>

          <div className="flex items-center bg-white border border-black/5 rounded-xl px-2 py-1 shadow-sm w-full md:w-auto justify-between md:justify-start">
            <button 
              onClick={() => navigateMonth('prev')}
              disabled={months.findIndex(m => m.id === activeMonthId) === 0}
              className="p-1.5 hover:bg-black/5 rounded-lg disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div 
              onClick={openYearlyCalendar}
              className="px-4 md:px-8 flex-1 md:flex-none text-center cursor-pointer hover:bg-black/5 rounded-lg py-1 transition-colors"
            >
              <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-emerald-600">
                {activeMonth.name}
              </span>
            </div>
            
            <button 
              onClick={() => navigateMonth('next')}
              className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <SummaryCard 
            title="Saldo atual" 
            value={stats.balance} 
            color="bg-[#D1E9F6]" 
            icon={Wallet}
          />
          <SummaryCard 
            title="Quanto ganhei" 
            value={stats.income} 
            color="bg-[#D1F6D1]" 
            icon={TrendingUp}
          />
          <SummaryCard 
            title="Quanto guardei" 
            value={stats.savings} 
            color="bg-[#F6E1D1]" 
            icon={PiggyBank}
          />
          <SummaryCard 
            title="Quanto gastei" 
            value={stats.expenses} 
            color="bg-[#F6D1D1]" 
            icon={TrendingDown}
          />
          <SummaryCard 
            title="Gasto do próximo mês" 
            value={stats.nextMonthExpenses} 
            color="bg-[#E5E5E5]" 
            icon={Calendar}
          />
        </div>

        <div className="space-y-12">
          {/* Entradas do Mês */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-bold flex items-center gap-2">
                Entradas do Mês
              </h2>
              <button 
                onClick={() => openAddModal('income')}
                className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={12} strokeWidth={3} />
                Nova Entrada
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden overflow-x-auto">
              <table className="min-w-[800px] w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-[#B6D7E8] text-[#1A1A1A]">
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Data" sortKey="date" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Valor de Entrada" sortKey="amount" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Descrição" sortKey="description" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Categoria" sortKey="category" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Forma de Pagamento" sortKey="paymentMethod" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Banco" sortKey="bank" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Parcela" sortKey="installmentInfo" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Importância" sortKey="importance" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData(activeMonth.income).map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => setDetailItem({ item, type: 'income' })}
                      className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="p-3 opacity-70 align-middle">{item.date.split('-').reverse().slice(0, 2).join('/')}</td>
                      <td className="p-3 font-medium text-emerald-600 align-middle">{formatCurrency(item.amount)}</td>
                      <td className="p-3 align-middle">{item.description}</td>
                      <td className="p-3 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <CategoryIcon category={item.category} />
                          {item.category}
                        </div>
                      </td>
                      <td className="p-3 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <Wallet size={12} className="opacity-40" />
                          {item.paymentMethod}
                        </div>
                      </td>
                      <td className="p-3 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <Home size={12} className="opacity-40" />
                          {item.bank}
                        </div>
                      </td>
                      <td className="p-3 align-middle">{item.installmentInfo}</td>
                      <td className="p-3 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          {item.importance}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cofrinho */}
          <section className="w-full lg:max-w-md">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-bold flex items-center gap-2">
                Cofrinho
              </h2>
              <button 
                onClick={() => openAddModal('savings')}
                className="text-[10px] font-bold uppercase tracking-widest bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={12} strokeWidth={3} />
                Novo Item
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden overflow-x-auto">
              <table className="min-w-[300px] w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-[#B6D7E8] text-[#1A1A1A]">
                    <th className="p-3 border-r border-white/20 w-32 align-middle">Valor</th>
                    <th className="p-3 border-r border-white/20 w-40 align-middle">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMonth.savings.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => setDetailItem({ item, type: 'savings' })}
                      className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="p-3 font-medium text-emerald-600 align-middle">{formatCurrency(item.amount)}</td>
                      <td className="p-3 opacity-80 align-middle">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Saídas do Mês */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-bold flex items-center gap-2">
                Saídas do Mês
              </h2>
              <button 
                onClick={() => openAddModal('expense')}
                className="text-[10px] font-bold uppercase tracking-widest bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={12} strokeWidth={3} />
                Nova Saída
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden overflow-x-auto">
              <table className="min-w-[800px] w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-[#B6D7E8] text-[#1A1A1A]">
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Data" sortKey="date" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Valor de Saída" sortKey="amount" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Descrição" sortKey="description" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Categoria" sortKey="category" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Forma de Pagamento" sortKey="paymentMethod" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Banco" sortKey="bank" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Parcela" sortKey="installmentInfo" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="p-0 border-r border-white/20 align-middle">
                      <SortButton label="Importância" sortKey="importance" currentConfig={sortConfig} onSort={handleSort} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData(activeMonth.expenses).map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => setDetailItem({ item, type: 'expense' })}
                      className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="p-3 opacity-70 align-middle">{item.date.split('-').reverse().slice(0, 2).join('/')}</td>
                      <td className="p-3 font-medium text-emerald-600 align-middle">{formatCurrency(item.amount)}</td>
                      <td className="p-3 align-middle">{item.description}</td>
                      <td className="p-3 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <CategoryIcon category={item.category} />
                          {item.category}
                        </div>
                      </td>
                      <td className="p-3 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <Wallet size={12} className="opacity-40" />
                          {item.paymentMethod}
                        </div>
                      </td>
                      <td className="p-3 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <Home size={12} className="opacity-40" />
                          {item.bank}
                        </div>
                      </td>
                      <td className="p-3 align-middle">{item.installmentInfo}</td>
                      <td className="p-3 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            item.importance === 'Essencial' ? "bg-blue-400" : "bg-gray-400"
                          )} />
                          {item.importance}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </header>

      {/* Modal for adding items */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={
          editingItem ? 'Editar Registro' :
          modalType === 'income' ? 'Nova Entrada' : 
          modalType === 'expense' ? 'Nova Saída' : 'Novo Item no Cofrinho'
        }
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase opacity-60">Descrição</label>
            <input 
              type="text" 
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 bg-[#F8F9FA] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
              placeholder="Ex: Salário, Aluguel..." 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase opacity-60">
                {modalType === 'expense' ? 'Valor Total' : 'Valor'}
              </label>
              <input 
                type="number" 
                step="0.01"
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-3 bg-[#F8F9FA] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                placeholder="0,00" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase opacity-60">Data</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 bg-[#F8F9FA] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
              />
            </div>
          </div>
          {modalType !== 'savings' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 bg-[#F8F9FA] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option>Salário</option>
                    <option>Moradia</option>
                    <option>Educação</option>
                    <option>Lazer</option>
                    <option>Desp. Fixas</option>
                    <option>Estética</option>
                    <option>Transporte</option>
                    <option>Alimentação</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">Banco</label>
                  <select 
                    value={formData.bank}
                    onChange={e => setFormData({ ...formData, bank: e.target.value })}
                    className="w-full p-3 bg-[#F8F9FA] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option>Itaú</option>
                    <option>NuBank</option>
                    <option>Mercado Pago</option>
                    <option>Banco do Brasil</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">Pagamento</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full p-3 bg-[#F8F9FA] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option>Pix</option>
                    <option>Cartão de Crédito</option>
                    <option>Boleto</option>
                    <option>Dinheiro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">Importância</label>
                  <select 
                    value={formData.importance}
                    onChange={e => setFormData({ ...formData, importance: e.target.value as any })}
                    className="w-full p-3 bg-[#F8F9FA] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Essencial">Essencial</option>
                    <option value="Não Essencial">Não Essencial</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase opacity-60">É parcelado?</label>
                  <select 
                    value={formData.isInstallment ? 'Sim' : 'Não'}
                    onChange={e => setFormData({ ...formData, isInstallment: e.target.value === 'Sim' })}
                    className="w-full p-3 bg-[#F8F9FA] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                {formData.isInstallment && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase opacity-60">Parcela</label>
                    <input 
                      type="text" 
                      value={formData.installmentInfo}
                      onChange={e => setFormData({ ...formData, installmentInfo: e.target.value })}
                      className="w-full p-3 bg-[#F8F9FA] border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="Ex: 12x ou 01/12"
                    />
                  </div>
                )}
              </div>
            </>
          )}
          <button type="submit" className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-xl hover:bg-black transition-colors mt-4">
            {editingItem ? 'Atualizar Registro' : 'Salvar Registro'}
          </button>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        title="Detalhes do Registro"
      >
        {detailItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase opacity-40">Descrição</p>
                <p className="font-medium">{detailItem.item.description}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase opacity-40">Valor</p>
                <p className="font-bold text-emerald-600 text-lg">{formatCurrency(detailItem.item.amount)}</p>
              </div>
              
              {'date' in detailItem.item && (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase opacity-40">Data</p>
                    <p className="font-medium">{(detailItem.item as Transaction).date.split('-').reverse().join('/')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase opacity-40">Categoria</p>
                    <div className="flex items-center gap-2 font-medium">
                      <CategoryIcon category={(detailItem.item as Transaction).category} />
                      {(detailItem.item as Transaction).category}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase opacity-40">Banco</p>
                    <p className="font-medium">{(detailItem.item as Transaction).bank}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase opacity-40">Pagamento</p>
                    <p className="font-medium">{(detailItem.item as Transaction).paymentMethod}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase opacity-40">Importância</p>
                    <p className="font-medium">{(detailItem.item as Transaction).importance}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase opacity-40">Parcelamento</p>
                    <p className="font-medium">
                      {(detailItem.item as Transaction).isInstallment ? `Sim (${(detailItem.item as Transaction).installmentInfo})` : 'Não'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-black/5">
              <button
                onClick={() => {
                  const item = detailItem.item;
                  const type = detailItem.type;
                  setDetailItem(null);
                  openEditModal(item, type);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Edit2 size={16} />
                Editar
              </button>
              <button
                onClick={() => {
                  handleDelete(detailItem.item.id, detailItem.type);
                  setDetailItem(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
