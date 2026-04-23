'use client'

import React, { useState, useEffect } from 'react'
import { googleSheetsService } from '../../services/googleSheetsService'
import { suspensionSupabaseService } from '../../services/suspensionSupabaseService'
import { formatDate, formatDateForSheet, isValidSuspensionDay } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'

export const SuspensionModal = ({ isOpen, onClose, candidate, onSuccess }) => {
  const [suspensionDates, setSuspensionDates] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && candidate) {
      createDateInputs(candidate.suggesteddays || 1)
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

  const generateSuspensionPDF = async (candidate, dates, faltaFecha) => {
    try {
      const formattedDates = dates.map(d => formatDateForSheet(d)).join('-')
      const today = new Date()
      const todayFormatted = formatDateForSheet(today)
      
      const suspensionData = {
        'Nombre': candidate.employeename,
        'NumeroEmpleado': '',
        'FechadeHoy': todayFormatted,
        'Descripciondelasfaltas': `falto injustificadamente el dia ${formatDateForSheet(faltaFecha)}`,
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
      const faltaFecha = candidate.firstabsencedate
      const faltaMotivo = 'Falta injustificada'
      
      // Convertir las fechas seleccionadas de YYYY-MM-DD a MM/DD/YYYY
      const fechasConvertidas = dates.map(date => {
        const [year, month, day] = date.split('-')
        return `${month}/${day}/${year}`
      })
      
      // La primera fecha también en formato MM/DD/YYYY
      const primeraFechaConvertida = fechasConvertidas[0]
      const fechasSuspensionStr = fechasConvertidas.join(',')
      
      console.log('Fechas originales (YYYY-MM-DD):', dates)
      console.log('Fechas convertidas (MM/DD/YYYY):', fechasConvertidas)
      
      const tipoSuspension = candidate.es_lunes_viernes ? 'AUTOMATICA' : 'ACUMULACION'
      
      // Generar PDF con las fechas en formato original
      const pdfGenerated = await generateSuspensionPDF(candidate, dates, faltaFecha)
      
      if (!pdfGenerated) {
        throw new Error('Error al generar PDF')
      }
      
      // Registrar en Supabase
      const result = await suspensionSupabaseService.aplicarSuspension(
        candidate.employeename,
        faltaFecha,
        faltaMotivo,
        fechasSuspensionStr,
        candidate.suggesteddays,
        tipoSuspension,
        1,
        candidate.mondayfridaycount || 0,
        primeraFechaConvertida
      )
      
      if (result.error) {
        throw new Error('Error al registrar la suspensión')
      }
      
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
      <div className="shimmer-modal max-w-[500px] w-full max-h-[85vh]">
      <div className="shimmer-modal-scroll">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/95 py-2">
          <h3 className="text-xl font-bold text-white">Aplicar Suspensión</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Nombre del Empleado</label>
            <input type="text" className="form-input" value={candidate.employeename || ''} readOnly />
          </div>
          
          <div className="mb-4">
            <label className="form-label">Fecha de la Falta</label>
            <input type="text" className="form-input" value={candidate.firstabsencedate || ''} readOnly />
          </div>
          
          <div className="mb-4">
            <label className="form-label">Días de Suspensión Sugeridos</label>
            <input type="text" className="form-input" value={candidate.suggesteddays || 1} readOnly />
          </div>
          
          <div className="mb-4">
            <h4 className="text-slate-300 font-semibold mb-4">
              Fechas de Suspensión ({candidate.suggesteddays || 1} día(s)) - Lunes a Viernes
            </h4>
            <p className="text-slate-400 text-sm mb-3">
              Estas fechas serán registradas en el sistema como días de suspensión
            </p>
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
              value={`falto injustificadamente el dia ${formatDate(candidate.firstabsencedate)}`}
              readOnly
            />
          </div>
          
          <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-slate-900/95 py-2">
            <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
            <button type="submit" disabled={loading} className="modern-button">
              {loading ? 'Procesando...' : 'Aplicar Suspensión'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}