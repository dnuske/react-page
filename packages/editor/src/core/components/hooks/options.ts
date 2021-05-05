import React, { createContext, useContext } from 'react';
import type EditorStore from '../../EditorStore';
import { EditorContext } from '../../EditorStore';
import { useSelector } from '../../reduxConnect';
import { getLang } from '../../selector/setting';
import type { Options } from '../../types';

/**
 * @returns the store object of the current editor. Contains the redux store.
 */

export const useEditorStore = () => useContext<EditorStore>(EditorContext);

export const OptionsContext = createContext<Options>({
  allowMoveInEditMode: true,
  allowResizeInEditMode: true,
  cellPlugins: [],
  languages: [],
  pluginsWillChange: false,
});

/**
 * @returns the options object of the current Editor. @see Options type for more information
 */
export const useOptions = () => useContext(OptionsContext);

export type TranslatorFunction = (key: string) => string;
/**
 * @returns the an object with a single `t` function for ui translations
 */
export const useUiTranslator = (): {
  t: TranslatorFunction;
} => {
  const { uiTranslator } = useOptions();
  return {
    t: (key: string) => {
      return uiTranslator?.(key) ?? key;
    },
  };
};

/**
 * @returns the current language
 */
export const useLang = () => {
  return useSelector(getLang);
};

