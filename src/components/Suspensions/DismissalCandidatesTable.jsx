import React from 'react'
import { formatDate } from '../../utils/dateFormatters'

export const DismissalCandidatesTable = ({ dismissalCandidates }) => {
  if (!dismissalCandidates || dismissalCandidates.length === 0) return null

  return (
    <div className="glassmorphism-table">
      <div className="p-6 border-b border-slate-600/30">
        <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          CANDIDATOS A BAJA AUTOMÁTICA 
          <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-lg text-sm ml-2 blinking-row-red">{dismissalCandidates.length}</span>
        </h3>
      </div>
      <table className="w-full border-collapse">
        <thead className="bg-slate-800/90">
          <tr>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Nombre</th>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Faltas en 30 días</th>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Primera Falta</th>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Última Falta</th>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Estado</th>
          </tr>
        </thead>
        <tbody>
          {dismissalCandidates.map((candidate, idx) => (
            <tr key={idx} className="border-b border-slate-600/30 blinking-row-red">
              <td className="p-4">{candidate.employeeName}</td>
              <td className="p-4">{candidate.absencesCount} faltas</td>
              <td className="p-4">{formatDate(candidate.firstAbsenceDate)}</td>
              <td className="p-4">{formatDate(candidate.lastAbsenceDate)}</td>
              <td className="p-4"><span className="status-badge status-baja">BAJA</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}