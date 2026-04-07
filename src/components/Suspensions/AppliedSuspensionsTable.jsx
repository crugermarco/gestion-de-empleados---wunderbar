'use client'

import React from 'react'
import { suspensionSupabaseService } from '../../services/suspensionSupabaseService'
import { showNotification } from '../UI/NotificationContainer'
import { useAuth } from '../../contexts/AuthContext'

export const AppliedSuspensionsTable = ({ appliedSuspensions, onRefresh }) => {
  const { isAuthorizedUser } = useAuth()

  const handleDelete = async (suspension) => {
    if (confirm(`¿Estás seguro de eliminar la suspensión de ${suspension.nombre}?`)) {
      const result = await suspensionSupabaseService.eliminarSuspension(
        suspension.id, 
        suspension.nombre, 
        suspension.fechas_suspension
      )
      
      if (!result.error) {
        showNotification('Suspensión eliminada exitosamente', 'success')
        if (onRefresh) onRefresh()
      } else {
        showNotification('Error al eliminar la suspensión', 'error')
      }
    }
  }

  if (!appliedSuspensions || appliedSuspensions.length === 0) return null

  return (
    <div className="glassmorphism-table mb-8">
      <div className="flex justify-between items-center p-6 border-b border-slate-600/30">
        <h3 className="text-xl font-bold text-white">
          Suspensiones Aplicadas 
          <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-lg text-sm ml-2">{appliedSuspensions.length}</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-800/90">
            <tr>
              <th className="p-4 text-left text-slate-300 text-sm uppercase">Nombre</th>
              <th className="p-4 text-left text-slate-300 text-sm uppercase">Fecha Falta Original</th>
              <th className="p-4 text-left text-slate-300 text-sm uppercase">Fecha Inicio Suspensión</th>
              <th className="p-4 text-left text-slate-300 text-sm uppercase">Días</th>
              <th className="p-4 text-left text-slate-300 text-sm uppercase">Tipo</th>
              <th className="p-4 text-left text-slate-300 text-sm uppercase">Estado</th>
              {isAuthorizedUser() && <th className="p-4 text-left text-slate-300 text-sm uppercase">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {appliedSuspensions.map((suspension, idx) => (
              <tr key={suspension.id || idx} className="border-b border-slate-600/30">
                <td className="p-4 font-medium text-white">{suspension.nombre}</td>
                <td className="p-4">{suspension.fecha_falta || '-'}</td>
                <td className="p-4">{suspension.fecha_suspension || '-'}</td>
                <td className="p-4">{suspension.dias} día(s)</td>
                <td className="p-4">
                  <span className={`status-badge ${suspension.tipo_suspension === 'AUTOMATICA' ? 'status-automatica' : 'status-acumulacion'}`}>
                    {suspension.tipo_suspension === 'AUTOMATICA' ? 'AUTOMÁTICA' : 'ACUMULACIÓN'}
                  </span>
                </td>
                <td className="p-4"><span className="status-badge status-aplicada">APLICADA</span></td>
                {isAuthorizedUser() && (
                  <td className="p-4">
                    <button 
                      onClick={() => handleDelete(suspension)} 
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}