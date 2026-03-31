import React, { useState, useEffect } from 'react'

export const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const handleNotification = (event) => {
      const { message, type } = event.detail
      const id = Date.now() + Math.random()
      setNotifications(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, 5000)
    }

    window.addEventListener('show-notification', handleNotification)
    return () => window.removeEventListener('show-notification', handleNotification)
  }, [])

  if (notifications.length === 0) return null

  const getBorderColor = (type) => {
    switch(type) {
      case 'success': return '--border-color: #10b981;' // emerald-500
      case 'error': return '--border-color: #ef4444;'   // red-500
      case 'warning': return '--border-color: #eab308;' // yellow-500
      default: return '--border-color: #10b981;'
    }
  }

  const getGlowColor = (type) => {
    switch(type) {
      case 'success': return '0 0 20px rgba(16, 185, 129, 0.3)'
      case 'error': return '0 0 20px rgba(239, 68, 68, 0.3)'
      case 'warning': return '0 0 20px rgba(234, 179, 8, 0.3)'
      default: return '0 0 20px rgba(16, 185, 129, 0.3)'
    }
  }

  return (
    <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-3 max-w-[400px] pointer-events-none">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="group notification-card relative bg-slate-800/95 backdrop-blur-md rounded-xl p-4 shadow-xl text-white pointer-events-auto overflow-hidden"
          style={{
            border: '1px solid rgba(71, 85, 105, 0.5)',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Estilo personalizado para el borde animado */}
          <style>{`
            .notification-card {
              position: relative;
              background: rgba(30, 41, 59, 0.95);
              backdrop-filter: blur(12px);
              border-radius: 0.75rem;
              transition: all 0.3s ease;
            }
            
            .notification-card::before {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              background: linear-gradient(
                45deg,
                ${notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#eab308'},
                ${notification.type === 'success' ? '#34d399' : notification.type === 'error' ? '#f87171' : '#fbbf24'},
                ${notification.type === 'success' ? '#059669' : notification.type === 'error' ? '#dc2626' : '#ca8a04'},
                ${notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#eab308'}
              );
              background-size: 300% 300%;
              border-radius: 0.85rem;
              z-index: -1;
              opacity: 0;
              transition: opacity 0.4s ease;
            }
            
            .notification-card:hover::before {
              opacity: 1;
              animation: borderGlow 1.5s ease infinite;
            }
            
            .notification-card:hover {
              transform: translateY(-4px);
              box-shadow: ${getGlowColor(notification.type)};
              border-color: transparent;
            }
            
            @keyframes borderGlow {
              0% {
                background-position: 0% 50%;
                opacity: 0.6;
              }
              50% {
                background-position: 100% 50%;
                opacity: 1;
              }
              100% {
                background-position: 0% 50%;
                opacity: 0.6;
              }
            }
          `}</style>

          {/* Contenido de la notificación */}
          <div className="flex items-start gap-3 relative z-10">
            {/* Icono */}
            <div className="flex-shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110">
              {notification.type === 'success' && (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            
            {/* Mensaje */}
            <p className="text-sm font-medium leading-relaxed flex-1">
              {notification.message}
            </p>
            
            {/* Botón de cerrar (aparece al hover) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setNotifications(prev => prev.filter(n => n.id !== notification.id))
              }}
              className="flex-shrink-0 text-slate-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Barra de progreso en la parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
            <div 
              className={`h-full transition-all duration-[5000ms] linear ${
                notification.type === 'success' ? 'bg-emerald-500' :
                notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: '100%', animation: 'shrinkWidth 5s linear forwards' }}
            />
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export const showNotification = (message, type = 'success') => {
  window.dispatchEvent(new CustomEvent('show-notification', { detail: { message, type } }))
}