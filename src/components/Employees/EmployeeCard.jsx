import React from 'react'
import { formatDate } from '../../utils/dateFormatters'

export const EmployeeCard = ({ isOpen, onClose, employee, onEdit }) => {
  if (!isOpen || !employee) return null

  const isImageUrl = employee.GAFETE && (employee.GAFETE.includes('http') || employee.GAFETE.includes('https') || employee.GAFETE.includes('.jpg') || employee.GAFETE.includes('.png'))

  const canEdit = () => {
    const user = JSON.parse(localStorage.getItem('userSession') || '{}')
    return user.USUARIO?.toLowerCase() === 'marco cruger'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="shimmer-modal max-w-[900px] w-full max-h-[85vh]">
        <div className="shimmer-modal-scroll">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Gafete del Empleado</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          <div className="flex-1 min-w-[400px]">
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-600/30 flex items-center justify-center min-h-[450px]">
              {isImageUrl ? (
                <img src={employee.GAFETE} alt="Gafete" className="max-w-full max-h-[400px] rounded-lg object-contain shadow-xl" onError={(e) => { e.target.onerror = null; e.target.parentNode.innerHTML = '<div class="text-slate-400 text-center p-8">No hay imagen disponible</div>' }} />
              ) : <div className="text-slate-400 text-center p-8">No hay imagen de gafete disponible</div>}
            </div>
          </div>
          
          <div className="flex-1 min-w-[400px]">
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-600/30 h-full flex flex-col">
              <h4 className="text-emerald-400 text-lg font-bold mb-4 pb-2 border-b-2 border-emerald-500/30">INFORMACIÓN DEL EMPLEADO</h4>
              <div className="flex flex-col gap-3 flex-1">
                <div><label className="text-slate-400 text-xs font-bold uppercase">NOMBRE:</label><div className="mt-1 p-2 bg-slate-900/40 rounded-lg border border-slate-600/30 text-white">{employee.NOMBRE || 'No disponible'}</div></div>
                <div><label className="text-slate-400 text-xs font-bold uppercase">NÚMERO DE EMPLEADO:</label><div className="mt-1 p-2 bg-slate-900/40 rounded-lg border border-slate-600/30 text-white">{employee['NUMERO DE EMPLEADO'] || 'No disponible'}</div></div>
                <div><label className="text-slate-400 text-xs font-bold uppercase">FECHA DE INGRESO:</label><div className="mt-1 p-2 bg-slate-900/40 rounded-lg border border-slate-600/30 text-white">{formatDate(employee['FECHA DE INGRESO']) || 'No disponible'}</div></div>
                <div><label className="text-slate-400 text-xs font-bold uppercase">AREA:</label><div className="mt-1 p-2 bg-slate-900/40 rounded-lg border border-slate-600/30 text-white">{employee.AREA || 'No disponible'}</div></div>
                <div><label className="text-slate-400 text-xs font-bold uppercase">AÑOS DE SERVICIO:</label><div className="mt-1 p-2 bg-slate-900/40 rounded-lg border border-slate-600/30 text-white">{employee.AÑOS || '0'}</div></div>
                <div><label className="text-slate-400 text-xs font-bold uppercase">DÍAS DE VACACIONES:</label><div className="mt-1 p-2 bg-slate-900/40 rounded-lg border border-slate-600/30 text-white">{employee['DIAS DE VACACIONES'] || '0'}</div></div>
              </div>
              {canEdit() && <button onClick={onEdit} className="modern-button w-full mt-4 py-2 text-sm">Editar Información</button>}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end"><button onClick={onClose} className="modern-button">Cerrar</button></div>
        </div>
      </div>
    </div>
  )
}