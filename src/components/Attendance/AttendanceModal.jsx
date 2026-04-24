'use client'

import React, { useState, useEffect } from 'react'
import { attendanceSupabaseService } from '../../services/attendanceSupabaseService'
import { employeesSupabaseService } from '../../services/employeesSupabaseService'
import { showNotification } from '../UI/NotificationContainer'

export const AttendanceModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ fecha: '', nombre: '', tipo: '' })
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadEmployees()
      const today = new Date()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const year = today.getFullYear()
      setFormData(prev => ({ ...prev, fecha: `${month}/${day}/${year}` }))
    }
  }, [isOpen])

  const loadEmployees = async () => {
    const result = await employeesSupabaseService.getAll()
    if (!result.error && result.data) {
      setEmployees(result.data)
    }
  }

  const getPoints = (type) => {
    const pointsMap = {
      'Asistencia': 'parametro de prueba',
      'Permiso - Por Hora': 'Revisar hoja de permiso',
      'Permiso - Por Día': '-10',
      'Falta injustificada': '-10',
      'Vacaciones': 'N/A',
      'Suspensión': '-10',
      'Falta justificada': '-10',
      'NO SE ESCANEA O NO CUENTA CON GAFETE': '-$10',
      '5hrs': 'N/A',
      'Incapacidad': '-10'
    }
    return pointsMap[type] || '0'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fecha || !formData.nombre || !formData.tipo) {
      showNotification('Por favor, complete todos los campos', 'error')
      return
    }

    setLoading(true)
    
    const record = {
      FECHA: formData.fecha,
      NOMBRE: formData.nombre,
      MOTIVO: formData.tipo,
      PUNTOS: getPoints(formData.tipo)
    }
    
    const result = await attendanceSupabaseService.add(record)
    
    if (!result.error) {
      showNotification('Registro exitoso', 'success')
      onSuccess()
      onClose()
      setFormData({ fecha: '', nombre: '', tipo: '' })
      setShowSuggestions(false)
    } else {
      showNotification('Error al guardar registro', 'error')
    }
    
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="shimmer-modal max-w-[500px] w-full max-h-[85vh]">
        <div className="shimmer-modal-scroll">

          <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/95 py-2">
            <h3 className="text-xl font-bold text-white">Generar Reporte de Asistencia</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Fecha</label>
              <input type="text" className="form-input" value={formData.fecha} onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))} placeholder="mm/dd/aaaa" required />
            </div>
            
            <div className="mb-4 relative">
              <label className="form-label">Nombre del Empleado</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.nombre} 
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, nombre: e.target.value }))
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ingrese el nombre completo" 
                required 
              />
              {showSuggestions && formData.nombre.length > 0 && employees.filter(emp => emp.NOMBRE && emp.NOMBRE.toLowerCase().includes(formData.nombre.toLowerCase())).length > 0 && (
                <div className="absolute z-50 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-2xl">
                  {employees
                    .filter(emp => emp.NOMBRE && emp.NOMBRE.toLowerCase().includes(formData.nombre.toLowerCase()))
                    .slice(0, 10)
                    .map((emp, idx) => (
                      <div 
                        key={idx} 
                        className="p-2 cursor-pointer hover:bg-emerald-600 text-white transition-colors"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, nombre: emp.NOMBRE }))
                          setShowSuggestions(false)
                        }}
                      >
                        {emp.NOMBRE}
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="form-label">Tipo de Registro</label>
              <select className="form-input" value={formData.tipo} onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))} required>
                <option value="">Seleccione una opción</option>
                <option value="Asistencia">Asistencia</option>
                <option value="Permiso - Por Hora">Permiso - Por Hora</option>
                <option value="Permiso - Por Día">Permiso - Por Día</option>
                <option value="Falta injustificada">Falta injustificada</option>
                <option value="Vacaciones">Vacaciones</option>
                <option value="Suspensión">Suspensión</option>
                <option value="Falta justificada">Falta justificada</option>
                <option value="NO SE ESCANEA O NO CUENTA CON GAFETE">NO SE ESCANEA O NO CUENTA CON GAFETE</option>
                <option value="5hrs">5hrs</option>
                <option value="Incapacidad">Incapacidad</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-slate-900/95 py-2">
              <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
              <button type="submit" disabled={loading} className="modern-button">{loading ? 'Guardando...' : 'Guardar Registro'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}