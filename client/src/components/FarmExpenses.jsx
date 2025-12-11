// src/components/FarmExpenses.jsx
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { 
  Calculator, Plus, Trash2, TrendingUp, TrendingDown, 
  DollarSign, Save, FileText, Download
} from 'lucide-react';

const FarmExpenses = () => {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState({
    cropSales: 0,
    otherIncome: 0
  });
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    item: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const expenseCategories = [
    { value: 'seeds', label: t('expenseCategorySeeds') || 'Seeds' },
    { value: 'fertilizers', label: t('expenseCategoryFertilizers') || 'Fertilizers' },
    { value: 'pesticides', label: t('expenseCategoryPesticides') || 'Pesticides' },
    { value: 'labor', label: t('expenseCategoryLabor') || 'Labor' },
    { value: 'equipment', label: t('expenseCategoryEquipment') || 'Equipment' },
    { value: 'irrigation', label: t('expenseCategoryIrrigation') || 'Irrigation' },
    { value: 'transport', label: t('expenseCategoryTransport') || 'Transport' },
    { value: 'landRent', label: t('expenseCategoryLandRent') || 'Land Rent' },
    { value: 'other', label: t('expenseCategoryOther') || 'Other' }
  ];

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.category || !expenseForm.item || !expenseForm.amount) {
      alert(t('fillAllFields') || 'Please fill all required fields');
      return;
    }

    const newExpense = {
      id: Date.now(),
      ...expenseForm,
      amount: parseFloat(expenseForm.amount)
    };

    setExpenses([...expenses, newExpense]);
    setExpenseForm({
      category: '',
      item: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = parseFloat(income.cropSales || 0) + parseFloat(income.otherIncome || 0);
  const profit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(2) : 0;

  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const exportToCSV = () => {
    const csvContent = [
      [t('expenseReport') || 'Expense Report', '', '', ''],
      ['', '', '', ''],
      [t('date') || 'Date', t('category') || 'Category', t('item') || 'Item', t('amount') || 'Amount (₹)'],
      ...expenses.map(exp => [
        exp.date,
        expenseCategories.find(cat => cat.value === exp.category)?.label || exp.category,
        exp.item,
        exp.amount
      ]),
      ['', '', t('totalExpenses') || 'Total Expenses', totalExpenses],
      ['', '', t('totalIncome') || 'Total Income', totalIncome],
      ['', '', t('profit') || 'Profit', profit]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `farm-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-green mb-4 flex items-center justify-center gap-3">
          <Calculator size={40} />
          {t('farmExpensesProfit') || 'Farm Expenses & Profit Calculator'}
        </h1>
        <p className="text-xl text-natural-brown">
          {t('trackExpensesCalculateProfit') || 'Track your farm expenses and calculate your profit'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Add Expense Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-primary-green mb-4 flex items-center gap-2">
              <Plus size={24} />
              {t('addExpense') || 'Add Expense'}
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('category') || 'Category'} *
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  required
                >
                  <option value="">{t('selectCategory') || 'Select Category'}</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('item') || 'Item'} *
                </label>
                <input
                  type="text"
                  value={expenseForm.item}
                  onChange={(e) => setExpenseForm({ ...expenseForm, item: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder={t('itemPlaceholder') || 'e.g., Rice Seeds, Urea Fertilizer'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('amount') || 'Amount (₹)'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('date') || 'Date'} *
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('description') || 'Description'}
                </label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  rows="3"
                  placeholder={t('descriptionPlaceholder') || 'Additional notes...'}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-green to-primary-light text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {t('addExpense') || 'Add Expense'}
              </button>
            </form>
          </div>

          {/* Income Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary-green mb-4 flex items-center gap-2">
              <TrendingUp size={24} />
              {t('income') || 'Income'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('cropSales') || 'Crop Sales (₹)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={income.cropSales}
                  onChange={(e) => setIncome({ ...income, cropSales: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('otherIncome') || 'Other Income (₹)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={income.otherIncome}
                  onChange={(e) => setIncome({ ...income, otherIncome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Expenses List & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{t('totalExpenses') || 'Total Expenses'}</h3>
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-red-700">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{t('totalIncome') || 'Total Income'}</h3>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-green-700">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className={`bg-gradient-to-br border-l-4 rounded-xl p-6 shadow-lg ${
              profit >= 0 
                ? 'from-blue-50 to-blue-100 border-blue-500' 
                : 'from-orange-50 to-orange-100 border-orange-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{t('profit') || 'Profit'}</h3>
                <DollarSign className={profit >= 0 ? 'text-blue-600' : 'text-orange-600'} size={20} />
              </div>
              <p className={`text-3xl font-bold ${profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ₹{profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              {totalIncome > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {t('profitMargin') || 'Profit Margin'}: {profitMargin}%
                </p>
              )}
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary-green flex items-center gap-2">
                <FileText size={24} />
                {t('expenseList') || 'Expense List'}
              </h2>
              {expenses.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-light transition-colors"
                >
                  <Download size={18} />
                  {t('exportCSV') || 'Export CSV'}
                </button>
              )}
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <Calculator size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-primary-green mb-2">
                  {t('noExpensesYet') || 'No expenses added yet'}
                </h3>
                <p className="text-natural-brown">
                  {t('addFirstExpense') || 'Add your first expense to start tracking'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('date') || 'Date'}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('category') || 'Category'}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('item') || 'Item'}</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">{t('amount') || 'Amount'}</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">{t('actions') || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => {
                      const categoryLabel = expenseCategories.find(cat => cat.value === expense.category)?.label || expense.category;
                      return (
                        <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-700">{expense.date}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{categoryLabel}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            <div>
                              <div className="font-medium">{expense.item}</div>
                              {expense.description && (
                                <div className="text-xs text-gray-500 mt-1">{expense.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                            ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title={t('delete') || 'Delete'}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan="3" className="py-3 px-4 text-right text-gray-700">
                        {t('total') || 'Total'}:
                      </td>
                      <td className="py-3 px-4 text-right text-primary-green">
                        ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Expenses by Category */}
          {Object.keys(expensesByCategory).length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-primary-green mb-4">
                {t('expensesByCategory') || 'Expenses by Category'}
              </h2>
              <div className="space-y-3">
                {Object.entries(expensesByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const categoryLabel = expenseCategories.find(cat => cat.value === category)?.label || category;
                    const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">{categoryLabel}</span>
                          <span className="font-semibold text-gray-900">
                            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-green h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmExpenses;

