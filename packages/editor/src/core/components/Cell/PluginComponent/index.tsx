import React, { useMemo } from 'react';
import { BottomToolbar } from '../../../../ui';
import type { CellPluginComponentProps } from '../../../types';
import {
  usePluginOfCell,
  useDebouncedCellData,
  useIsEditMode,
  useIsFocused,
  useIsPreviewMode,
  useLang,
  useRemoveCell,
  useOptions,
  useCellProps,
} from '../../hooks';
import PluginControls from '../PluginControls';
import PluginMissing from '../PluginMissing';

const DefaultProvider: React.FC = ({ children }) => <>{children}</>;
const PluginComponent: React.FC<{ nodeId: string; hasChildren: boolean }> = ({
  nodeId,
  children,
  hasChildren,
}) => {
  const lang = useLang();
  const CustomPluginMissing = useOptions()?.components?.CellPluginMissing;
  const isPreviewMode = useIsPreviewMode();
  const isEditMode = useIsEditMode();

  const [data, onChange] = useDebouncedCellData(nodeId);
  const pluginId = useCellProps(nodeId, (c) => c.plugin?.id);
  const plugin = usePluginOfCell(nodeId);
  const focused = useIsFocused(nodeId);
  const hasInlineNeighbour = useCellProps(nodeId, (c) => c.hasInlineNeighbour);

  const Renderer = plugin?.Renderer;
  const Missing = CustomPluginMissing ?? PluginMissing;
  const Provider = plugin?.Provider ?? DefaultProvider;
  const remove = useRemoveCell(nodeId);

  const Toolbar = useOptions().components?.BottomToolbar ?? BottomToolbar;

  const componentProps = useMemo<CellPluginComponentProps<unknown>>(
    () => ({
      nodeId,
      lang,
      data,
      pluginConfig: plugin,
      focused: isEditMode && focused,
      readOnly: !isEditMode,
      onChange: onChange,
      isEditMode,
      isPreviewMode,
      remove,
    }),
    [
      nodeId,
      lang,
      data,
      plugin,
      isEditMode,
      focused,
      onChange,
      isEditMode,
      isPreviewMode,
      remove,
    ]
  );


  return (
    <Provider {...componentProps}>
      <>
        <div
          style={{
            height: '100%',
            pointerEvents:
              !isPreviewMode &&
              plugin &&
              !plugin?.allowClickInside &&
              !hasChildren
                ? 'none'
                : undefined,
          }}
        >
          {Renderer ? (
            <Renderer {...componentProps}>{children}</Renderer>
          ) : pluginId ? (
            <Missing {...componentProps} pluginId={pluginId} />
          ) : (
            children
          )}
        </div>
        <Toolbar
          nodeId={nodeId}
          open={focused && isEditMode}
          dark={plugin?.bottomToolbar?.dark}
          pluginControls={
            plugin?.controls ? (
              <PluginControls
                componentProps={componentProps}
                controls={plugin?.controls}
              />
            ) : null
          }
        />
      </>
    </Provider>
  );
};

export default PluginComponent;
