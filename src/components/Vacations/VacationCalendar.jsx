'use client'

import React, { useState, useEffect } from 'react'
import { isNonWorkingDay } from '../../utils/dateFormatters'

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export const VacationCalendar = ({ vacationData, onClose, onSelectDate }) => {
  const [selectedArea, setSelectedArea] = useState('')
  const [areas, setAreas] = useState([])
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [occupiedDates, setOccupiedDates] = useState({})
  const [pendingDates, setPendingDates] = useState({})
  const [loading, setLoading] = useState(true)

  // Obtener áreas únicas
  useEffect(() => {
    const uniqueAreas = [...new Set(vacationData.map(item => item['ÁREA']).filter(Boolean))]
    setAreas(uniqueAreas)
    if (uniqueAreas.length > 0 && !selectedArea) setSelectedArea(uniqueAreas[0])
  }, [vacationData])

  // Función inteligente para parsear fecha (detecta mm/dd/yyyy o dd/mm/yyyy)
  const parseDate = (dateStr) => {
    if (!dateStr) return null
    if (dateStr instanceof Date) return dateStr
    
    if (typeof dateStr === 'string') {
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const first = parseInt(parts[0], 10)
        const second = parseInt(parts[1], 10)
        const year = parseInt(parts[2], 10)
        
        // Si el primer número > 12, es dd/mm/yyyy
        if (first > 12) {
          const day = first
          const month = second - 1
          const date = new Date(year, month, day)
          if (!isNaN(date.getTime()) && date.getMonth() === month && date.getDate() === day) {
            return date
          }
        } else {
          // Intentar como mm/dd/yyyy
          let date = new Date(year, first - 1, second)
          if (!isNaN(date.getTime()) && date.getMonth() === first - 1 && date.getDate() === second) {
            return date
          }
          // Intentar como dd/mm/yyyy
          date = new Date(year, second - 1, first)
          if (!isNaN(date.getTime()) && date.getMonth() === second - 1 && date.getDate() === first) {
            return date
          }
        }
      }
    }
    return null
  }

  // Calcular días ocupados y pendientes (solo para el año seleccionado)
  useEffect(() => {
    if (!selectedArea || !vacationData.length) {
      setOccupiedDates({})
      setPendingDates({})
      setLoading(false)
      return
    }

    setLoading(true)
    const occupied = {}
    const pending = {}

    console.log('📅 Procesando vacaciones para área:', selectedArea)
    console.log('📅 Año seleccionado:', currentYear)

    vacationData.forEach((item) => {
      if (item['ÁREA'] !== selectedArea) return

      const fechaSalida = item['FECHA SALIDA']
      const fechaRegreso = item['FECHA REGRESO']
      const autorizadas = item['AUTORIZADAS'] === true || item['AUTORIZADAS'] === 'TRUE'
      const nombre = item.NOMBRE || ''

      if (fechaSalida && fechaRegreso) {
        const start = parseDate(fechaSalida)
        const end = parseDate(fechaRegreso)
        
        if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn(`⚠️ Fecha inválida: Salida:${fechaSalida} Regreso:${fechaRegreso}`)
          return
        }
        
        // Filtrar solo las fechas que pertenecen al año seleccionado
        if (start.getFullYear() !== currentYear && end.getFullYear() !== currentYear) {
          return
        }
        
        console.log(`📅 ${nombre}: ${fechaSalida} -> ${fechaRegreso} | ${autorizadas ? 'Aprobado' : 'Pendiente'}`)
        
        // Recorrer cada día desde start hasta end
        const current = new Date(start)
        while (current <= end) {
          const year = current.getFullYear()
          const month = String(current.getMonth() + 1).padStart(2, '0')
          const day = String(current.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          
          // Solo guardar fechas del año seleccionado
          if (year === currentYear) {
            if (autorizadas) {
              if (!occupied[dateStr]) {
                occupied[dateStr] = { info: `${nombre} (Aprobado)` }
              }
            } else {
              if (!pending[dateStr]) {
                pending[dateStr] = { info: `${nombre} (Pendiente)` }
              }
            }
          }
          
          current.setDate(current.getDate() + 1)
        }
      }
    })

    console.log('📅 Días ocupados (rojo):', Object.keys(occupied).length)
    console.log('📅 Días pendientes (amarillo):', Object.keys(pending).length)
    
    setOccupiedDates(occupied)
    setPendingDates(pending)
    setLoading(false)
  }, [selectedArea, vacationData, currentYear])

  const isWeekendOrHoliday = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return isNonWorkingDay(dateStr)
  }

  const getDayStatus = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    if (occupiedDates[dateStr]) return { status: 'occupied', info: occupiedDates[dateStr].info }
    if (pendingDates[dateStr]) return { status: 'pending', info: pendingDates[dateStr].info }
    return null
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const changeYear = (delta) => {
    setCurrentYear(currentYear + delta)
  }

  const renderMonth = (monthIndex) => {
    const daysInMonth = getDaysInMonth(currentYear, monthIndex)
    const firstDay = getFirstDayOfMonth(currentYear, monthIndex)
    const days = []
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${monthIndex}-${i}`} className="w-9 h-9"></div>)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isNonWorking = isWeekendOrHoliday(currentYear, monthIndex, day)
      const dayStatus = getDayStatus(currentYear, monthIndex, day)
      
      let bgColor = ''
      let textColor = ''
      let borderClass = ''
      let titleText = ''
      let isSelectable = false
      
      if (isNonWorking) {
        bgColor = 'bg-slate-600/40'
        textColor = 'text-slate-500'
        borderClass = 'border border-slate-500/30'
        titleText = 'Día no laborable'
        isSelectable = false
      } else if (dayStatus?.status === 'occupied') {
        bgColor = 'bg-red-500/50'
        textColor = 'text-white'
        borderClass = 'border border-red-400'
        titleText = dayStatus.info || 'Ocupado'
        isSelectable = false
      } else if (dayStatus?.status === 'pending') {
        bgColor = 'bg-yellow-500/40'
        textColor = 'text-white'
        borderClass = 'border border-yellow-400'
        titleText = dayStatus.info || 'Pendiente'
        isSelectable = false
      } else {
        bgColor = 'bg-emerald-500/20 hover:bg-emerald-500/30'
        textColor = 'text-emerald-300'
        borderClass = 'border border-emerald-500/30'
        titleText = 'Disponible'
        isSelectable = true
      }
      
      days.push(
        <button
          key={`day-${monthIndex}-${day}`}
          onClick={() => isSelectable && onSelectDate && onSelectDate(currentYear, monthIndex, day)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${bgColor} ${textColor} ${borderClass} ${isSelectable ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}`}
          title={titleText}
          disabled={!isSelectable}
        >
          {day}
        </button>
      )
    }
    
    return days
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/95 py-2">
          <h3 className="text-xl font-bold text-white">FECHAS DISPONIBLES POR ÁREA</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="mb-6">
          <label className="form-label">Seleccionar Área</label>
          <select
            className="form-input"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => changeYear(-1)} className="modern-button text-sm py-1 px-3">◀ {currentYear - 1}</button>
          <h2 className="text-2xl font-bold text-white">{currentYear}</h2>
          <button onClick={() => changeYear(1)} className="modern-button text-sm py-1 px-3">{currentYear + 1} ▶</button>
        </div>
        
        {loading ? (
          <div className="text-center py-20 text-slate-400">Cargando calendario...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {meses.map((mes, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-xl p-3 border border-slate-600/30">
                <h4 className="text-center text-white font-semibold mb-2 pb-1 border-b border-slate-600/30 text-sm">{mes}</h4>
                <div className="grid grid-cols-7 gap-0.5 mb-1 text-center">
                  {diasSemana.map(day => <div key={day} className="text-slate-400 text-[10px] font-semibold">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-0.5">{renderMonth(idx)}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-slate-600/30 flex justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30"></div><span className="text-slate-300 text-xs">Disponible</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-yellow-500/40 border border-yellow-400"></div><span className="text-slate-300 text-xs">Pendiente</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-red-500/50 border border-red-400"></div><span className="text-slate-300 text-xs">Ocupado</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-slate-600/40 border border-slate-500/30"></div><span className="text-slate-300 text-xs">No laborable</span></div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="modern-button">Cerrar</button>
        </div>
      </div>
    </div>
  )
}