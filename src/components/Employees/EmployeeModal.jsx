import React, { useState, useEffect } from 'react'
import { employeesSupabaseService } from '../../services/employeesSupabaseService'
import { formatDateForInput } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'

export const EmployeeModal = ({ isOpen, onClose, onSuccess, employee }) => {
  const [formData, setFormData] = useState({
    nombre: '', gafete: '', fechaIngreso: '', numeroEmpleado: '', area: '', anos: '', diasVacaciones: '0'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && employee) {
      setFormData({
        nombre: employee.NOMBRE || '', gafete: employee.GAFETE || '',
        fechaIngreso: formatDateForInput(employee['FECHA DE INGRESO']) || '',
        numeroEmpleado: employee['NUMERO DE EMPLEADO'] || '', area: employee.AREA || '',
        anos: employee.AÑOS || '', diasVacaciones: employee['DIAS DE VACACIONES'] || '0'
      })
    } else if (isOpen) {
      setFormData({ nombre: '', gafete: '', fechaIngreso: '', numeroEmpleado: '', area: '', anos: '', diasVacaciones: '0' })
    }
  }, [isOpen, employee])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('fechaIngreso del form:', formData.fechaIngreso)
    
    let fechaFormateada = ''
    if (formData.fechaIngreso) {
      const [year, month, day] = formData.fechaIngreso.split('-')
      fechaFormateada = `${month}/${day}/${year}`
      console.log('fechaFormateada:', fechaFormateada)
    }
    
    const employeeData = {
      NOMBRE: formData.nombre, GAFETE: formData.gafete, 'FECHA DE INGRESO': fechaFormateada,
      'NUMERO DE EMPLEADO': formData.numeroEmpleado, AREA: formData.area,
      AÑOS: formData.anos, 'DIAS DE VACACIONES': formData.diasVacaciones
    }
    
    setLoading(true)
    let result
    if (employee) {
      result = await employeesSupabaseService.update(employee['NUMERO DE EMPLEADO'], employeeData)
    } else {
      result = await employeesSupabaseService.add(employeeData)
    }
    
    if (!result.error) {
      showNotification(employee ? 'Empleado actualizado' : 'Empleado agregado', 'success')
      onSuccess(); onClose()
    } else showNotification('Error al guardar', 'error')
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="shimmer-modal max-w-[500px] w-full max-h-[85vh]">
      <div className="shimmer-modal-scroll">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/95 py-2">
          <h3 className="text-xl font-bold text-white">{employee ? 'Editar Empleado' : 'Agregar Empleado'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label className="form-label">NOMBRE *</label><input type="text" className="form-input" value={formData.nombre} onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} required /></div>
          <div className="mb-4"><label className="form-label">GAFETE (URL)</label><input type="text" className="form-input" placeholder="https://..." value={formData.gafete} onChange={(e) => setFormData(prev => ({ ...prev, gafete: e.target.value }))} /></div>
          <div className="mb-4"><label className="form-label">FECHA DE INGRESO</label><input type="date" className="form-input" value={formData.fechaIngreso} onChange={(e) => setFormData(prev => ({ ...prev, fechaIngreso: e.target.value }))} /></div>
          <div className="mb-4"><label className="form-label">NUMERO DE EMPLEADO *</label><input type="text" className="form-input" value={formData.numeroEmpleado} onChange={(e) => setFormData(prev => ({ ...prev, numeroEmpleado: e.target.value }))} required /></div>
          <div className="mb-4"><label className="form-label">AREA</label><input type="text" className="form-input" value={formData.area} onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))} /></div>
          <div className="mb-4"><label className="form-label">AÑOS</label><input type="number" className="form-input" step="0.1" value={formData.anos} onChange={(e) => setFormData(prev => ({ ...prev, anos: e.target.value }))} /></div>
          <div className="mb-4"><label className="form-label">DIAS DE VACACIONES</label><input type="number" className="form-input" step="0.5" value={formData.diasVacaciones} onChange={(e) => setFormData(prev => ({ ...prev, diasVacaciones: e.target.value }))} /></div>
          
          <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-slate-900/95 py-2">
            <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
            <button type="submit" disabled={loading} className="modern-button">{loading ? 'Guardando...' : (employee ? 'Guardar Cambios' : 'Agregar Empleado')}</button>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}