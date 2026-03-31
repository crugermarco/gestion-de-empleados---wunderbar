'use client'

import React, { useState, useEffect } from 'react'
import { googleSheetsService } from '../../services/googleSheetsService'
import { formatDate, formatDateForSheet, isValidSuspensionDay } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'

export const SuspensionModal = ({ isOpen, onClose, candidate, onSuccess }) => {
  const [suspensionDates, setSuspensionDates] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && candidate) {
      createDateInputs(candidate.suggestedDays)
    }
  }, [isOpen, candidate])

  const createDateInputs = (suggestedDays) => {
    const inputs = []
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayLocal = `${year}-${month}-${day}`
    
    for (let i = 0; i < suggestedDays; i++) {
      inputs.push({ id: i, value: '', min: todayLocal })
    }
    setSuspensionDates(inputs)
  }

  const handleDateChange = (index, value) => {
    const newDates = [...suspensionDates]
    newDates[index].value = value
    setSuspensionDates(newDates)
  }

  const generateSuspensionPDF = async (candidate, dates) => {
    try {
      const formattedDates = dates.map(d => formatDateForSheet(d)).join('-')
      const today = new Date()
      const todayFormatted = formatDateForSheet(today)
      
      const suspensionData = {
        'Nombre': candidate.employeeName,
        'NumeroEmpleado': '',
        'FechadeHoy': todayFormatted,
        'Descripciondelasfaltas': `falto injustificadamente el dia ${formatDateForSheet(candidate.firstAbsenceDate)}`,
        'FechaSuspencion': formattedDates
      }
      
      const result = await googleSheetsService.addSuspensionForm(suspensionData)
      
      if (result.error) {
        throw new Error('Error al guardar en formato de suspensión')
      }
      
      setTimeout(() => {
        const spreadsheetId = import.meta.env.VITE_SUSPENSION_SPREADSHEET_ID
        const pdfUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=0`
        window.open(pdfUrl, '_blank')
      }, 2000)
      
      return true
    } catch (error) {
      showNotification('Error al generar PDF: ' + error.message, 'error')
      return false
    }
  }

  const updateSuspensionConcentrado = async (candidate, suspensionDates) => {
    try {
      const applicationDate = formatDateForSheet(new Date())
      let updatedCount = 0
      
      for (const absence of candidate.absencesData) {
        const absenceDateFormatted = formatDateForSheet(absence.FECHA)
        
        const updateData = {
          'FECHA': absenceDateFormatted,
          'NOMBRE': candidate.employeeName,
          'MOTIVO': absence.MOTIVO || 'Falta injustificada',
          'STATUS': 'REALIZADA',
          'FECHA DE APLICACION': applicationDate
        }
        
        const updateResult = await googleSheetsService.updateSuspension(updateData)
        
        if (updateResult.updated) {
          updatedCount++
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      if (updatedCount === 0) {
        throw new Error('No se pudo actualizar ningún registro en el concentrado')
      }
      
      return { success: true, updatedCount }
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const dates = suspensionDates.map(d => d.value)
    
    // Validar que todas las fechas estén completas
    for (const date of dates) {
      if (!date) {
        showNotification('Por favor complete todas las fechas de suspensión', 'error')
        return
      }
      if (!isValidSuspensionDay(date)) {
        const dateObj = new Date(date)
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        const dayName = dayNames[dateObj.getDay()]
        showNotification(`La fecha ${date} (${dayName}) debe ser día laboral (lunes a viernes)`, 'error')
        return
      }
    }
    
    setLoading(true)
    
    try {
      // Generar PDF
      const pdfGenerated = await generateSuspensionPDF(candidate, dates)
      
      if (!pdfGenerated) {
        throw new Error('Error al generar PDF')
      }
      
      // Actualizar concentrado de suspensiones
      await updateSuspensionConcentrado(candidate, dates)
      
      showNotification('Suspensión aplicada exitosamente', 'success')
      onSuccess()
      onClose()
      
    } catch (error) {
      showNotification('Error al aplicar la suspensión: ' + error.message, 'error')
    }
    
    setLoading(false)
  }

  if (!isOpen || !candidate) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-6 max-w-[500px] w-full max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/95 py-2">
          <h3 className="text-xl font-bold text-white">Aplicar Suspensión</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Nombre del Empleado</label>
            <input type="text" className="form-input" value={candidate.employeeName} readOnly />
          </div>
          
          <div className="mb-4">
            <label className="form-label">Días de Suspensión Sugeridos</label>
            <input type="text" className="form-input" value={candidate.suggestedDays} readOnly />
          </div>
          
          <div className="mb-4">
            <h4 className="text-slate-300 font-semibold mb-4">
              Fechas de Aplicación de Suspensión ({candidate.suggestedDays} día(s)) - Lunes a Viernes
            </h4>
            {suspensionDates.map((date, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <label className="text-slate-300 font-semibold min-w-[60px]">Día {idx + 1}:</label>
                <input
                  type="date"
                  className="form-input flex-1"
                  value={date.value}
                  min={date.min}
                  onChange={(e) => handleDateChange(idx, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
          
          <div className="mb-4">
            <label className="form-label">Descripción de Faltas</label>
            <textarea
              className="form-input"
              rows="3"
              value={`falto injustificadamente el dia ${formatDate(candidate.firstAbsenceDate)}`}
              readOnly
            />
          </div>
          
          <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-slate-900/95 py-2">
            <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
            <button type="submit" disabled={loading} className="modern-button">
              {loading ? 'Procesando...' : 'Generar PDF de Suspensión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}