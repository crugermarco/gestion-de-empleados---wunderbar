'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { attendanceSupabaseService } from '../../services/attendanceSupabaseService'
import { formatDate, getMonthNumber, isMondayOrFriday } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'
import { AttendanceModal } from './AttendanceModal'
import { MissingEmployeesTable } from './MissingEmployeesTable'
import { AttendanceEditModal } from './AttendanceEditModal'

export const AttendanceSection = () => {
  const { canEdit } = useAuth()
  const [attendanceData, setAttendanceData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState(null)
  const [filters, setFilters] = useState({ date: '', name: '', subject: '', points: '' })

  useEffect(() => {
    loadAttendanceData()
  }, [])

  const loadAttendanceData = async () => {
    setLoading(true)
    const result = await attendanceSupabaseService.getAll()
    if (!result.error && result.data) {
      setAttendanceData(result.data)
      setFilteredData(result.data)
    } else {
      showNotification('Error al cargar datos de asistencia', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (attendanceData.length === 0) return
    
    let filtered = [...attendanceData]
    
    if (filters.date) {
      const filterDate = filters.date.toLowerCase()
      const monthNumber = getMonthNumber(filterDate)
      
      if (monthNumber) {
        filtered = filtered.filter(item => {
          const itemDate = formatDate(item.FECHA)
          const [itemMonth] = itemDate.split('/')
          return itemMonth === monthNumber
        })
      } else {
        filtered = filtered.filter(item => {
          const itemDate = formatDate(item.FECHA)
          return itemDate.toLowerCase().includes(filterDate)
        })
      }
    }
    
    if (filters.name) {
      filtered = filtered.filter(item => 
        (item.NOMBRE || '').toLowerCase().includes(filters.name.toLowerCase())
      )
    }
    
    if (filters.subject) {
      filtered = filtered.filter(item => 
        (item.MOTIVO || '').toLowerCase().includes(filters.subject.toLowerCase())
      )
    }
    
    if (filters.points) {
      filtered = filtered.filter(item => 
        (item.PUNTOS || '').toString().includes(filters.points)
      )
    }
    
    setFilteredData(filtered)
  }, [attendanceData, filters.date, filters.name, filters.subject, filters.points])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      showNotification('No hay datos para exportar', 'error')
      return
    }

    let csvContent = "Fecha,Nombre del Empleado,Asunto,Puntos\n"
    
    filteredData.forEach(item => {
      const row = [
        `"${formatDate(item.FECHA)}"`,
        `"${item.NOMBRE || ''}"`,
        `"${item.MOTIVO || ''}"`,
        `"${item.PUNTOS || '0'}"`
      ].join(',')
      csvContent += row + '\n'
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const today = new Date()
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`
    
    link.setAttribute('href', url)
    link.setAttribute('download', `asistencias_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showNotification('Datos exportados exitosamente', 'success')
  }

  const handleDelete = async (id, nombre, fecha) => {
    if (confirm(`¿Estás seguro de eliminar el registro de ${nombre} del ${fecha}?`)) {
      const result = await attendanceSupabaseService.delete(id)
      if (!result.error) {
        // Recargar todos los datos para asegurar consistencia
        await loadAttendanceData()
        showNotification('Registro eliminado exitosamente', 'success')
      } else {
        showNotification('Error al eliminar', 'error')
      }
    }
  }
  
  const handleUpdate = async (id, updatedData) => {
    const result = await attendanceSupabaseService.update(id, updatedData)
    if (!result.error) {
      // Recargar todos los datos para asegurar consistencia
      await loadAttendanceData()
      showNotification('Registro actualizado exitosamente', 'success')
      setIsEditModalOpen(false)
      setEditingAttendance(null)
    } else {
      showNotification('Error al actualizar', 'error')
    }
  }

  const hasActiveFilters = Object.values(filters).some(v => v)
  let displayData = filteredData
  
  if (!hasActiveFilters && filteredData.length > 25) {
    displayData = filteredData.slice(0, 25)
  }

  return (
    <div>
      <div className="glassmorphism-table">
        <div className="flex justify-between items-center p-6 border-b border-slate-600/30">
          <h3 className="text-xl font-bold text-white">Registro de Asistencias</h3>
          <div className="flex gap-3">
            <button onClick={exportToExcel} className="modern-button bg-gradient-to-r from-purple-600 to-purple-500">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </button>
            <button onClick={() => setIsModalOpen(true)} className="modern-button">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Generar Reporte
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-6 bg-slate-800/30 border-b border-slate-600/30">
          <input type="text" placeholder="Filtrar por mes..." className="filter-input" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} />
          <input type="text" placeholder="Filtrar por nombre..." className="filter-input" value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} />
          <input type="text" placeholder="Filtrar por asunto..." className="filter-input" value={filters.subject} onChange={(e) => handleFilterChange('subject', e.target.value)} />
          <input type="text" placeholder="Filtrar por puntos..." className="filter-input" value={filters.points} onChange={(e) => handleFilterChange('points', e.target.value)} />
        </div>
        
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-800/90">
              <tr>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Fecha</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Nombre</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Asunto</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Puntos</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Cargando datos...</td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No hay datos disponibles</td>
                </tr>
              ) : (
                displayData.map((item, idx) => {
                  const isBlinkingDate = isMondayOrFriday(item.FECHA)
                  const isBlinkingSubject = (item.MOTIVO || '').toLowerCase() === 'falta injustificada'
                  
                  return (
                    <tr key={idx} className={`border-b border-slate-600/30 hover:bg-slate-800/50 ${isBlinkingSubject ? 'blinking-row-red' : ''}`}>
                      <td className={`p-4 ${isBlinkingDate ? 'blinking-red-border' : ''}`}>
                        {formatDate(item.FECHA)}
                      </td>
                      <td className="p-4">{item.NOMBRE || ''}</td>
                      <td className="p-4">
                        <span className="status-badge">{item.MOTIVO || ''}</span>
                      </td>
                      <td className="p-4">{item.PUNTOS || '0'}</td>
                      <td className="p-4">
                        {canEdit() && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setEditingAttendance(item); setIsEditModalOpen(true) }} 
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id, item.NOMBRE, item.FECHA)} 
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MissingEmployeesTable attendanceData={attendanceData} />
      
      <AttendanceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadAttendanceData} 
      />
      
      <AttendanceEditModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingAttendance(null) }}
        attendance={editingAttendance}
        onUpdate={handleUpdate}
      />
    </div>
  )
}