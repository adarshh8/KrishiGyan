// src/components/FarmCalendar.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { 
  Calendar, Plus, Edit2, Trash2, CheckCircle, Circle, 
  Clock, AlertCircle, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';

const FarmCalendar = () => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    priority: 'medium',
    status: 'pending',
    farmId: ''
  });

  const taskCategories = [
    { value: 'planting', label: t('taskCategoryPlanting') || 'Planting', color: 'green' },
    { value: 'harvesting', label: t('taskCategoryHarvesting') || 'Harvesting', color: 'orange' },
    { value: 'irrigation', label: t('taskCategoryIrrigation') || 'Irrigation', color: 'blue' },
    { value: 'fertilizing', label: t('taskCategoryFertilizing') || 'Fertilizing', color: 'purple' },
    { value: 'pestControl', label: t('taskCategoryPestControl') || 'Pest Control', color: 'red' },
    { value: 'pruning', label: t('taskCategoryPruning') || 'Pruning', color: 'yellow' },
    { value: 'weeding', label: t('taskCategoryWeeding') || 'Weeding', color: 'teal' },
    { value: 'other', label: t('taskCategoryOther') || 'Other', color: 'gray' }
  ];

  const priorities = [
    { value: 'low', label: t('priorityLow') || 'Low', color: 'green' },
    { value: 'medium', label: t('priorityMedium') || 'Medium', color: 'yellow' },
    { value: 'high', label: t('priorityHigh') || 'High', color: 'red' }
  ];

  const statuses = [
    { value: 'pending', label: t('statusPending') || 'Pending', icon: Circle },
    { value: 'inProgress', label: t('statusInProgress') || 'In Progress', icon: Clock },
    { value: 'completed', label: t('statusCompleted') || 'Completed', icon: CheckCircle }
  ];

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const monthNames = [
    t('monthJanuary') || 'January', t('monthFebruary') || 'February', 
    t('monthMarch') || 'March', t('monthApril') || 'April',
    t('monthMay') || 'May', t('monthJune') || 'June',
    t('monthJuly') || 'July', t('monthAugust') || 'August',
    t('monthSeptember') || 'September', t('monthOctober') || 'October',
    t('monthNovember') || 'November', t('monthDecember') || 'December'
  ];

  const dayNames = [
    t('daySunday') || 'Sun', t('dayMonday') || 'Mon', 
    t('dayTuesday') || 'Tue', t('dayWednesday') || 'Wed',
    t('dayThursday') || 'Thu', t('dayFriday') || 'Fri', 
    t('daySaturday') || 'Sat'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
      setTaskForm({ ...taskForm, date: date.toISOString().split('T')[0] });
      setShowTaskModal(true);
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.category || !taskForm.date) {
      alert(t('fillRequiredFields') || 'Please fill all required fields');
      return;
    }

    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...taskForm, id: editingTask.id }
          : task
      ));
    } else {
      // Add new task
      const newTask = {
        id: Date.now(),
        ...taskForm
      };
      setTasks([...tasks, newTask]);
    }

    // Reset form
    setTaskForm({
      title: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      priority: 'medium',
      status: 'pending',
      farmId: ''
    });
    setEditingTask(null);
    setShowTaskModal(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (id) => {
    if (window.confirm(t('confirmDeleteTask') || 'Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    let filteredTasks = tasks.filter(task => task.date === dateStr);

    if (filterCategory !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
    }

    return filteredTasks;
  };

  const getTasksForSelectedDate = () => {
    return getTasksForDate(selectedDate);
  };

  const getCategoryColor = (category) => {
    const cat = taskCategories.find(c => c.value === category);
    return cat ? cat.color : 'gray';
  };

  const getPriorityColor = (priority) => {
    const pri = priorities.find(p => p.value === priority);
    return pri ? pri.color : 'gray';
  };

  const getCategoryColorClass = (color) => {
    const colorMap = {
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      teal: 'bg-teal-500',
      gray: 'bg-gray-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getBorderColorClass = (color) => {
    const colorMap = {
      green: 'border-green-500 bg-green-50',
      orange: 'border-orange-500 bg-orange-50',
      blue: 'border-blue-500 bg-blue-50',
      purple: 'border-purple-500 bg-purple-50',
      red: 'border-red-500 bg-red-50',
      yellow: 'border-yellow-500 bg-yellow-50',
      teal: 'border-teal-500 bg-teal-50',
      gray: 'border-gray-500 bg-gray-50'
    };
    return colorMap[color] || 'border-gray-500 bg-gray-50';
  };

  const getPriorityBgClass = (priority) => {
    const colorMap = {
      high: 'bg-red-200 text-red-700',
      medium: 'bg-yellow-200 text-yellow-700',
      low: 'bg-green-200 text-green-700'
    };
    return colorMap[priority] || 'bg-gray-200 text-gray-700';
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateTasks = getTasksForSelectedDate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-green mb-4 flex items-center justify-center gap-3">
          <Calendar size={40} />
          {t('farmCalendarTaskScheduler') || 'Farm Calendar & Task Scheduler'}
        </h1>
        <p className="text-xl text-natural-brown">
          {t('scheduleManageTasks') || 'Schedule and manage your farming tasks'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold text-primary-green">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const isToday = date && date.toDateString() === new Date().toDateString();
                const isSelected = date && date.toDateString() === selectedDate.toDateString();
                const dateTasks = date ? getTasksForDate(date) : [];
                const hasTasks = dateTasks.length > 0;

                if (!date) {
                  return <div key={index} className="aspect-square"></div>;
                }

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`aspect-square border-2 rounded-lg p-1 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-primary-green bg-green-50'
                        : isToday
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {date.getDate()}
                    </div>
                    {hasTasks && (
                      <div className="flex flex-wrap gap-1">
                        {dateTasks.slice(0, 3).map(task => {
                          const category = taskCategories.find(c => c.value === task.category);
                          return (
                            <div
                              key={task.id}
                              className={`w-2 h-2 rounded-full ${getCategoryColorClass(category?.color || 'gray')}`}
                              title={task.title}
                            />
                          );
                        })}
                        {dateTasks.length > 3 && (
                          <div className="text-xs text-gray-500">+{dateTasks.length - 3}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">{t('filter') || 'Filter'}:</span>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-green"
              >
                <option value="all">{t('allCategories') || 'All Categories'}</option>
                {taskCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-green"
              >
                <option value="all">{t('allStatuses') || 'All Statuses'}</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Panel - Takes 1 column */}
        <div className="space-y-6">
          {/* Selected Date Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary-green flex items-center gap-2">
                <Calendar size={20} />
                {t('tasksFor') || 'Tasks for'} {selectedDate.toLocaleDateString()}
              </h2>
              <button
                onClick={() => {
                  setTaskForm({ ...taskForm, date: selectedDate.toISOString().split('T')[0] });
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                className="p-2 bg-primary-green text-white rounded-lg hover:bg-primary-light transition-colors"
                title={t('addTask') || 'Add Task'}
              >
                <Plus size={20} />
              </button>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 text-sm">{t('noTasksForDate') || 'No tasks for this date'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map(task => {
                  const category = taskCategories.find(c => c.value === task.category);
                  const status = statuses.find(s => s.value === task.status);
                  const StatusIcon = status?.icon || Circle;
                  
                  return (
                    <div
                      key={task.id}
                      className={`p-4 border-l-4 rounded-lg ${getBorderColorClass(category?.color || 'gray')}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">{task.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBgClass(task.priority)}`}>
                              {priorities.find(p => p.value === task.priority)?.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{category?.label}</span>
                            {task.time && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {task.time}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title={t('edit') || 'Edit'}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title={t('delete') || 'Delete'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs font-semibold text-gray-700">{t('status') || 'Status'}:</span>
                        <div className="flex gap-2">
                          {statuses.map(s => {
                            const Icon = s.icon;
                            return (
                              <button
                                key={s.value}
                                onClick={() => handleStatusChange(task.id, s.value)}
                                className={`p-1 rounded ${
                                  task.status === s.value
                                    ? getPriorityBgClass(task.priority)
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                                title={s.label}
                              >
                                <Icon size={14} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-primary-green mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              {t('upcomingTasks') || 'Upcoming Tasks'}
            </h2>
            {tasks
              .filter(task => {
                const taskDate = new Date(task.date);
                return taskDate >= new Date() && task.status !== 'completed';
              })
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5)
              .map(task => {
                const category = taskCategories.find(c => c.value === task.category);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-2 border-b border-gray-100 last:border-0">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColorClass(category?.color || 'gray')}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{new Date(task.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            {tasks.filter(t => {
              const taskDate = new Date(t.date);
              return taskDate >= new Date() && t.status !== 'completed';
            }).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">{t('noUpcomingTasks') || 'No upcoming tasks'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-primary-green mb-4">
              {editingTask ? t('editTask') || 'Edit Task' : t('addTask') || 'Add Task'}
            </h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('taskTitle') || 'Task Title'} *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('category') || 'Category'} *
                </label>
                <select
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green"
                  required
                >
                  <option value="">{t('selectCategory') || 'Select Category'}</option>
                  {taskCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('date') || 'Date'} *
                  </label>
                  <input
                    type="date"
                    value={taskForm.date}
                    onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('time') || 'Time'}
                  </label>
                  <input
                    type="time"
                    value={taskForm.time}
                    onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('priority') || 'Priority'}
                </label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green"
                >
                  {priorities.map(pri => (
                    <option key={pri.value} value={pri.value}>{pri.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('description') || 'Description'}
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-green to-primary-light text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  {editingTask ? t('updateTask') || 'Update Task' : t('addTask') || 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    setTaskForm({
                      title: '',
                      description: '',
                      category: '',
                      date: new Date().toISOString().split('T')[0],
                      time: '',
                      priority: 'medium',
                      status: 'pending',
                      farmId: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cancel') || 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmCalendar;

