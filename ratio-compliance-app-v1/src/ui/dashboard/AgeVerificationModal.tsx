import React, { useState } from 'react';
import { StudentWeeklySchedule } from '../../core/week/types';
import { AGE_BUCKET_LABELS, AgeBucket } from '../../core/standards/types';
import { Modal } from '../components/Modal';

const AGE_BUCKETS: AgeBucket[] = [
  'birthTo17Months',
  'eighteenMonthsToThreeYears',
  'fourYearsAndOlder',
];

interface AgeVerificationModalProps {
  isOpen: boolean;
  students: StudentWeeklySchedule[];
  onVerify: (updates: { id: string, dob?: string, bucket?: AgeBucket }[]) => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ isOpen, students, onVerify }) => {
  const [dobs, setDobs] = useState<Record<string, string>>({});
  const [buckets, setBuckets] = useState<Record<string, AgeBucket>>({});

  const handleVerify = () => {
    const updates = students.map(s => ({
      id: s.id,
      dob: dobs[s.id],
      bucket: buckets[s.id] || (s.ageSource.type === 'manualAgeBucket' ? s.ageSource.ageBucket as AgeBucket : undefined)
    }));
    onVerify(updates);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Weekly Age Verification Required">
      <div style={{ marginBottom: '16px' }}>
        <p>Please confirm these students are in their correct age category for this week.</p>
        <p style={{ fontSize: '0.85rem', color: '#607086' }}>
          <em>Note: Entering a birthdate will remove the need for future manual verification for this student.</em>
        </p>
      </div>
      
      <table className="dataTable">
        <thead>
          <tr>
            <th>Student</th>
            <th>Age Category</th>
            <th>Birthday (Optional)</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.label}</td>
              <td>
                <select 
                  style={{ width: '100%' }}
                  value={buckets[s.id] || (s.ageSource.type === 'manualAgeBucket' ? s.ageSource.ageBucket : '')}
                  onChange={e => setBuckets({...buckets, [s.id]: e.target.value as AgeBucket})}
                >
                  {AGE_BUCKETS.map(b => <option key={b} value={b}>{AGE_BUCKET_LABELS[b]}</option>)}
                </select>
              </td>
              <td>
                <input 
                  type="date" 
                  style={{ width: '100%' }}
                  onChange={e => setDobs({...dobs, [s.id]: e.target.value})} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <button className="primaryButton" onClick={handleVerify}>Verify All</button>
      </div>
    </Modal>
  );
};
