import React, { useState } from 'react'
import { PermissionModal } from './PermissionModal'
import { FileText, Printer } from 'lucide-react'
import './PermissionsSection.css'

export const PermissionsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => setIsModalOpen(true)
  
  const handleImprimirUltimo = () => {
    const spreadsheetId = import.meta.env.VITE_PERMISSIONS_SPREADSHEET_ID
    if (spreadsheetId) {
      window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=0`, '_blank')
    }
  }

  return (
    <div className="permisos-page fade-in">
      <div className="content-header">
        <div>
          <h1 className="page-title">Sistema de Incidencias / Permisos</h1>
          <p className="page-subtitle">Generación de permisos </p>
        </div>
      </div>

      <div className="permisos-container">
        <div className="permisos-card glass-card shimmer-border">
          <div className="permisos-header">
            <FileText className="permisos-icon" />
            <h2>Generar Permiso </h2>
          </div>
          
          <p className="permisos-description">
            Crea un nuevo permiso para el personal interno
          </p>
          
          <div className="permisos-actions">
            <button
              className="modern-button text-lg py-3 px-6 w-full flex items-center justify-center gap-2"
              onClick={handleOpenModal}
            >
              <FileText className="w-5 h-5" />
              Nuevo Permiso
            </button>
            

          </div>
        </div>
      </div>

      <PermissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}