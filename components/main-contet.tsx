import React from 'react'
import InitialUI from './initial-ui'
import FightAnalysisContent from './fight-analysis'

function MainContent() {
  return (
    <>
    {/* Choose fight Card */}
    <FightAnalysisContent/>
    {/* UI when user has not clicked Run Analysis button */}
    <InitialUI/>
    </>
  )
}

export default MainContent