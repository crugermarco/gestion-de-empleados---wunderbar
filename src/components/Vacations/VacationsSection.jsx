import React, { useState, useEffect } from 'react'
import { googleSheetsService } from '../../services/googleSheetsService'
import { formatDate } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'
import { VacationScheduleModal } from './VacationScheduleModal'
import { generateVacationPDFDirect } from '../../utils/pdfGenerator'

export const VacationsSection = () => {
  const [vacationData, setVacationData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [filters, setFilters] = useState({ nombre: '', area: '', diciembre: '' })

  useEffect(() => {
    loadVacationData()
  }, [])

  const loadVacationData = async () => {
    setLoading(true)
    const result = await googleSheetsService.getVacations()
    if (!result.error && result.data) {
      setVacationData(result.data)
      setFilteredData(result.data)
    } else {
      showNotification('Error al cargar datos de vacaciones', 'error')
    }
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...vacationData]
    if (filters.nombre) {
      filtered = filtered.filter(item => (item.NOMBRE || '').toLowerCase().includes(filters.nombre.toLowerCase()))
    }
    if (filters.area) {
      filtered = filtered.filter(item => (item['ÁREA'] || '').toLowerCase().includes(filters.area.toLowerCase()))
    }
    if (filters.diciembre) {
      filtered = filtered.filter(item => (item['GUARDAR DICIEMBRE'] || '').toString().toLowerCase().includes(filters.diciembre.toLowerCase()))
    }
    setFilteredData(filtered)
  }

  useEffect(() => { applyFilters() }, [filters, vacationData])

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      showNotification('No hay datos para exportar', 'error')
      return
    }

    let csvContent = "NOMBRE,FECHA DE INGRESO,NUMERO DE EMPLEADO,ÁREA,DÍAS VACACIONES,FECHA DE PAGO,FECHA SALIDA,FECHA REGRESO,AUTORIZADAS,DÍAS TOMADOS,GUARDAR DICIEMBRE\n"
    
    filteredData.forEach(item => {
      const row = [
        `"${item.NOMBRE || ''}"`,
        `"${formatDate(item['FECHA DE INGRESO']) || ''}"`,
        `"${item['NUMERO DE EMPLEADO'] || ''}"`,
        `"${item['ÁREA'] || ''}"`,
        `"${item['DÍAS VACACIONES'] || '0'}"`,
        `"${item['FECHA DE PAGO'] || ''}"`,
        `"${formatDate(item['FECHA SALIDA']) || ''}"`,
        `"${formatDate(item['FECHA REGRESO']) || ''}"`,
        `"${item['AUTORIZADAS'] ? 'TRUE' : 'FALSE'}"`,
        `"${item['DÍAS TOMADOS'] || '0'}"`,
        `"${item['GUARDAR DICIEMBRE'] || '0'}"`
      ].join(',')
      csvContent += row + '\n'
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const today = new Date()
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`
    
    link.setAttribute('href', url)
    link.setAttribute('download', `vacaciones_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showNotification('Datos exportados exitosamente', 'success')
  }

  const handleToggleAuthorization = async (index, isAuthorized) => {
    const record = vacationData[index]
    const updateData = {
      action: 'update',
      original: { 
        NOMBRE: record.NOMBRE, 
        'NUMERO DE EMPLEADO': record['NUMERO DE EMPLEADO'], 
        'FECHA SALIDA': record['FECHA SALIDA'] 
      },
      updated: { 'AUTORIZADAS': isAuthorized ? 'TRUE' : 'FALSE' }
    }
    const result = await googleSheetsService.updateVacation(updateData.original, updateData.updated)
    if (!result.error) {
      vacationData[index]['AUTORIZADAS'] = isAuthorized
      setVacationData([...vacationData])
      applyFilters()
      showNotification(`Vacación ${isAuthorized ? 'autorizada' : 'desautorizada'} exitosamente`, 'success')
    }
  }

  const handleDelete = async (index) => {
    const record = vacationData[index]
    if (confirm(`¿Estás seguro de eliminar las vacaciones de ${record.NOMBRE} (${record['FECHA SALIDA']} - ${record['FECHA REGRESO']})?`)) {
      const result = await googleSheetsService.deleteVacation({ 
        NOMBRE: record.NOMBRE, 
        'FECHA SALIDA': record['FECHA SALIDA'], 
        'NUMERO DE EMPLEADO': record['NUMERO DE EMPLEADO'] 
      })
      if (!result.error) {
        vacationData.splice(index, 1)
        setVacationData([...vacationData])
        applyFilters()
        showNotification('Registro de vacaciones eliminado exitosamente', 'success')
      }
    }
  }

  const printVacationPDF = async (index) => {
    const record = vacationData[index]
    
    const formatDateForPDF = (dateValue) => {
      if (!dateValue) return ''
      try {
        if (typeof dateValue === 'string' && dateValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          const [part1, part2, year] = dateValue.split('/').map(Number)
          if (part1 > 12 && part2 <= 12) {
            return `${part2.toString().padStart(2, '0')}/${part1.toString().padStart(2, '0')}/${year}`
          }
          return `${part1.toString().padStart(2, '0')}/${part2.toString().padStart(2, '0')}/${year}`
        }
        const date = new Date(dateValue)
        if (!isNaN(date.getTime())) {
          const month = (date.getMonth() + 1).toString().padStart(2, '0')
          const day = date.getDate().toString().padStart(2, '0')
          const year = date.getFullYear()
          return `${month}/${day}/${year}`
        }
      } catch (error) {}
      return dateValue
    }
    
    const nombre = record.NOMBRE || ''
    const numeroEmpleado = record['NUMERO DE EMPLEADO'] || ''
    const fechaIngreso = formatDateForPDF(record['FECHA DE INGRESO'])
    const fechaPago = formatDateForPDF(record['FECHA DE PAGO'])
    const fechaSalida = formatDateForPDF(record['FECHA SALIDA'])
    const fechaRegreso = formatDateForPDF(record['FECHA REGRESO'])
    const diasTomados = record['DÍAS TOMADOS'] || '0'
    const diasVacaciones = record['DÍAS VACACIONES'] || '0'
    
    if (!nombre) {
      showNotification('Error: No se pudo obtener el nombre del empleado', 'error')
      return
    }
    
    showNotification(`Generando formato para ${nombre}...`, 'success')
    
    const pdfData = {
      nombre: nombre,
      numeroEmpleado: numeroEmpleado,
      fechaIngreso: fechaIngreso,
      fechaPago: fechaPago,
      fechaSalida: fechaSalida,
      fechaRegreso: fechaRegreso,
      diasTomados: diasTomados,
      diasVacaciones: diasVacaciones,
      comentarios: ''
    }
    
    const result = await generateVacationPDFDirect(pdfData)
    
    if (result.success) {
      showNotification('PDF generado exitosamente', 'success')
    } else {
      showNotification(`Error al generar PDF: ${result.error}`, 'error')
    }
  }

  const canEdit = () => {
    const user = JSON.parse(localStorage.getItem('userSession') || '{}')
    return user.USUARIO?.toLowerCase() === 'marco cruger'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div>
      <div className="glassmorphism-table">
        <div className="flex justify-between items-center p-6 border-b border-slate-600/30 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-white">CONCENTRADO DE VACACIONES</h3>
          <div className="flex gap-3">
            <button onClick={exportToExcel} className="modern-button bg-gradient-to-r from-purple-600 to-purple-500">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </button>
            <button onClick={() => setIsScheduleModalOpen(true)} className="modern-button">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              + AGENDAR VACACIONES
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-slate-800/30 border-b border-slate-600/30">
          <input 
            type="text" 
            placeholder="Filtrar por nombre..." 
            className="filter-input" 
            value={filters.nombre} 
            onChange={(e) => setFilters(prev => ({ ...prev, nombre: e.target.value }))} 
          />
          <input 
            type="text" 
            placeholder="Filtrar por área..." 
            className="filter-input" 
            value={filters.area} 
            onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))} 
          />
          <input 
            type="text" 
            placeholder="Filtrar por guardar diciembre..." 
            className="filter-input" 
            value={filters.diciembre} 
            onChange={(e) => setFilters(prev => ({ ...prev, diciembre: e.target.value }))} 
          />
        </div>
        
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-800/90">
              <tr>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">NOMBRE</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">FECHA INGRESO</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase"># EMPLEADO</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">ÁREA</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">DÍAS VAC</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">FECHA PAGO</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">FECHA SALIDA</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">FECHA REGRESO</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">AUTORIZADAS</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">DÍAS TOMADOS</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">GUARDAR DIC</th>
                <th className="p-3 text-left text-slate-300 text-xs uppercase">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="p-8 text-center text-slate-400">Cargando datos...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="12" className="p-8 text-center text-slate-400">No hay datos disponibles</td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  const fechaSalida = formatDate(item['FECHA SALIDA'])
                  const autorizadas = item['AUTORIZADAS'] === true || item['AUTORIZADAS'] === 'TRUE'
                  
                  let rowClass = ''
                  let daysRemaining = null
                  
                  // Parpadeo verde si está autorizada
                  if (autorizadas) {
                    rowClass = 'blinking-row-green'
                  }
                  
                  // Calcular días restantes para la fecha de salida
                  if (fechaSalida) {
                    try {
                      const [month, day, year] = fechaSalida.split('/').map(Number)
                      const startDate = new Date(year, month - 1, day)
                      const diffTime = startDate - today
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      daysRemaining = diffDays
                      
                      // Parpadeo rojo/amarillo según días restantes (solo si NO está autorizada)
                      if (!autorizadas) {
                        if (diffDays >= 0 && diffDays <= 15) {
                          rowClass = 'blinking-row-red'
                        } else if (diffDays > 15 && diffDays <= 30) {
                          rowClass = 'blinking-row-yellow'
                        }
                      }
                    } catch (e) {}
                  }
                  
                  return (
                    <tr key={idx} className={`border-b border-slate-600/30 ${rowClass}`}>
                      <td className="p-3">{item.NOMBRE || ''}</td>
                      <td className="p-3">{formatDate(item['FECHA DE INGRESO'])}</td>
                      <td className="p-3">{item['NUMERO DE EMPLEADO'] || ''}</td>
                      <td className="p-3">{item['ÁREA'] || ''}</td>
                      <td className="p-3">{item['DÍAS VACACIONES'] || '0'}</td>
                      <td className="p-3">{item['FECHA DE PAGO'] || ''}</td>
                      <td className="p-3">
                        {fechaSalida}
                        {daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 30 && !autorizadas && (
                          <span className="ml-2 text-xs text-yellow-400">({daysRemaining} días)</span>
                        )}
                      </td>
                      <td className="p-3">{formatDate(item['FECHA REGRESO'])}</td>
                      <td className="p-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={autorizadas} 
                            onChange={(e) => handleToggleAuthorization(vacationData.indexOf(item), e.target.checked)} 
                            disabled={!canEdit()} 
                          />
                          <span className={`relative w-11 h-6 rounded-full transition-all duration-300 ${autorizadas ? 'bg-emerald-500' : 'bg-slate-600'} before:content-[""] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all before:duration-300 ${autorizadas ? 'before:translate-x-5' : 'before:translate-x-0.5'} before:top-0.5`}></span>
                        </label>
                      </td>
                      <td className="p-3">{item['DÍAS TOMADOS'] || '0'}</td>
                      <td className="p-3">{item['GUARDAR DICIEMBRE'] || '0'}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {/* Botón Imprimir - visible para TODOS */}
                          <button 
                            onClick={() => printVacationPDF(vacationData.indexOf(item))} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir
                          </button>
                          {/* Botón Eliminar - SOLO para Marco Cruger */}
                          {canEdit() && (
                            <button 
                              onClick={() => handleDelete(vacationData.indexOf(item))} 
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VacationScheduleModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        onSuccess={loadVacationData} 
      />
    </div>
  )
}