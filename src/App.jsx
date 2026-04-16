import './App.css'
import NavigationProvider from './Navigation.Provider'
import { RecoilRoot } from 'recoil'
import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quint',
    })
  }, [])

  return (
    <RecoilRoot>
      <NavigationProvider />
    </RecoilRoot>
  )
}

export default App

