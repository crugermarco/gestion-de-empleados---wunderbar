'use client'

import React, { useState, useEffect } from 'react'
import { googleSheetsService } from '../../services/googleSheetsService'
import { suspensionSupabaseService } from '../../services/suspensionSupabaseService'
import { formatDate } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'
import { SuspensionModal } from './SuspensionModal'
import { AppliedSuspensionsTable } from './AppliedSuspensionsTable'
import { DismissalCandidatesTable } from './DismissalCandidatesTable'
import { useAuth } from '../../contexts/AuthContext'

export const SuspensionsSection = () => {
  const { isAuthorizedUser } = useAuth()
  const [suspensionCandidates, setSuspensionCandidates] = useState([])
  const [notAppliedSuspensions, setNotAppliedSuspensions] = useState([])
  const [appliedSuspensions, setAppliedSuspensions] = useState([])
  const [dismissalCandidates, setDismissalCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadSuspensionData()
    const interval = setInterval(() => {
      loadSuspensionData()
    }, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadSuspensionData = async () => {
    setLoading(true)
    
    try {
      // Obtener candidatos a suspensión desde Supabase
      const candidatosResult = await suspensionSupabaseService.obtenerCandidatos()
      if (!candidatosResult.error) {
        setSuspensionCandidates(candidatosResult.data || [])
      }
      
      // Obtener candidatos a baja desde Supabase
      const bajasResult = await suspensionSupabaseService.obtenerCandidatosBaja()
      if (!bajasResult.error) {
        setDismissalCandidates(bajasResult.data || [])
      }
      
      // Obtener suspensiones no aplicadas desde Supabase
      const noAplicadasResult = await suspensionSupabaseService.obtenerNoAplicadas()
      if (!noAplicadasResult.error) {
        setNotAppliedSuspensions(noAplicadasResult.data || [])
      }
      
      // Obtener suspensiones aplicadas desde Supabase
      const aplicadasResult = await suspensionSupabaseService.obtenerAplicadas()
      if (!aplicadasResult.error) {
        setAppliedSuspensions(aplicadasResult.data || [])
      }
      
    } catch (error) {
      console.error('Error loading suspension data:', error)
      showNotification('Error al cargar datos de suspensiones', 'error')
    }
    
    setLoading(false)
  }

  const handleRefresh = async () => {
    await loadSuspensionData()
    showNotification('Suspensiones actualizadas', 'success')
  }

  const handleApplySuspension = (candidate) => {
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  // Calcular días restantes para vencimiento
  const getDaysRemaining = (deadline) => {
    if (!deadline) return 0
    const hoy = new Date()
    const deadlineDate = new Date(deadline)
    const diff = Math.ceil((deadlineDate - hoy) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={handleRefresh} className="modern-button">
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Suspensiones Pendientes */}
      <div className="glassmorphism-table mb-8">
        <div className="flex justify-between items-center p-6 border-b border-slate-600/30">
          <h3 className="text-xl font-bold text-white">
            Suspensiones Pendientes
            <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-lg text-sm ml-2">{suspensionCandidates.length}</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-800/90">
              <tr>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Nombre</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Fecha Falta</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Lunes/Viernes</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Días Sugeridos</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Vencimiento</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Estado</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">Cargando datos...</td></tr>
              ) : suspensionCandidates.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No hay candidatos a suspensión pendientes</td></tr>
              ) : (
                suspensionCandidates.map((candidate, idx) => {
                  const daysRemaining = getDaysRemaining(candidate.deadline)
                  return (
                    <tr key={idx} className={`border-b border-slate-600/30 ${daysRemaining <= 3 ? 'blinking-row-red' : 'blinking-row-yellow'}`}>
                      <td className="p-4 font-medium text-white">{candidate.employeename}</td>
                      <td className="p-4">{formatDate(candidate.firstabsencedate)}</td>
                      <td className="p-4">
                        {candidate.mondayfridaycount > 0 ? (
                          <span className="text-red-400 font-semibold">Sí</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="p-4">{candidate.suggesteddays} día(s)</td>
                      <td className="p-4">
                        <span className={daysRemaining <= 3 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                          {daysRemaining} días
                        </span>
                      </td>
                      <td className="p-4"><span className="status-badge status-pendiente">PENDIENTE</span></td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleApplySuspension(candidate)} 
                          className="modern-button text-sm py-1 px-3"
                          disabled={!isAuthorizedUser()}
                        >
                          Aplicar
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspensiones No Aplicadas - Versión simplificada con contador */}
      {notAppliedSuspensions.length > 0 && (
        <div className="glassmorphism-table mb-8">
          <div className="p-6 border-b border-slate-600/30">
            <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              SUSPENSIONES NO APLICADAS
              <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-lg text-sm ml-2">
                {notAppliedSuspensions.reduce((sum, item) => sum + (item.cantidad_no_aplicadas || 1), 0)}
              </span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-800/90">
                <tr>
                  <th className="p-4 text-left text-slate-300 text-sm uppercase">Nombre</th>
                  <th className="p-4 text-left text-slate-300 text-sm uppercase">Suspensiones Vencidas</th>
                  <th className="p-4 text-left text-slate-300 text-sm uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {notAppliedSuspensions.map((suspension, idx) => (
                  <tr key={idx} className="border-b border-slate-600/30 blinking-row-red">
                    <td className="p-4 font-medium text-white">{suspension.employeename}</td>
                    <td className="p-4">{suspension.cantidad_no_aplicadas || 1} suspensión(es)</td>
                    <td className="p-4"><span className="status-badge status-no-aplicada">NO APLICADA</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspensiones Aplicadas */}
      <AppliedSuspensionsTable
       appliedSuspensions={appliedSuspensions}
       onRefresh={loadSuspensionData}
       />

      {/* Candidatos a Baja Automática */}
      <DismissalCandidatesTable dismissalCandidates={dismissalCandidates} />

      {/* Modal de Suspensión */}
      <SuspensionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCandidate(null)
        }} 
        candidate={selectedCandidate} 
        onSuccess={loadSuspensionData} 
      />
    </div>
  )
}