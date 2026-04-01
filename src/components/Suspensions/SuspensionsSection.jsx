'use client'

import React, { useState, useEffect } from 'react'
import { googleSheetsService } from '../../services/googleSheetsService'
import { updateSuspensionStatuses } from '../../utils/suspensionCalculations'
import { formatDate } from '../../utils/dateFormatters'
import { showNotification } from '../UI/NotificationContainer'
import { SuspensionModal } from './SuspensionModal'
import { AppliedSuspensionsTable } from './AppliedSuspensionsTable'
import { DismissalCandidatesTable } from './DismissalCandidatesTable'
import { useAuth } from '../../contexts/AuthContext'

export const SuspensionsSection = () => {
  const { isAuthorizedUser } = useAuth()
  const [suspensionData, setSuspensionData] = useState([])
  const [suspensionCandidates, setSuspensionCandidates] = useState([])
  const [notAppliedSuspensions, setNotAppliedSuspensions] = useState([])
  const [appliedSuspensions, setAppliedSuspensions] = useState([])
  const [dismissalCandidates, setDismissalCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadSuspensionData()
    // Configurar verificación periódica de suspensiones (cada 30 minutos)
    const interval = setInterval(() => {
      loadSuspensionData()
    }, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadSuspensionData = async () => {
    setLoading(true)
    const result = await googleSheetsService.getSuspensions()
    if (!result.error && result.data) {
      setSuspensionData(result.data)
      const statuses = updateSuspensionStatuses(result.data)
      setSuspensionCandidates(statuses.suspensionCandidates)
      setNotAppliedSuspensions(statuses.notAppliedSuspensions)
      setAppliedSuspensions(statuses.appliedSuspensions)
      setDismissalCandidates(statuses.automaticDismissalCandidates)
      
      // Mostrar notificaciones si hay candidatos
      if (statuses.suspensionCandidates.length > 0) {
        showNotification(`Hay ${statuses.suspensionCandidates.length} candidato(s) a suspensión pendientes`, 'warning')
      }
      if (statuses.automaticDismissalCandidates.length > 0) {
        showNotification(`CANDIDATO A BAJA AUTOMÁTICA: ${statuses.automaticDismissalCandidates.length} empleado(s) con 4+ faltas en 30 días`, 'error')
      }
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

  // Verificar si el usuario está autorizado para aplicar suspensiones


  return (
    <div>
      {/* Botón de actualizar */}
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
          <h3 className="text-xl font-bold text-white">Suspensiones Pendientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-800/90">
              <tr>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Nombre</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Primera Falta</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Faltas</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Días Sugeridos</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Estado</th>
                <th className="p-4 text-left text-slate-300 text-sm uppercase">Acciones</th>
               </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Cargando datos...</td></tr>
              ) : suspensionCandidates.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No hay candidatos a suspensión pendientes</td></tr>
              ) : (
                suspensionCandidates.map((candidate, idx) => {
                  const daysRemaining = Math.ceil((candidate.deadline - new Date()) / (1000 * 60 * 60 * 24))
                  return (
                    <tr key={idx} className="border-b border-slate-600/30 blinking-row-yellow">
                      <td className="p-4">{candidate.employeeName}</td>
                      <td className="p-4">{formatDate(candidate.firstAbsenceDate)}</td>
                      <td className="p-4">{candidate.absencesCount} falta(s) ({candidate.mondayFridayCount} en lunes/viernes)</td>
                      <td className="p-4">{candidate.suggestedDays} día(s)</td>
                      <td className="p-4"><span className="status-badge status-pendiente">PENDIENTE</span></td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleApplySuspension(candidate)} 
                          className="modern-button text-sm py-1 px-3"
                          disabled={!isAuthorizedUser()}
                        >
                          Aplicar
                        </button>
                        <br />
                        <small className="text-slate-400">Vence en {daysRemaining} días</small>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspensiones No Aplicadas */}
      {notAppliedSuspensions.length > 0 && (
        <div className="glassmorphism-table mb-8">
          <div className="p-6 border-b border-slate-600/30">
            <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              SUSPENSIONES NO APLICADAS
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-800/90">
                <tr>
                  <th className="p-4 text-left text-slate-300 text-sm uppercase">Nombre</th>
                  <th className="p-4 text-left text-slate-300 text-sm uppercase">Primera Falta</th>
                  <th className="p-4 text-left text-slate-300 text-sm uppercase">Fecha Límite</th>
                  <th className="p-4 text-left text-slate-300 text-sm uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {notAppliedSuspensions.map((suspension, idx) => (
                  <tr key={idx} className="border-b border-slate-600/30 blinking-row-red">
                    <td className="p-4">{suspension.employeeName}</td>
                    <td className="p-4">{formatDate(suspension.firstAbsenceDate)}</td>
                    <td className="p-4">{formatDate(suspension.deadline)}</td>
                    <td className="p-4"><span className="status-badge status-no-aplicada">NO APLICADA</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspensiones Aplicadas */}
      <AppliedSuspensionsTable appliedSuspensions={appliedSuspensions} />

      {/* Candidatos a Baja Automática */}
      <DismissalCandidatesTable dismissalCandidates={dismissalCandidates} />

      <SuspensionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        candidate={selectedCandidate} 
        onSuccess={loadSuspensionData} 
      />
    </div>
  )
}