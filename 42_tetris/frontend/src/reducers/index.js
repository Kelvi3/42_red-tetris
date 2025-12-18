import { combineReducers } from 'redux';

const alertReducer = (state = null, action) => {
  switch (action.type) {
    case 'ALERT_SUCCESS':
      return { type: 'success', message: action.message };
    case 'ALERT_ERROR':
      return { type: 'error', message: action.message };
    case 'ALERT_CLEAR':
      return null;
    default:
      return state;
  }
};

const socketReducer = (state = null, action) => {
  switch (action.type) {
    case 'SOCKET_CONNECT':
      return action.socket;
    case 'SOCKET_DISCONNECT':
      return null;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  alert: alertReducer,
  socket: socketReducer,
});

export default rootReducer;