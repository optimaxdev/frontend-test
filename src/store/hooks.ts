import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/** Typed dispatch hook for this store */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed selector hook for this store */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
