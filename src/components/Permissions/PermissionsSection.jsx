import React, { useState } from 'react'
import { PermissionModal } from './PermissionModal'

export const PermissionsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <div className="glassmorphism-table">
        <div className="flex justify-between items-center p-6 border-b border-slate-600/30">
          <h3 className="text-xl font-bold text-white">Solicitud de Permisos</h3>
          <button onClick={() => setIsModalOpen(true)} className="modern-button">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Generar Permiso
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-slate-800/30 border-b border-slate-600/30">
          <input type="text" placeholder="Filtrar por nombre..." className="filter-input" />
          <input type="text" placeholder="Filtrar por fecha..." className="filter-input" />
          <input type="text" placeholder="Filtrar por tipo..." className="filter-input" />
        </div>
        
        <table className="w-full border-collapse">
          <thead className="bg-slate-800/90">
            <tr>
              <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">Nombre</th>
              <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">Fecha</th>
              <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">Tipo de Permiso</th>
              <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan="4" className="p-8 text-center text-slate-400">Los permisos generados aparecerán aquí</td></tr>
          </tbody>
        </table>
      </div>

      <PermissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}