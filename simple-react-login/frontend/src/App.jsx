import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentView, setCurrentView] = useState('login') // 'login', 'register'

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentView('login')
  }

  return (
    <div className="app-container">
      {currentUser ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : currentView === 'login' ? (
        <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentView('register')} />
      ) : (
        <Register onRegisterSuccess={() => setCurrentView('login')} onSwitchToLogin={() => setCurrentView('login')} />
      )}
    </div>
  )
}

export default App
