'use client'

import React, { useState, useEffect } from 'react'
import { attendanceSupabaseService } from '../../services/attendanceSupabaseService'
import { showNotification } from '../UI/NotificationContainer'

export const AttendanceEditModal = ({ isOpen, onClose, attendance, onUpdate }) => {
  const [formData, setFormData] = useState({
    FECHA: '',
    NOMBRE: '',
    MOTIVO: '',
    PUNTOS: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (attendance && isOpen) {
      setFormData({
        FECHA: attendance.FECHA || '',
        NOMBRE: attendance.NOMBRE || '',
        MOTIVO: attendance.MOTIVO || '',
        PUNTOS: attendance.PUNTOS || '0'
      })
    }
  }, [attendance, isOpen])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.FECHA || !formData.NOMBRE || !formData.MOTIVO) {
      showNotification('Por favor, complete todos los campos', 'error')
      return
    }

    setLoading(true)
    
    // Truncar campos para evitar errores de tamaño
    const cleanedData = {
      FECHA: formData.FECHA.substring(0, 20),
      NOMBRE: formData.NOMBRE.substring(0, 200),
      MOTIVO: formData.MOTIVO.substring(0, 100),
      PUNTOS: formData.PUNTOS.substring(0, 20)
    }
    
    console.log('📝 Actualizando registro:', { id: attendance.id, ...cleanedData })
    
    // Usar onUpdate que viene del padre (que llama a update)
    await onUpdate(attendance.id, cleanedData)
    
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-6 max-w-[500px] w-full max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/95 py-2">
          <h3 className="text-xl font-bold text-white">Editar Registro de Asistencia</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Fecha</label>
            <input type="text" className="form-input" value={formData.FECHA} onChange={(e) => handleChange('FECHA', e.target.value)} required />
          </div>
          
          <div className="mb-4">
            <label className="form-label">Nombre del Empleado</label>
            <input type="text" className="form-input" value={formData.NOMBRE} onChange={(e) => handleChange('NOMBRE', e.target.value)} required />
          </div>
          
          <div className="mb-4">
            <label className="form-label">Asunto</label>
            <select className="form-input" value={formData.MOTIVO} onChange={(e) => handleChange('MOTIVO', e.target.value)} required>
              <option value="">Seleccione un tipo</option>
              <option value="Asistencia">Asistencia</option>
              <option value="Permiso - Por Hora">Permiso - Por Hora</option>
              <option value="Permiso - Por Día">Permiso - Por Día</option>
              <option value="Falta injustificada">Falta injustificada</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Suspensión">Suspensión</option>
              <option value="Falta justificada">Falta justificada</option>
              <option value="5hrs">5hrs</option>
              <option value="Incapacidad">Incapacidad</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="form-label">Puntos</label>
            <input type="text" className="form-input" value={formData.PUNTOS} onChange={(e) => handleChange('PUNTOS', e.target.value)} />
          </div>
          
          <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-slate-900/95 py-2">
            <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
            <button type="submit" disabled={loading} className="modern-button">{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}