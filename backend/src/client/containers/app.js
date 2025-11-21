import React from 'react'
import { connect } from 'react-redux'


const App = ({message, inputVal, searchGame, handleNextPiece}) => {
  return (
    <div>
      <input value={inputVal} onChange={(e) => inputVal = e.target.value}/>
      <span>{message}</span>
      <button onClick={searchGame}>search game</button>
      <div>
        <button onClick={handleNextPiece}>Next Piece</button>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.message
  }
}
export default connect(mapStateToProps, null)(App)


