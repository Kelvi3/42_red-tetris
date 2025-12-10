// store.ts
import { createStore, applyMiddleware } from 'redux';
import reducer from './reducers';
import { thunk } from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { Dispatch, UnknownAction } from 'redux';

const initialState = {};

const logger = createLogger({
  collapsed: true,
  diff: true,
  duration: true,
});

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(thunk, logger)
);

export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = Dispatch<UnknownAction>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
