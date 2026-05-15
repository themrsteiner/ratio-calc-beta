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
      
      <table className="dataTable" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ fontSize: '0.75rem', padding: '8px' }}>Student</th>
            <th style={{ fontSize: '0.75rem', padding: '8px' }}>Age Category</th>
            <th style={{ fontSize: '0.75rem', padding: '8px' }}>Birthday (Optional)</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', fontSize: '0.9rem' }}>{s.label}</td>
              <td style={{ padding: '4px' }}>
                <select 
                  style={{ fontSize: '0.8rem', padding: '4px', width: '100%' }}
                  value={buckets[s.id] || (s.ageSource.type === 'manualAgeBucket' ? s.ageSource.ageBucket : '')}
                  onChange={e => setBuckets({...buckets, [s.id]: e.target.value as AgeBucket})}
                >
                  {AGE_BUCKETS.map(b => <option key={b} value={b}>{AGE_BUCKET_LABELS[b]}</option>)}
                </select>
              </td>
              <td style={{ padding: '4px' }}>
                <input 
                  type="date" 
                  style={{ fontSize: '0.8rem', padding: '4px', width: '100%' }}
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
