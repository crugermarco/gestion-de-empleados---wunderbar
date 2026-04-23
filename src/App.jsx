import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationContainer } from './components/UI/NotificationContainer'
import { Sidebar } from './components/Layout/Sidebar'
import { AttendanceSection } from './components/Attendance/AttendanceSection'
import { SuspensionsSection } from './components/Suspensions/SuspensionsSection'
import { VacationsSection } from './components/Vacations/VacationsSection'
import { PermissionsSection } from './components/Permissions/PermissionsSection'
import { RotationSection } from './components/Rotation/RotationSection'
import { EmployeesSection } from './components/Employees/EmployeesSection'
import BackgroundEffect from './components/UI/BackgroundEffect' // ← NUEVO

const AppContent = () => {
  const [activeSection, setActiveSection] = useState('asistencias')
  const { currentUser } = useAuth()

  const renderSection = () => {
    switch(activeSection) {
      case 'asistencias': return <AttendanceSection />
      case 'suspensiones': return <SuspensionsSection />
      case 'vacaciones': return <VacationsSection />
      case 'permisos': return <PermissionsSection />
      case 'rotacion': return <RotationSection />
      case 'data': return <EmployeesSection />
      default: return <AttendanceSection />
    }
  }

  const getPageTitle = () => {
    switch(activeSection) {
      case 'asistencias': return { title: 'Control de Asistencias', subtitle: 'Gestiona las asistencias y faltas del personal' }
      case 'suspensiones': return { title: 'Gestion de Suspensiones', subtitle: 'Administra las suspensiones del personal' }
      case 'vacaciones': return { title: 'Gestion de Vacaciones', subtitle: 'Administra las vacaciones programadas del personal' }
      case 'permisos': return { title: 'Solicitud de Permisos', subtitle: 'Gestiona los permisos del personal' }
      case 'rotacion': return { title: 'Registro de Rotacion', subtitle: 'Control de operaciones y rotacion del personal' }
      case 'data': return { title: 'Base de Datos', subtitle: 'Gestiona la informacion de los empleados' }
      default: return { title: 'Control de Asistencias', subtitle: 'Gestiona las asistencias y faltas del personal' }
    }
  }

  const { title, subtitle } = getPageTitle()

  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} userName={currentUser?.name} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-400">{subtitle}</p>
        </div>
        
        {renderSection()}
      </div>
      
      <NotificationContainer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      {/* NUEVO: Background Effect Premium */}
      <BackgroundEffect />
      
      <AppContent />
    </AuthProvider>
  )
}

export default App