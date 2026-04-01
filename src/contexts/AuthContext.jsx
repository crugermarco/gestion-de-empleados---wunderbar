import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userSession = localStorage.getItem('userSession')
    
    if (userSession) {
      const user = JSON.parse(userSession)
      console.log('🔐 Usuario cargado desde localStorage:', user.USUARIO)
      setCurrentUser({
        name: user.USUARIO || 'Usuario',
        role: user.ROL || 'user'
      })
    } else {
      console.log(' No hay sesión, usando usuario demo')
      setCurrentUser({
        name: 'Usuario Demo',
        role: 'user'
      })
    }
    setLoading(false)
  }, [])

  const isAuthorizedUser = () => {
    return currentUser && 
      (currentUser.name.toLowerCase() === 'marco cruger' || 
       currentUser.name.toLowerCase() === 'itati bautista')
  }

  const canEdit = () => {
    return currentUser && currentUser.name.toLowerCase() === 'marco cruger'
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-white text-xl">Cargando...</div></div>
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, isAuthorizedUser, canEdit }}>
      {children}
    </AuthContext.Provider>
  )
}