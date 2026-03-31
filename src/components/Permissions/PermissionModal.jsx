import React, { useState, useEffect } from 'react'
import { googleSheetsService } from '../../services/googleSheetsService'
import { convertTo24Hour } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'

export const PermissionModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '', employeeId: '', area: '', fillDate: '', 
    dayPermission: false, dayWithPay: false,
    paternity: false, bereavement: false, marriage: false, 
    hoursPermission: false,
    entryTime: '', exitTime: '', 
    startDate: '', endDate: '', 
    comments: ''
  })
  const [employees, setEmployees] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadEmployees()
      const today = new Date()
      setFormData(prev => ({ 
        ...prev, 
        fillDate: `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}` 
      }))
    }
  }, [isOpen])

  const loadEmployees = async () => {
    const result = await googleSheetsService.getEmployees()
    if (!result.error && result.data) setEmployees(result.data)
  }

  const handleNameSearch = (value) => {
    setFormData(prev => ({ ...prev, name: value }))
    if (value.length > 1) {
      const matches = employees.filter(emp => emp.NOMBRE && emp.NOMBRE.toLowerCase().includes(value.toLowerCase())).slice(0, 10)
      setSuggestions(matches)
    } else setSuggestions([])
  }

  const selectEmployee = (emp) => {
    setFormData({ 
      ...formData, 
      name: emp.NOMBRE, 
      employeeId: emp['NUMERO DE EMPLEADO'] || '', 
      area: emp.AREA || 'General' 
    })
    setSuggestions([])
  }

  const handleToggleChange = (field) => {
    const newValue = !formData[field]
    setFormData(prev => ({ ...prev, [field]: newValue }))
    if (newValue) {
      const permissionTypes = ['dayPermission', 'dayWithPay', 'paternity', 'bereavement', 'marriage', 'hoursPermission']
      permissionTypes.forEach(type => {
        if (type !== field) setFormData(prev => ({ ...prev, [type]: false }))
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) { 
      showNotification('El nombre es obligatorio', 'error'); 
      return 
    }
    if (!formData.comments.trim()) { 
      showNotification('Los comentarios son obligatorios', 'error'); 
      return 
    }
    
    const hasPermissionType = ['dayPermission', 'dayWithPay', 'paternity', 'bereavement', 'marriage', 'hoursPermission'].some(t => formData[t])
    if (!hasPermissionType) { 
      showNotification('Seleccione al menos un tipo de permiso', 'error'); 
      return 
    }
    
    // Para permiso por horas, validar que tenga al menos entrada o salida
    if (formData.hoursPermission && (!formData.entryTime && !formData.exitTime)) { 
      showNotification('Para permiso por horas, especifique al menos hora de entrada o salida', 'error'); 
      return 
    }
    
    setLoading(true)
    
    // Calcular horas de permiso basado en entrada y salida (si ambas están presentes)
    let horasPermiso = '0'
    if (formData.hoursPermission && formData.entryTime && formData.exitTime) {
      const entrada = convertTo24Hour(formData.entryTime)
      const salida = convertTo24Hour(formData.exitTime)
      if (entrada && salida) {
        const [entradaH, entradaM] = entrada.split(':').map(Number)
        const [salidaH, salidaM] = salida.split(':').map(Number)
        let diffHoras = salidaH - entradaH
        let diffMinutos = salidaM - entradaM
        if (diffMinutos < 0) {
          diffHoras--
          diffMinutos += 60
        }
        horasPermiso = (diffHoras + diffMinutos / 60).toFixed(1)
      }
    } else if (formData.hoursPermission && formData.entryTime && !formData.exitTime) {
      horasPermiso = '0' // Solo entrada, sin salida especificada
    } else if (formData.hoursPermission && !formData.entryTime && formData.exitTime) {
      horasPermiso = '0' // Solo salida, sin entrada especificada
    }
    
    const permissionRecord = {
      'Nombre': formData.name, 
      'NumeroEmpleado': formData.employeeId, 
      'Area': formData.area,
      'FechaLLenado': formData.fillDate, 
      'PermisoDia': formData.dayPermission, 
      'PermisoDiaGoce': formData.dayWithPay,
      'Paternidad': formData.paternity, 
      'Fallecimiento': formData.bereavement, 
      'Matrimonio': formData.marriage,
      'PermisoHoras': formData.hoursPermission, 
      'HorasPermiso': horasPermiso,
      'PermisoEntrada': formData.entryTime ? convertTo24Hour(formData.entryTime) : '',
      'PermisoSalida': formData.exitTime ? convertTo24Hour(formData.exitTime) : '',
      'FechaInicio': formData.startDate, 
      'FechaRegreso': formData.endDate, 
      'Comentarios': formData.comments
    }
    
    const result = await googleSheetsService.addPermission(permissionRecord)
    if (!result.error) {
      showNotification('Permiso guardado exitosamente', 'success')
      const spreadsheetId = import.meta.env.VITE_PERMISSIONS_SPREADSHEET_ID
      setTimeout(() => window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=0`, '_blank'), 2000)
      onClose()
      setFormData({ 
        name: '', employeeId: '', area: '', fillDate: '', 
        dayPermission: false, dayWithPay: false, paternity: false, 
        bereavement: false, marriage: false, hoursPermission: false,
        entryTime: '', exitTime: '', startDate: '', endDate: '', comments: '' 
      })
    } else {
      showNotification('Error al guardar el permiso', 'error')
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-6 max-w-[600px] w-full max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/95 py-2">
          <h3 className="text-xl font-bold text-white">Solicitud de Permiso</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <label className="form-label">Nombre *</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.name} 
                onChange={(e) => handleNameSearch(e.target.value)} 
                required 
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 max-h-48 overflow-y-auto">
                  {suggestions.map((emp, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 cursor-pointer hover:bg-slate-700" 
                      onClick={() => selectEmployee(emp)}
                    >
                      {emp.NOMBRE}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="form-label"># Empleado</label>
              <input type="text" className="form-input" value={formData.employeeId} readOnly />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Área</label>
              <input type="text" className="form-input" value={formData.area} readOnly />
            </div>
            <div>
              <label className="form-label">Fecha de Llenado</label>
              <input type="text" className="form-input" value={formData.fillDate} readOnly />
            </div>
          </div>
          
          <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
            <h4 className="text-slate-300 font-semibold mb-3">Tipo de Permiso</h4>
            <div className="space-y-2">
              {[
                {key:'dayPermission', label:'Permiso por día'},
                {key:'dayWithPay', label:'Permiso por día con goce'},
                {key:'paternity', label:'Paternidad'},
                {key:'bereavement', label:'Fallecimiento'},
                {key:'marriage', label:'Matrimonio'},
                {key:'hoursPermission', label:'Permiso por horas'}
              ].map(perm => (
                <label key={perm.key} className="flex items-center justify-between cursor-pointer p-2">
                  <span className="text-slate-300 font-medium">{perm.label}</span>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={formData[perm.key]} 
                    onChange={() => handleToggleChange(perm.key)} 
                  />
                  <span className={`relative w-11 h-6 rounded-full transition-all duration-300 ${formData[perm.key] ? 'bg-emerald-500' : 'bg-slate-600'} before:content-[""] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all before:duration-300 ${formData[perm.key] ? 'before:translate-x-5' : 'before:translate-x-0.5'} before:top-0.5`}></span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Campos de entrada/salida para permiso por horas (sin campo de horas) */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Permiso de entrada</label>
              <input 
                type="time" 
                className="form-input" 
                value={formData.entryTime} 
                onChange={(e) => setFormData(prev => ({ ...prev, entryTime: e.target.value }))} 
              />
            </div>
            <div>
              <label className="form-label">Permiso de salida</label>
              <input 
                type="time" 
                className="form-input" 
                value={formData.exitTime} 
                onChange={(e) => setFormData(prev => ({ ...prev, exitTime: e.target.value }))} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Fecha de inicio</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.startDate} 
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} 
              />
            </div>
            <div>
              <label className="form-label">Fecha de regreso</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.endDate} 
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))} 
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="form-label">Comentarios *</label>
            <textarea 
              className="form-input" 
              rows="3" 
              value={formData.comments} 
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))} 
              placeholder="Justificación del permiso..." 
              required 
            />
          </div>
          
          <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-slate-900/95 py-2">
            <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
            <button type="submit" disabled={loading} className="modern-button">
              {loading ? 'Procesando...' : 'Generar Permiso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}