'use client'

import React, { useState, useEffect } from 'react'
import { googleSheetsService } from '../../services/googleSheetsService'
import { formatDate, formatDateForSheet, isNonWorkingDay } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'

export const VacationScheduleModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeName: '', employeeId: '', area: '', entryDate: '', vacationDays: 0,
    payDate: '', startDate: '', returnDate: '', daysToTake: 0, decemberSave: 0, authorized: false,
    daysTaken: 0
  })
  const [employees, setEmployees] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [calculationInfo, setCalculationInfo] = useState('')
  const [payDateOptions, setPayDateOptions] = useState([])
  const [payDateType, setPayDateType] = useState('') // '', 'semanal', 'fecha'
  const [customPayDate, setCustomPayDate] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadEmployees()
      generatePayDateOptions()
    }
  }, [isOpen])

  const loadEmployees = async () => {
    const result = await googleSheetsService.getEmployees()
    if (!result.error && result.data) setEmployees(result.data)
  }

  const generatePayDateOptions = () => {
    const today = new Date()
    const fridays = []
    const currentYear = today.getFullYear()
    
    // Generar todos los viernes del año actual y siguiente
    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1)
        while (date.getMonth() === month) {
          if (date.getDay() === 5) { // 5 = Viernes
            fridays.push(new Date(date))
          }
          date.setDate(date.getDate() + 1)
        }
      }
    }
    
    // Formatear cada viernes a mm/dd/yyyy
    const options = fridays.map(friday => {
      const month = (friday.getMonth() + 1).toString().padStart(2, '0')
      const day = friday.getDate().toString().padStart(2, '0')
      const year = friday.getFullYear()
      const formattedDate = `${month}/${day}/${year}`
      return { value: formattedDate, label: formattedDate, dateObj: friday }
    })
    
    setPayDateOptions(options)
  }

  const handlePayDateTypeChange = (type) => {
    setPayDateType(type)
    if (type === 'semanal') {
      setFormData(prev => ({ ...prev, payDate: 'PAGO POR SEMANA' }))
      setCustomPayDate('')
    } else if (type === 'fecha') {
      // Si ya hay fecha de salida, autocompletar con el viernes anterior
      if (formData.startDate) {
        const startDate = new Date(formData.startDate)
        startDate.setHours(0, 0, 0, 0)
        
        let selectedFriday = null
        for (let i = payDateOptions.length - 1; i >= 0; i--) {
          const fridayDate = new Date(payDateOptions[i].dateObj)
          fridayDate.setHours(0, 0, 0, 0)
          if (fridayDate <= startDate) {
            selectedFriday = payDateOptions[i]
            break
          }
        }
        
        if (selectedFriday) {
          setCustomPayDate(selectedFriday.value)
          setFormData(prev => ({ ...prev, payDate: selectedFriday.value }))
        }
      } else {
        setCustomPayDate('')
        setFormData(prev => ({ ...prev, payDate: '' }))
      }
    } else {
      setFormData(prev => ({ ...prev, payDate: '' }))
      setCustomPayDate('')
    }
  }

  const handleCustomPayDateChange = (date) => {
    setCustomPayDate(date)
    setFormData(prev => ({ ...prev, payDate: date }))
  }

  // Actualizar fecha de pago cuando cambia la fecha de salida (solo si está en modo 'fecha')
  useEffect(() => {
    if (payDateType === 'fecha' && formData.startDate && payDateOptions.length > 0) {
      const startDate = new Date(formData.startDate)
      startDate.setHours(0, 0, 0, 0)
      
      let selectedFriday = null
      for (let i = payDateOptions.length - 1; i >= 0; i--) {
        const fridayDate = new Date(payDateOptions[i].dateObj)
        fridayDate.setHours(0, 0, 0, 0)
        if (fridayDate <= startDate) {
          selectedFriday = payDateOptions[i]
          break
        }
      }
      
      if (selectedFriday && selectedFriday.value !== customPayDate) {
        setCustomPayDate(selectedFriday.value)
        setFormData(prev => ({ ...prev, payDate: selectedFriday.value }))
      }
    }
  }, [formData.startDate, payDateType, payDateOptions])

  const handleEmployeeSearch = (value) => {
    setFormData(prev => ({ ...prev, employeeName: value }))
    if (value.length > 1) {
      const matches = employees.filter(emp => emp.NOMBRE && emp.NOMBRE.toLowerCase().includes(value.toLowerCase())).slice(0, 10)
      setSuggestions(matches)
    } else setSuggestions([])
  }

  const selectEmployee = (emp) => {
    setFormData({
      ...formData, employeeName: emp.NOMBRE, employeeId: emp['NUMERO DE EMPLEADO'] || '',
      area: emp.AREA || '', entryDate: formatDate(emp['FECHA DE INGRESO']) || '',
      vacationDays: parseFloat(emp['DIAS DE VACACIONES']) || 0
    })
    setSuggestions([])
  }

  const calculateVacationDates = () => {
    if (!formData.startDate || !formData.daysToTake) return

    const startDateStr = formData.startDate
    const [year, month, day] = startDateStr.split('-').map(Number)
    
    const startDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
    
    let daysToTake = Math.round(parseFloat(formData.daysToTake) * 10) / 10 || 0
    let decemberSave = Math.round(parseFloat(formData.decemberSave) * 10) / 10 || 0
    const availableDays = Math.round(parseFloat(formData.vacationDays) * 10) / 10 || 0
    
    const daysTaken = daysToTake
    
    const formattedStartDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`
    
    const VACATION_DAY_VALUE = 1.2
    const exactWorkDays = daysToTake / VACATION_DAY_VALUE
    const isExact = Math.abs(exactWorkDays - Math.round(exactWorkDays)) < 0.0001
    const workDaysNeeded = isExact ? Math.round(exactWorkDays) : Math.ceil(exactWorkDays)
    
    let lastVacationDay = new Date(startDate)
    let workDaysCounted = 1
    let nonWorkingDaysCount = 0
    
    while (workDaysCounted < workDaysNeeded) {
      lastVacationDay.setDate(lastVacationDay.getDate() + 1)
      
      const currentYear = lastVacationDay.getUTCFullYear()
      const currentMonth = (lastVacationDay.getUTCMonth() + 1).toString().padStart(2, '0')
      const currentDay = lastVacationDay.getUTCDate().toString().padStart(2, '0')
      const dateStrForCheck = `${currentYear}-${currentMonth}-${currentDay}`
      
      const isNonWorking = isNonWorkingDay(dateStrForCheck)
      
      if (!isNonWorking) {
        workDaysCounted++
      } else {
        nonWorkingDaysCount++
      }
    }
    
    let returnDate = new Date(lastVacationDay)
    returnDate.setDate(returnDate.getDate() + 1)
    
    let skippedReturnDays = 0
    let iterations = 0
    const maxIterations = 30
    
    while (iterations < maxIterations) {
      iterations++
      
      const returnYear = returnDate.getUTCFullYear()
      const returnMonth = (returnDate.getUTCMonth() + 1).toString().padStart(2, '0')
      const returnDay = returnDate.getUTCDate().toString().padStart(2, '0')
      const returnDateStr = `${returnYear}-${returnMonth}-${returnDay}`
      
      if (isNonWorkingDay(returnDateStr)) {
        returnDate.setDate(returnDate.getDate() + 1)
        skippedReturnDays++
      } else {
        break
      }
    }
    
    const returnYear = returnDate.getUTCFullYear()
    const returnMonth = (returnDate.getUTCMonth() + 1).toString().padStart(2, '0')
    const returnDay = returnDate.getUTCDate().toString().padStart(2, '0')
    const formattedReturnDate = `${returnMonth}/${returnDay}/${returnYear}`
    
    setFormData(prev => ({ ...prev, returnDate: formattedReturnDate, daysTaken: daysTaken }))
    
    const totalUsed = daysToTake + decemberSave
    const remainingBalance = availableDays - totalUsed
    
    const infoHTML = `
      <div style="background: rgba(30, 41, 59, 0.5); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(71, 85, 105, 0.3);">
        <h4 style="color: #34d399; margin-bottom: 0.75rem;">RESUMEN DEL CÁLCULO</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
          <div style="background: rgba(15, 23, 42, 0.4); padding: 0.5rem; border-radius: 0.375rem;">
            <strong style="color: #94a3b8;">Saldo disponible:</strong>
            <div style="color: #34d399; font-size: 1.1rem; font-weight: bold;">${availableDays.toFixed(1)} días</div>
          </div>
          
          <div style="background: rgba(15, 23, 42, 0.4); padding: 0.5rem; border-radius: 0.375rem;">
            <strong style="color: #94a3b8;">Días a tomar:</strong>
            <div style="color: #3b82f6; font-size: 1.1rem; font-weight: bold;">${daysToTake.toFixed(1)} días</div>
          </div>
          
          <div style="background: rgba(15, 23, 42, 0.4); padding: 0.5rem; border-radius: 0.375rem;">
            <strong style="color: #94a3b8;">Guardar para diciembre:</strong>
            <div style="color: #f59e0b; font-size: 1.1rem; font-weight: bold;">${decemberSave.toFixed(1)} días</div>
          </div>
          
          <div style="background: rgba(15, 23, 42, 0.4); padding: 0.5rem; border-radius: 0.375rem;">
            <strong style="color: #94a3b8;">Días descontados:</strong>
            <div style="color: #ef4444; font-size: 1.1rem; font-weight: bold;">${daysTaken.toFixed(1)} días</div>
          </div>
        </div>
        
        <div style="background: rgba(15, 23, 42, 0.6); padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 1rem;">
          <strong style="color: #94a3b8;">Cálculo de días laborales:</strong><br>
          <span style="color: #94a3b8;">
            ${daysToTake.toFixed(1)} días de vacaciones ÷ ${VACATION_DAY_VALUE} = ${exactWorkDays.toFixed(2)} días laborales<br>
            Días laborales requeridos: ${workDaysNeeded}<br>
            Días laborales durante vacaciones: ${workDaysCounted}<br>
            Días no laborales durante vacaciones: ${nonWorkingDaysCount} días
          </span>
        </div>
        
        <div style="background: rgba(15, 23, 42, 0.4); padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 1rem;">
          <strong style="color: #94a3b8;">Fechas importantes:</strong><br>
          <span style="color: #94a3b8; display: block;">
            📅 Inicio de vacaciones: ${formattedStartDate}<br>
            📅 Último día de vacaciones: ${lastVacationDay.toLocaleDateString('es-MX')}<br>
            ${skippedReturnDays > 0 ? `⏩ Días no laborables después de vacaciones: ${skippedReturnDays} días` : ''}
          </span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
          <div style="background: rgba(59, 130, 246, 0.1); padding: 0.75rem; border-radius: 0.375rem; border: 1px solid rgba(59, 130, 246, 0.3);">
            <strong style="color: #94a3b8;">Fecha de salida:</strong><br>
            <span style="color: #93c5fd; font-weight: 500;">${formattedStartDate}</span>
          </div>
          
          <div style="background: rgba(34, 197, 94, 0.1); padding: 0.75rem; border-radius: 0.375rem; border: 1px solid rgba(34, 197, 94, 0.3);">
            <strong style="color: #94a3b8;">Fecha de regreso:</strong><br>
            <span style="color: #6ee7b7; font-weight: 500;">${formattedReturnDate}</span>
          </div>
        </div>
        
        <div style="background: rgba(15, 23, 42, 0.4); padding: 0.75rem; border-radius: 0.375rem; border: 1px solid rgba(71, 85, 105, 0.3);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: #94a3b8;">Total días utilizados:</span>
            <span style="color: ${totalUsed > availableDays ? '#ef4444' : '#94a3b8'}; font-weight: bold;">
              ${totalUsed.toFixed(1)} días
            </span>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #94a3b8;">Saldo restante:</span>
            <span style="color: ${remainingBalance < 0 ? '#ef4444' : '#34d399'}; font-weight: bold;">
              ${remainingBalance.toFixed(1)} días
            </span>
          </div>
          
          ${remainingBalance < 0 ? `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.5rem; margin-top: 0.5rem; border-radius: 0.375rem;">
              <span style="color: #ef4444;">⚠️ Advertencia: El empleado no cuenta con los días para cubrir dicho periodo</span>
            </div>
          ` : ''}
        </div>
        
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(71, 85, 105, 0.3);">
          <small style="color: #64748b; font-style: italic;">
            Nota: La fecha de regreso se calcula partiendo de la fecha de salida y tomando 1.2 por día, brincando los días no laborables
          </small>
        </div>
      </div>
    `
    
    setCalculationInfo(infoHTML)
  }

  useEffect(() => { 
    if (formData.startDate && formData.daysToTake) calculateVacationDates() 
  }, [formData.startDate, formData.daysToTake, formData.decemberSave])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.employeeName || !formData.startDate || !formData.daysToTake) {
      showNotification('Complete los campos obligatorios', 'error')
      return
    }
    if (formData.daysToTake > formData.vacationDays) {
      showNotification(`Los días a tomar (${formData.daysToTake}) superan los disponibles (${formData.vacationDays})`, 'error')
      return
    }
    
    const [year, month, day] = formData.startDate.split('-').map(Number)
    const formattedStartDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`
    
    const vacationRecord = {
      'NOMBRE': formData.employeeName, 'FECHA DE INGRESO': formData.entryDate,
      'NUMERO DE EMPLEADO': formData.employeeId, 'ÁREA': formData.area,
      'DÍAS VACACIONES': formData.vacationDays.toString(), 'FECHA DE PAGO': formData.payDate || '',
      'FECHA SALIDA': formattedStartDate, 'FECHA REGRESO': formData.returnDate,
      'AUTORIZADAS': formData.authorized ? 'TRUE' : 'FALSE',
      'DÍAS TOMADOS': formData.daysToTake.toFixed(1), 'GUARDAR DICIEMBRE': (formData.decemberSave || 0).toFixed(1)
    }
    
    setLoading(true)
    const result = await googleSheetsService.addVacation(vacationRecord)
    if (!result.error) {
      showNotification('Vacaciones guardadas exitosamente', 'success')
      onSuccess(); onClose()
      setFormData({ employeeName: '', employeeId: '', area: '', entryDate: '', vacationDays: 0, payDate: '', startDate: '', returnDate: '', daysToTake: 0, decemberSave: 0, authorized: false, daysTaken: 0 })
      setPayDateType('')
      setCustomPayDate('')
    } else showNotification('Error al guardar vacaciones', 'error')
    setLoading(false)
  }

  if (!isOpen) return null

  const today = new Date()
  const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-6 max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/95 py-2">
          <h3 className="text-xl font-bold text-white">AGENDAR VACACIONES</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="form-label">Nombre del Empleado *</label>
            <input type="text" className="form-input" value={formData.employeeName} onChange={(e) => handleEmployeeSearch(e.target.value)} required />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 max-h-48 overflow-y-auto">
                {suggestions.map((emp, idx) => <div key={idx} className="p-2 cursor-pointer hover:bg-slate-700" onClick={() => selectEmployee(emp)}>{emp.NOMBRE}</div>)}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="form-label">Fecha de Ingreso</label><input type="text" className="form-input" value={formData.entryDate} readOnly /></div>
            <div><label className="form-label">Número de Empleado</label><input type="text" className="form-input" value={formData.employeeId} readOnly /></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="form-label">Área</label><input type="text" className="form-input" value={formData.area} readOnly /></div>
            <div><label className="form-label">Días Disponibles</label><input type="text" className="form-input" value={formData.vacationDays} readOnly /></div>
          </div>
          
          <div className="mb-4">
            <label className="form-label">Fecha de Pago</label>
            <select 
              className="form-input" 
              value={payDateType} 
              onChange={(e) => handlePayDateTypeChange(e.target.value)}
            >
              <option value="">Seleccionar fecha de pago</option>
              <option value="fecha">Seleccionar fecha de pago</option>
              <option value="semanal">PAGO POR SEMANA</option>
            </select>
            
            {payDateType === 'fecha' && (
              <div className="mt-3">
                <label className="form-label">Seleccionar fecha específica</label>
                <select 
                  className="form-input" 
                  value={customPayDate} 
                  onChange={(e) => handleCustomPayDateChange(e.target.value)}
                >
                  <option value="">Seleccionar una fecha</option>
                  {payDateOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <small className="text-slate-400 block mt-1">
                  {formData.startDate ? 'Viernes de pago más cercano antes de la fecha de salida' : 'Seleccione primero la fecha de salida para autocompletar'}
                </small>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="form-label">Fecha de Salida *</label><input type="date" className="form-input" min={todayFormatted} value={formData.startDate} onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} required /></div>
            <div><label className="form-label">Fecha de Regreso</label><input type="text" className="form-input" value={formData.returnDate} readOnly /></div>
          </div>
          
          <div className="mb-4">
            <label className="form-label">Días a Tomar *</label>
            <input type="number" className="form-input" min="1.2" step="1.2" value={formData.daysToTake} onChange={(e) => setFormData(prev => ({ ...prev, daysToTake: parseFloat(e.target.value) || 0 }))} required />
            <small className="text-slate-400">1 día de vacaciones = 1.2 días laborales</small>
          </div>
          
          <div className="mb-4">
            <label className="form-label">Guardar para Diciembre</label>
            <input type="number" className="form-input" min="0" step="1.2" value={formData.decemberSave} onChange={(e) => setFormData(prev => ({ ...prev, decemberSave: parseFloat(e.target.value) || 0 }))} />
          </div>
          
          {calculationInfo && (
            <div className="mb-4" dangerouslySetInnerHTML={{ __html: calculationInfo }} />
          )}
          
          <div className="mb-4">
            <label className="flex items-center justify-between cursor-pointer p-2">
              <span className="text-slate-300 font-semibold">Autorizadas</span>
              <input type="checkbox" className="hidden" checked={formData.authorized} onChange={(e) => setFormData(prev => ({ ...prev, authorized: e.target.checked }))} />
              <span className={`relative w-11 h-6 rounded-full transition-all duration-300 ${formData.authorized ? 'bg-emerald-500' : 'bg-slate-600'} before:content-[""] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all before:duration-300 ${formData.authorized ? 'before:translate-x-5' : 'before:translate-x-0.5'} before:top-0.5`}></span>
            </label>
          </div>
          
          <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-slate-900/95 py-2">
            <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
            <button type="submit" disabled={loading} className="modern-button">{loading ? 'Guardando...' : 'Guardar Vacaciones'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}