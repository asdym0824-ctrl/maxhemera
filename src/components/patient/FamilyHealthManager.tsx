import React, { useState } from 'react';
import { FamilyMember } from '../../types';
import { Users, UserPlus, ShieldAlert, Heart, Calendar } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface FamilyHealthManagerProps {
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
}

export const FamilyHealthManager: React.FC<FamilyHealthManagerProps> = ({ members, onAddMember }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<'mother' | 'father' | 'child' | 'spouse'>('mother');
  const [nationalId, setNationalId] = useState('');
  const [birthYear, setBirthYear] = useState('1360');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nationalId) return;

    onAddMember({
      patientId: 'user-patient-1',
      name,
      relation,
      nationalId,
      birthYear: parseInt(birthYear, 10) || 1360,
      gender: relation === 'mother' ? 'female' : 'male',
      allergies: [],
      chronicDiseases: []
    });

    setName('');
    setNationalId('');
    setIsModalOpen(false);
  };

  const relationLabels = {
    mother: 'مادر',
    father: 'پدر',
    child: 'فرزند',
    spouse: 'همسر'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">مدیریت سلامت اعضای خانواده</h3>
          <p className="text-xs text-slate-500">مدیریت نوبت‌ها، پرونده و سوابق پزشکی والدین و فرزندان</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          افزودن عضو جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(fam => (
          <div
            key={fam.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="font-bold text-base text-slate-900">{fam.name}</div>
              <Badge variant="blue">{relationLabels[fam.relation]}</Badge>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">کد ملی:</span>
                <span className="font-mono font-medium text-slate-800">{fam.nationalId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">سال تولد:</span>
                <span className="font-medium text-slate-800">{fam.birthYear}</span>
              </div>
            </div>

            {fam.chronicDiseases && fam.chronicDiseases.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">بیماری‌های مزمن:</span>
                <div className="flex flex-wrap gap-1">
                  {fam.chronicDiseases.map((cd, i) => (
                    <Badge key={i} variant="amber" size="sm">{cd}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="افزودن عضو جدید به پروفایل خانواده"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">نام و نام خانوادگی:</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثلاً: مریم رضایی"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600/30"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">نسبت خانوادگی:</label>
            <select
              value={relation}
              onChange={e => setRelation(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="mother">مادر</option>
              <option value="father">پدر</option>
              <option value="child">فرزند</option>
              <option value="spouse">همسر</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">کد ملی ۱۰ رقمی:</label>
            <input
              type="text"
              required
              value={nationalId}
              onChange={e => setNationalId(e.target.value)}
              placeholder="0012345678"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-600/30 font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" type="submit">
              ثبت عضو
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
