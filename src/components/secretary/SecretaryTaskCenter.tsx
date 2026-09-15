import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  User, 
  Phone, 
  FileText, 
  Trash2, 
  Filter,
  Flame,
  Calendar,
  UserCheck
} from 'lucide-react';
import { ClinicTask, TaskPriority, TaskStatus, TaskType, Doctor } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface SecretaryTaskCenterProps {
  tasks: ClinicTask[];
  doctors?: Doctor[];
  onRefresh: () => void;
  onOpenSmsForTask?: (patientPhone: string, patientName: string) => void;
}

export const SecretaryTaskCenter: React.FC<SecretaryTaskCenterProps> = ({
  tasks,
  doctors: propDoctors,
  onRefresh,
  onOpenSmsForTask
}) => {
  const { currentUser } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterOwnership, setFilterOwnership] = useState<'all' | 'mine' | 'doctor' | 'secretary'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>(propDoctors || []);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('normal');
  const [newType, setNewType] = useState<TaskType>('call_patient');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newAssignedRole, setNewAssignedRole] = useState<'secretary' | 'doctor' | 'nurse'>('secretary');

  useEffect(() => {
    if (propDoctors && propDoctors.length > 0) {
      setAvailableDoctors(propDoctors);
      if (!selectedDoctorId && propDoctors[0]) {
        setSelectedDoctorId(propDoctors[0].id);
      }
    } else {
      if (currentUser.clinicId) {
        apiService.getClinicDoctors(currentUser.clinicId, currentUser.branchId).then(docs => {
          const fallback = docs.length > 0 ? docs : [];
          setAvailableDoctors(fallback);
          if (fallback.length > 0 && !selectedDoctorId) {
            setSelectedDoctorId(fallback[0].id);
          }
        });
      } else {
        setAvailableDoctors([]);
      }
    }
  }, [propDoctors, currentUser]);

  const priorityColors: Record<TaskPriority, { label: string; badge: 'rose' | 'amber' | 'blue' | 'slate'; border: string }> = {
    urgent: { label: 'فوری و حیاتی', badge: 'rose', border: 'border-rose-300 bg-rose-50/50' },
    high: { label: 'اولویت بالا', badge: 'amber', border: 'border-amber-300 bg-amber-50/50' },
    normal: { label: 'متوسط', badge: 'blue', border: 'border-slate-200 bg-white' },
    low: { label: 'عادی', badge: 'slate', border: 'border-slate-200 bg-slate-50/50' }
  };

  const typeLabels: Record<TaskType, string> = {
    call_patient: '📞 تماس و پیگیری بیمار',
    confirm_appointment: '✅ تأیید نوبت',
    payment_followup: '💳 تسویه حساب و امور مالی',
    document_collection: '📋 دریافت مدارک و پرونده',
    result_followup: '🧪 بررسی جواب آزمایش و تصویربرداری',
    reschedule: '🔄 تغییر زمان نوبت',
    no_show_followup: '⚠️ پیگیری عدم حضور بیمار',
    prepare_record: '📁 آماده‌سازی پرونده بالینی',
    visit_reminder: '🔔 یادآوری نوبت ویزیت',
    patient_inquiry: '💬 پاسخ به استعلام بیمار',
    doctor_request: '🩺 دستور پزشک معالج',
    general: '📌 تسک عمومی کلینیک'
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'active') {
      if (t.status === 'completed') return false;
    } else if (filterStatus !== 'all' && t.status !== filterStatus) {
      return false;
    }

    if (filterPriority !== 'all' && t.priority !== filterPriority) {
      return false;
    }

    if (filterOwnership === 'mine') {
      const isMine = t.assignedTo === currentUser.id || t.assignedTo === currentUser.doctorId || (currentUser.role === 'secretary' && t.assignedRole === 'secretary');
      if (!isMine) return false;
    } else if (filterOwnership === 'doctor') {
      if (t.assignedRole !== 'doctor') return false;
    } else if (filterOwnership === 'secretary') {
      if (t.assignedRole !== 'secretary' && t.assignedRole !== 'reception') return false;
    }

    return true;
  });

  const handleToggleComplete = async (task: ClinicTask) => {
    if (task.status === 'completed') {
      await apiService.updateTask(task.id, { status: 'todo' });
    } else {
      await apiService.completeTask(task.id, `تکمیل شد توسط ${currentUser.name}`, {
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role
      });
    }
    onRefresh();
  };

  const handleDelete = async (taskId: string) => {
    await apiService.deleteTask(taskId);
    onRefresh();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let assignedId = currentUser.id || 'secretary-queue';
    let assignedName = currentUser.name || 'منشی کلینیک';
    let targetDoctorId: string | undefined = undefined;

    if (newAssignedRole === 'doctor') {
      const chosenDoc = availableDoctors.find(d => d.id === selectedDoctorId) || availableDoctors[0];
      if (chosenDoc) {
        assignedId = chosenDoc.id;
        assignedName = chosenDoc.name;
        targetDoctorId = chosenDoc.id;
      } else if (currentUser.doctorId) {
        assignedId = currentUser.doctorId;
        assignedName = currentUser.name || 'پزشک معالج';
        targetDoctorId = currentUser.doctorId;
      } else {
        assignedId = 'doctor-station';
        assignedName = 'پزشک کشیک و معالج';
        targetDoctorId = undefined;
      }
    } else if (newAssignedRole === 'nurse') {
      assignedId = 'station-nursing';
      assignedName = 'ایستگاه پرستاری';
    } else {
      assignedId = currentUser.id || 'secretary-queue';
      assignedName = currentUser.role === 'secretary' ? (currentUser.name || 'منشی شیفت') : 'پذیرش و منشی کلینیک';
    }

    await apiService.createTask({
      clinicId: currentUser.clinicId || '',
      branchId: currentUser.branchId,
      doctorId: targetDoctorId,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      type: newType,
      priority: newPriority,
      status: 'todo',
      patientName: newPatientName.trim() || undefined,
      patientPhone: newPatientPhone.trim() || undefined,
      assignedTo: assignedId,
      assignedToName: assignedName,
      assignedRole: newAssignedRole,
      createdByName: currentUser.name || 'کاربر سیستم',
      createdBy: currentUser.id || 'user-system',
      dueDate: new Date().toISOString().split('T')[0]
    }, {
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role
    });

    setNewTitle('');
    setNewDesc('');
    setNewPatientName('');
    setNewPatientPhone('');
    setIsCreating(false);
    onRefresh();
  };

  const pendingUrgentCount = tasks.filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).length;

  return (
    <div id="secretary-task-center" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2">
              مرکز وظایف و پیگیری‌های کلینیک
              {pendingUrgentCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3" />
                  {pendingUrgentCount} پیگیری فوری
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مدیریت وظایف پرسنل، پیگیری‌های بعد از ویزیت، تماس‌ها و چک‌لیست روزانه
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreating(!isCreating)}
          icon={<Plus className="w-4 h-4" />}
        >
          {isCreating ? 'بستن فرم' : 'تسک جدید'}
        </Button>
      </div>

      {/* Quick Add Form */}
      {isCreating && (
        <form onSubmit={handleCreateTask} className="p-4 bg-indigo-50/50 border-b border-indigo-100 space-y-3 animate-in slide-in-from-top-2">
          <div className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600" />
            تعریف وظیفه یا پیگیری جدید:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                placeholder="عنوان وظیفه (مثال: تماس با بیمار جهت ارسال جواب پاتولوژی)..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
            </div>
            <div>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              >
                <option value="call_patient">📞 تماس با بیمار</option>
                <option value="result_followup">🧪 پیگیری آزمایش/تصویربرداری</option>
                <option value="document_collection">📋 مدارک و آمادگی قبل ویزیت</option>
                <option value="doctor_request">🩺 دستور پزشک</option>
                <option value="payment_followup">💳 امور مالی و بیمه</option>
                <option value="general">📌 تسک عمومی</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <input
                type="text"
                placeholder="نام بیمار (اختیاری)"
                value={newPatientName}
                onChange={e => setNewPatientName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <input
                type="tel"
                placeholder="شماره تماس بیمار"
                value={newPatientPhone}
                onChange={e => setNewPatientPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="urgent">🔴 فوری و آنی</option>
                <option value="high">🟠 اولویت بالا</option>
                <option value="normal">🔵 اولویت متوسط</option>
                <option value="low">⚪ عادی</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <select
                value={newAssignedRole}
                onChange={e => setNewAssignedRole(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="secretary">مسئول: پذیرش و منشی</option>
                <option value="doctor">مسئول: پزشک متخصص</option>
                <option value="nurse">مسئول: ایستگاه پرستاری</option>
              </select>

              {newAssignedRole === 'doctor' && availableDoctors.length > 0 && (
                <select
                  value={selectedDoctorId || availableDoctors[0]?.id}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-[11px] font-bold text-amber-900"
                >
                  {availableDoctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialtyName})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreating(false)}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" type="submit">
              ذخیره و ثبت در سیستم
            </Button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            جاری ({tasks.filter(t => t.status !== 'completed').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            تکمیل‌شده ({tasks.filter(t => t.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            همه ({tasks.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">تفکیک مسئول:</span>
            <select
              value={filterOwnership}
              onChange={e => setFilterOwnership(e.target.value as any)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
            >
              <option value="all">همه پرسنل</option>
              <option value="mine">وظایف من</option>
              <option value="doctor">تسک‌های پزشکان</option>
              <option value="secretary">پذیرش و منشی</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">اولویت:</span>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
            >
              <option value="all">همه</option>
              <option value="urgent">فوری (Urgent)</option>
              <option value="high">بالا (High)</option>
              <option value="normal">متوسط</option>
              <option value="low">عادی</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-2.5 max-h-[480px] overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-bold text-slate-600">هیچ وظیفه‌ای با فیلتر انتخاب شده یافت نشد.</p>
            <p className="text-[11px] text-slate-400 mt-1">وظایف جدید را از دکمه «تسک جدید» ثبت نمایید.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const prio = priorityColors[task.priority] || priorityColors.normal;
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : prio.border
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-blue-600 bg-white'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                        {typeLabels[task.type] || task.type}
                      </span>
                      <Badge variant={prio.badge} size="sm">
                        {prio.label}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      {task.patientName && (
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <User className="w-3 h-3 text-blue-600" />
                          بیمار: {task.patientName} {task.patientPhone && `(${task.patientPhone})`}
                        </span>
                      )}
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        مسئول: {task.assignedToName}
                      </span>
                      <span className="text-slate-400">تاریخ: {task.dueDate || task.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-center">
                  {task.patientPhone && onOpenSmsForTask && !isDone && (
                    <button
                      onClick={() => onOpenSmsForTask(task.patientPhone!, task.patientName || 'بیمار')}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      title="ارسال پیامک"
                    >
                      پیامک
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="حذف تسک"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
