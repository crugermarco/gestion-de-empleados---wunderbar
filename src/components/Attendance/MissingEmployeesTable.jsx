import React, { useState, useEffect, useMemo } from 'react'
import { formatDate } from '../../utils/dateFormatters'

export const MissingEmployeesTable = ({ attendanceData }) => {
  const [filters, setFilters] = useState({ name: '', lastRecord: '', days: '' })

  const missingEmployees = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return []
    
    const missing = []
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    const allEmployees = [...new Set(attendanceData.map(item => item.NOMBRE).filter(Boolean))]
    
    allEmployees.forEach(employee => {
      const employeeRecords = attendanceData
        .filter(item => item.NOMBRE === employee)
        .sort((a, b) => new Date(b.FECHA) - new Date(a.FECHA))
      
      const disqualifyingMotivos = [
        'Permiso - Por Hora', 'Permiso - Por Día', 'Falta injustificada',
        'Vacaciones', 'Suspensión', 'Falta justificada',
        'NO SE ESCANEA O NO CUENTA CON GAFETE', '5hrs', 'Incapacidad',
        'Error de Procceso', 'Retardo'
      ]
      
      const hasDisqualifyingRecord = employeeRecords.some(record => {
        const recordDate = new Date(record.FECHA)
        if (recordDate < ninetyDaysAgo) return false
        return disqualifyingMotivos.includes(record.MOTIVO)
      })
      
      if (employeeRecords.length > 0 && employeeRecords[0].FECHA) {
        const lastRecordDate = new Date(employeeRecords[0].FECHA)
        if (lastRecordDate < ninetyDaysAgo && !hasDisqualifyingRecord) {
          missing.push({
            name: employee,
            lastRecord: formatDate(employeeRecords[0].FECHA),
            days: Math.floor((new Date() - lastRecordDate) / (1000 * 60 * 60 * 24))
          })
        }
      }
    })
    
    return missing
  }, [attendanceData])

  const filteredData = useMemo(() => {
    let filtered = [...missingEmployees]
    if (filters.name) {
      filtered = filtered.filter(emp => emp.name.toLowerCase().includes(filters.name.toLowerCase()))
    }
    if (filters.lastRecord) {
      filtered = filtered.filter(emp => emp.lastRecord.toLowerCase().includes(filters.lastRecord.toLowerCase()))
    }
    if (filters.days) {
      filtered = filtered.filter(emp => emp.days.toString().includes(filters.days))
    }
    return filtered
  }, [missingEmployees, filters.name, filters.lastRecord, filters.days])

  // No mostrar la tabla si no hay empleados con 5hrs disponibles
  if (missingEmployees.length === 0) return null

  return (
    <div className="mt-8">
      <div className="glassmorphism-table">
        <div className="p-6 border-b border-slate-600/30">
          <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            PERSONAL CON 5HRS DISPONIBLES
            <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-lg text-xs ml-2">{missingEmployees.length}</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-slate-800/30 border-b border-slate-600/30">
          <input 
            type="text" 
            placeholder="Filtrar por nombre..." 
            className="filter-input" 
            value={filters.name} 
            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))} 
          />
          <input 
            type="text" 
            placeholder="Filtrar por último registro..." 
            className="filter-input" 
            value={filters.lastRecord} 
            onChange={(e) => setFilters(prev => ({ ...prev, lastRecord: e.target.value }))} 
          />
          <input 
            type="text" 
            placeholder="Filtrar por días..." 
            className="filter-input" 
            value={filters.days} 
            onChange={(e) => setFilters(prev => ({ ...prev, days: e.target.value }))} 
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-800/90">
              <tr>
                <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">Nombre del Empleado</th>
                <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">Último Registro</th>
                <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">Días sin Registro</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-slate-400">No hay empleados con 5hrs disponibles con esos filtros</td></tr>
              ) : (
                filteredData.map((emp, idx) => (
                  <tr key={idx} className="border-b border-slate-600/30 hover:bg-slate-800/50">
                    <td className="p-4">{emp.name}</td>
                    <td className="p-4">{emp.lastRecord}</td>
                    <td className="p-4">
                      {emp.days} días 
                      <span className="ml-2 text-emerald-400 text-xs font-semibold">(5hrs disponibles)</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}