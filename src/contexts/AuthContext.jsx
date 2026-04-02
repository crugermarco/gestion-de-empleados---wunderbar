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
    const urlParams = new URLSearchParams(window.location.search)
    const userParam = urlParams.get('user')
    
    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        localStorage.setItem('userSession', JSON.stringify(user))
        setCurrentUser({
          name: user.USUARIO || 'Usuario',
          role: user.ROL || 'user'
        })
        window.history.replaceState({}, document.title, window.location.pathname)
        setLoading(false)
        return
      } catch (error) {
        console.error('Error al parsear usuario de URL:', error)
      }
    }
    
    const userSession = localStorage.getItem('userSession')
    
    if (userSession) {
      try {
        const user = JSON.parse(userSession)
        setCurrentUser({
          name: user.USUARIO || 'Usuario',
          role: user.ROL || 'user'
        })
      } catch (error) {
        console.error('Error al parsear usuario de localStorage:', error)
        setCurrentUser({
          name: 'Usuario Demo',
          role: 'user'
        })
      }
    } else {
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