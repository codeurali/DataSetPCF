import * as React from 'react';
import {useState, useEffect, useMemo, useCallback} from 'react';
import { DetailsList, IColumn, Spinner, SpinnerSize } from '@fluentui/react';
import {IDataSetProps} from '../index.types'


const DataSet = ({dataset, columnsHasPercentage}: IDataSetProps) => {

  const [items, setItems] = useState<any[]>([]);
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [groups, setGroups] = useState<any>([]);

  const [loading, setLoading] = useState<boolean>(true);


  

  useEffect(() => {
    setLoading(dataset.loading); 
    
    if(!loading) return;

  setColumns(dataset.columns.sort((column1, column2) => column1.order - column2.order).map((column) => {
    return {
      name: column.displayName,
      fieldName: column.name,
      minWidth: column.visualSizeFactor,
      key: column.name,
      type: column.dataType,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      isGroupable: true,
      isPadded: true,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      isRowHeader: true,
    }
  }));

    // split string by comma to get array of group names
    const fieldInGroup = columnsHasPercentage?.split(',') as string[];

    setItems(dataset.sortedRecordIds.map((id) => {
      const entityId = dataset.records[id];
      const attributes = dataset.columns.map((column) => {
        for(let field in fieldInGroup)
        if(fieldInGroup[field] === column.name) {
          console.info("field from input", fieldInGroup[field], "field from grid", column.name)
          return {[column.name] : (Number(entityId.getFormattedValue(column.name)) * 100).toFixed(7) + '%'};
        } 
        return {[column.name]: entityId.getFormattedValue(column.name)}
      });
      return Object.assign({
        key: entityId.getRecordId(),
        parentId: (entityId.getValue("accountid") as ComponentFramework.EntityReference | undefined )?.id.guid,
        raw: entityId,
        name: "test"
      },
      ...attributes)
    }).sort((a, b) => a.parentId ? -1 : a.parentId < b.parendId ? 1 : 0));

  }, [dataset, columns]);





console.log("colums",columns);
console.log("items",items);
console.log("loading",loading);
console.log("groups",groups);
console.log("dataset",dataset);

  return (
    <>
      {
        loading ? <Spinner label="Loading..." size={SpinnerSize.large} /> : 
        <DetailsList 
          items={items} 
          columns={columns}
          styles={{root: {overflow: 'auto', height: '100%', width: '100%'}}}
          
        />
      }
    </>
  )
}

export default DataSet