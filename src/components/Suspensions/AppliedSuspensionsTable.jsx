import React from 'react'
import { formatDate } from '../../utils/dateFormatters'

export const AppliedSuspensionsTable = ({ appliedSuspensions }) => {
  if (!appliedSuspensions || appliedSuspensions.length === 0) return null

  return (
    <div className="glassmorphism-table mb-8">
      <div className="flex justify-between items-center p-6 border-b border-slate-600/30">
        <h3 className="text-xl font-bold text-white">
          Suspensiones Aplicadas 
          <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-lg text-sm ml-2">{appliedSuspensions.length}</span>
        </h3>
      </div>
      <table className="w-full border-collapse">
        <thead className="bg-slate-800/90">
          <tr>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Nombre</th>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Fecha Suspensión</th>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Días</th>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Faltas Originales</th>
            <th className="p-4 text-left text-slate-300 text-sm uppercase">Estado</th>
          </tr>
        </thead>
        <tbody>
          {appliedSuspensions.map((suspension, idx) => (
            <tr key={idx} className="border-b border-slate-600/30">
              <td className="p-4">{suspension.employeeName}</td>
              <td className="p-4">{formatDate(suspension.suspensionDate)}</td>
              <td className="p-4">{suspension.days} día(s)</td>
              <td className="p-4">{suspension.originalAbsences}</td>
              <td className="p-4"><span className="status-badge status-aplicada">REALIZADA</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}