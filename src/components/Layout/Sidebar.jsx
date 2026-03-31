import React from 'react'

const navItems = [
  { id: 'asistencias', label: 'ASISTENCIAS', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'suspensiones', label: 'SUSPENSIONES', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'vacaciones', label: 'VACACIONES', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'permisos', label: 'PERMISOS', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'rotacion', label: 'ROTACIÓN', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { id: 'data', label: 'DATA', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
]

export const Sidebar = ({ activeSection, setActiveSection, userName }) => {
  return (
    <div className="w-[280px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-600/50 p-8 flex flex-col gap-8">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-extrabold text-emerald-400 mb-2">GESTIÓN DE EMPLEADOS</h1>
        <p className="text-slate-400 text-sm">Panel de Control Sistema CRUGER v7.1.2</p>
        {userName && <div className="mt-4 p-2 bg-slate-800/60 rounded-lg font-semibold text-emerald-400">{userName}</div>}
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <div key={item.id} onClick={() => setActiveSection(item.id)} className={`flex items-center gap-3 bg-slate-800/60 border border-slate-600/30 rounded-xl p-4 text-slate-300 font-semibold cursor-pointer transition-all duration-300 hover:bg-slate-700/80 hover:border-emerald-500/30 hover:text-white hover:translate-x-1 ${activeSection === item.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 translate-x-1' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  )
}