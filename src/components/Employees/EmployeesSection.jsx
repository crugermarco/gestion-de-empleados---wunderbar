import React, { useState, useEffect } from 'react'
import { employeesSupabaseService } from '../../services/employeesSupabaseService'
import { formatDate } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'
import { EmployeeModal } from './EmployeeModal'
import { EmployeeCard } from './EmployeeCard'
import { useAuth } from '../../contexts/AuthContext'

export const EmployeesSection = () => {
  const { canEdit } = useAuth()
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [viewingEmployee, setViewingEmployee] = useState(null)
  const [filters, setFilters] = useState({ nombre: '', numero: '', area: '' })

  useEffect(() => { loadEmployees() }, [])

  const loadEmployees = async () => {
    setLoading(true)
    const result = await employeesSupabaseService.getAll()
    if (!result.error && result.data) {
      setEmployees(result.data)
      setFilteredEmployees(result.data)
    } else showNotification('Error al cargar datos de empleados', 'error')
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...employees]
    if (filters.nombre) filtered = filtered.filter(emp => (emp.NOMBRE || '').toLowerCase().includes(filters.nombre.toLowerCase()))
    if (filters.numero) filtered = filtered.filter(emp => (emp['NUMERO DE EMPLEADO'] || '').toString().toLowerCase().includes(filters.numero.toLowerCase()))
    if (filters.area) filtered = filtered.filter(emp => (emp.AREA || '').toLowerCase().includes(filters.area.toLowerCase()))
    setFilteredEmployees(filtered)
  }

  useEffect(() => { applyFilters() }, [filters, employees])

  const handleDelete = async (employee, index) => {
    if (confirm(`¿Eliminar a ${employee.NOMBRE}?`)) {
      const result = await employeesSupabaseService.remove(employee['NUMERO DE EMPLEADO'])
      if (!result.error) {
        employees.splice(index, 1)
        setEmployees([...employees])
        showNotification('Empleado eliminado', 'success')
      } else showNotification('Error al eliminar', 'error')
    }
  }

  const isImageUrl = (url) => url && (url.includes('http') || url.includes('https') || url.includes('.jpg') || url.includes('.png') || url.includes('drive.google.com'))

  return (
    <div>
      <div className="glassmorphism-table">
        <div className="flex justify-between items-center p-6 border-b border-slate-600/30 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-white">Base de Datos de Empleados</h3>
          {canEdit() && <button onClick={() => { setEditingEmployee(null); setIsModalOpen(true) }} className="modern-button">+ Agregar Empleado</button>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-slate-800/30 border-b border-slate-600/30">
          <input type="text" placeholder="Filtrar por nombre..." className="filter-input" value={filters.nombre} onChange={(e) => setFilters(prev => ({ ...prev, nombre: e.target.value }))} />
          <input type="text" placeholder="Filtrar por número..." className="filter-input" value={filters.numero} onChange={(e) => setFilters(prev => ({ ...prev, numero: e.target.value }))} />
          <input type="text" placeholder="Filtrar por área..." className="filter-input" value={filters.area} onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))} />
        </div>
        
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-800/90">
              <tr>
                <th className="p-3 text-left text-slate-300 font-semibold text-xs uppercase">NOMBRE</th>
                <th className="p-3 text-left text-slate-300 font-semibold text-xs uppercase">GAFETE</th>
                <th className="p-3 text-left text-slate-300 font-semibold text-xs uppercase">FECHA INGRESO</th>
                <th className="p-3 text-left text-slate-300 font-semibold text-xs uppercase"># EMPLEADO</th>
                <th className="p-3 text-left text-slate-300 font-semibold text-xs uppercase">AREA</th>
                <th className="p-3 text-left text-slate-300 font-semibold text-xs uppercase">AÑOS</th>
                <th className="p-3 text-left text-slate-300 font-semibold text-xs uppercase">DÍAS VAC</th>
                <th className="p-3 text-left text-slate-300 font-semibold text-xs uppercase">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="8" className="p-8 text-center text-slate-400">Cargando datos...</td></tr> : filteredEmployees.length === 0 ? <tr><td colSpan="8" className="p-8 text-center text-slate-400">No hay empleados registrados</td></tr> : filteredEmployees.map((emp, idx) => (
                <tr key={idx} className="border-b border-slate-600/30 hover:bg-slate-800/50">
                  <td className="p-3">{emp.NOMBRE || ''}</td>
                  <td className="p-3">
                    {isImageUrl(emp.GAFETE) ? (
                      <img
                        src={emp.GAFETE}
                        alt="Gafete"
                        className="max-w-[50px] max-h-[50px] rounded object-cover cursor-pointer hover:scale-105"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onClick={() => setViewingEmployee(emp)}
                      />
                    ) : (emp.GAFETE || '-')}
                  </td>
                  <td className="p-3">{formatDate(emp['FECHA DE INGRESO'])}</td>
                  <td className="p-3">{emp['NUMERO DE EMPLEADO'] || ''}</td>
                  <td className="p-3">{emp.AREA || ''}</td>
                  <td className="p-3">{emp.AÑOS || ''}</td>
                  <td className="p-3">{emp['DIAS DE VACACIONES'] || '0'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => setViewingEmployee(emp)} className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Ver</button>
                      {canEdit() && <button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true) }} className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Editar</button>}
                      {canEdit() && <button onClick={() => handleDelete(emp, employees.indexOf(emp))} className="bg-red-600 text-white text-xs px-2 py-1 rounded">Eliminar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingEmployee(null) }} onSuccess={loadEmployees} employee={editingEmployee} />
      <EmployeeCard isOpen={!!viewingEmployee} onClose={() => setViewingEmployee(null)} employee={viewingEmployee} onEdit={() => { setEditingEmployee(viewingEmployee); setViewingEmployee(null); setIsModalOpen(true) }} />
    </div>
  )
}