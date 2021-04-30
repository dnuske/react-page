import classNames from 'classnames';
import React from 'react';
import { migrateValue } from '../core/migrations/migrate';
import { setAllSizesAndOptimize } from '../core/reducer/value/helper/setAllSizesAndOptimize';
import { optimizeRows } from '../core/reducer/value/helper/optimize';
import type {
  Cell,
  CellPlugin,
  Row,
  ValueWithLegacy,
  Options,
} from '../core/types';
import { getCellData } from '../core/utils/getCellData';
import { getCellStyle } from '../core/utils/getCellStyle';

import { gridClass } from '../core/components/Cell/utils/gridClass';
import { getChildCellPlugins } from '../core/utils/getAvailablePlugins';

const rowHasInlineChildren = ({ cells }) =>
  Boolean(cells.length === 2 && Boolean(cells[0].inline));

const HTMLRow: React.FC<
  Partial<Row & { lang: string; className?: string; cellPlugins: CellPlugin[] }>
> = React.memo(({ cells = [], className, lang, cellPlugins }) => (
  <div
    className={classNames('react-page-row', className, {
      'react-page-row-has-floating-children': rowHasInlineChildren({ cells }),
    })}
  >
    {cells.map((c) => (
      <HTMLCell
        key={c.id}
        {...c}
        lang={lang}
        cellPlugins={cellPlugins}
      />
    ))}
  </div>
));

// eslint-disable-next-line no-empty-function
const noop = () => {
  return;
};

const DefaultProvider: React.FC = ({ children }) => <>{children}</>;

const HTMLCell: React.FC<
  Cell & {
    lang: string;
    cellPlugins: CellPlugin[];
  }
> = React.memo((props) => {
  const { lang, cellPlugins, ...cell } = props;
  const { size, hasInlineNeighbour, inline, isDraftI18n, isDraft } = cell;
  const hasChildren = cell.rows?.length > 0;

  const cn = classNames('react-page-cell', gridClass(size), {
    'react-page-cell-has-inline-neighbour': hasInlineNeighbour,
    [`react-page-cell-inline-${inline || ''}`]: inline,
  });

  if (isDraftI18n?.[lang] ?? isDraft) {
    return null;
  }
  const data = getCellData(cell, lang) ?? {};
  const plugin = cell.plugin
    ? cellPlugins.find((p) => p.id === cell.plugin.id)
    : null;
  if (plugin) {
    const { Renderer } = plugin;

    const cellStyle = getCellStyle(plugin, data);
    const Provider = plugin.Provider ?? DefaultProvider;

    const props = {
      readOnly: true,
      lang: lang,
      nodeId: cell.id,
      data: data,
      onChange: noop,
      pluginConfig: plugin,
      focused: false,
      isPreviewMode: false,
      isEditMode: false,
    };
    const childCellPlugins = getChildCellPlugins(cellPlugins, {
      data,
      pluginId: plugin?.id,
    });
    return (
      <Provider {...props}>
        <div className={cn}>
          <div
            style={cellStyle}
            className={
              'react-page-cell-inner' +
              (cell.rows?.length > 0 ? '' : ' react-page-cell-inner-leaf')
            }
          >
            <Renderer {...props}>
              {cell.rows?.map((r: Row, index) => (
                <HTMLRow
                  key={r.id}
                  {...r}
                  cellPlugins={cellPlugins}
                  lang={lang}
                  className="react-page-cell-inner"
                />
              ))}
            </Renderer>
          </div>
        </div>
      </Provider>
    );
  } else if (cell.rows?.length > 0) {
    return (
      <div className={cn}>
        {cell.rows.map((r: Row) => (
          <HTMLRow
            key={r.id}
            {...r}
            lang={lang}
            className="react-page-cell-inner"
            cellPlugins={cellPlugins}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn}>
      <div className="react-page-cell-inner" />
    </div>
  );
});

export interface HTMLRendererProps {
  value: ValueWithLegacy;
  cellPlugins?: CellPlugin[];
  lang?: string;
}

export const HTMLRenderer: React.FC<HTMLRendererProps> = React.memo(
  ({ value, cellPlugins, lang = 'default' }) => {
    const data = migrateValue(value, { cellPlugins, lang });

    if (!data) {
      return null;
    }
    const { rows } = data;

    return (
      <>
        {setAllSizesAndOptimize(rows).map((row) => (
          <HTMLRow
            key={row.id}
            cellPlugins={cellPlugins}
            lang={lang}
            {...row}
          />
        ))}
      </>
    );
  }
);
