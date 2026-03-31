import React, { useState, useEffect } from 'react'
import { googleSheetsService } from '../../services/googleSheetsService'
import { showNotification } from '../UI/NotificationContainer'

export const RotationSection = () => {
  const [rotationData, setRotationData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ fecha: '', nombre: '', id: '', operacion: '' })

  useEffect(() => { loadRotationData() }, [])

  const loadRotationData = async () => {
    setLoading(true)
    const result = await googleSheetsService.getRotation()
    if (!result.error && result.data) {
      setRotationData(result.data)
      setFilteredData(result.data)
    } else showNotification('Error al cargar datos de rotación', 'error')
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...rotationData]
    if (filters.fecha) filtered = filtered.filter(item => (item.FECHA || '').toString().toLowerCase().includes(filters.fecha.toLowerCase()))
    if (filters.nombre) filtered = filtered.filter(item => (item['NOMBRE DEL PERSONAL'] || '').toLowerCase().includes(filters.nombre.toLowerCase()))
    if (filters.id) filtered = filtered.filter(item => (item['ID #'] || '').toString().toLowerCase().includes(filters.id.toLowerCase()))
    if (filters.operacion) filtered = filtered.filter(item => (item['OPERACION REALIZADA'] || '').toLowerCase().includes(filters.operacion.toLowerCase()))
    setFilteredData(filtered)
  }

  useEffect(() => { applyFilters() }, [filters, rotationData])

  const hasActiveFilters = Object.values(filters).some(v => v)
  let displayData = filteredData
  if (!hasActiveFilters) displayData = filteredData.slice(-100)

  return (
    <div>
      <div className="glassmorphism-table">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-800/30 border-b border-slate-600/30">
          <div><label className="text-xs font-semibold text-slate-400 uppercase block mb-1">FECHA</label><input type="text" placeholder="Buscar por fecha..." className="filter-input w-full" value={filters.fecha} onChange={(e) => setFilters(prev => ({ ...prev, fecha: e.target.value }))} /></div>
          <div><label className="text-xs font-semibold text-slate-400 uppercase block mb-1">NOMBRE</label><input type="text" placeholder="Buscar por nombre..." className="filter-input w-full" value={filters.nombre} onChange={(e) => setFilters(prev => ({ ...prev, nombre: e.target.value }))} /></div>
          <div><label className="text-xs font-semibold text-slate-400 uppercase block mb-1">ID#</label><input type="text" placeholder="Buscar por ID..." className="filter-input w-full" value={filters.id} onChange={(e) => setFilters(prev => ({ ...prev, id: e.target.value }))} /></div>
          <div><label className="text-xs font-semibold text-slate-400 uppercase block mb-1">OPERACIÓN</label><input type="text" placeholder="Buscar por operación..." className="filter-input w-full" value={filters.operacion} onChange={(e) => setFilters(prev => ({ ...prev, operacion: e.target.value }))} /></div>
        </div>
        
        <div className="flex justify-between items-center p-6 border-b border-slate-600/30">
          <h3 className="text-xl font-bold text-white">Registros de Rotación <span className="bg-slate-600/50 text-white px-2 py-1 rounded-lg text-sm ml-2">{filteredData.length}</span></h3>
          <button onClick={loadRotationData} className="modern-button">Actualizar</button>
        </div>
        
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-800/90">
              <tr>
                <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">FECHA</th>
                <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">NOMBRE DEL PERSONAL</th>
                <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">ID #</th>
                <th className="p-4 text-left text-slate-300 font-semibold text-sm uppercase">OPERACION REALIZADA</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="4" className="p-8 text-center text-slate-400">Cargando datos...</td></tr> : displayData.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-slate-400">No hay datos de rotación disponibles</td></tr> : displayData.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-600/30 hover:bg-slate-800/50">
                  <td className="p-4">{item.FECHA || ''}</td>
                  <td className="p-4">{item['NOMBRE DEL PERSONAL'] || ''}</td>
                  <td className="p-4">{item['ID #'] || ''}</td>
                  <td className="p-4">{item['OPERACION REALIZADA'] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}