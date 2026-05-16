import React, { useState } from 'react';
import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../../core/standards/builtInTexasLicensedChildCareHome';
import { PanelToggle } from '../components/PanelToggle';

export const TexasStandardsTable: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="panel wide">
      <div className="panelHeader" style={{ marginBottom: isExpanded ? '16px' : 0 }}>
        <h2>{TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS.label}</h2>
        <div className="headerActions">
          <PanelToggle isOpen={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="standardsGrid">
            <div>
              <h3>One Caregiver</h3>
              <div className="tableWrap">
                <table className="dataTable compactTable">
                  <thead>
                    <tr>
                      <th>0-17m</th>
                      <th>18m-3y</th>
                      <th>4y+</th>
                      <th>Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS.oneCaregiverRows.map((row, i) => (
                      <tr key={i}>
                        <td>{row.birthTo17Months}</td>
                        <td>{row.eighteenMonthsToThreeYears}</td>
                        <td>{row.fourYearsAndOlder}</td>
                        <td><strong>{row.maxChildren}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3>Two Caregivers</h3>
              <div className="tableWrap">
                <table className="dataTable compactTable">
                  <thead>
                    <tr>
                      <th>0-17m</th>
                      <th>18m+</th>
                      <th>Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS.twoCaregiverRows.map((row, i) => (
                      <tr key={i}>
                        <td>{row.zeroTo17Months}</td>
                        <td>{row.eighteenMonthsAndOlder}</td>
                        <td><strong>{row.maxChildren}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#64748b' }}>
            <p><strong>Notes:</strong> {TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS.notes.join(' ')}</p>
          </div>
        </>
      )}
    </div>
  );
};
