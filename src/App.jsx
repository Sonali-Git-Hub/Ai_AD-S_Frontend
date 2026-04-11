import './App.css'
import NavigationProvider from './Navigation.Provider'
import { RecoilRoot } from 'recoil'
import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { ReactLenis } from '@studio-freight/react-lenis'

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quint',
    })
  }, [])

  return (
    <ReactLenis root>
      <RecoilRoot>
        <NavigationProvider />
      </RecoilRoot>
    </ReactLenis>
  )
}

export default App
