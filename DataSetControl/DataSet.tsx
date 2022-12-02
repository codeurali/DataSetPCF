import * as React from 'react';
import {useState, useEffect, useMemo} from 'react';
import {DetailsList, Spinner, SpinnerSize } from '@fluentui/react';
import {IDataSetProps} from '../index.types'


const DataSet = ({dataset}: IDataSetProps) => {

  const [items, setItems] = useState<any>([]);
  const [columns, setColumns] = useState<any>([]);
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
      }
    }
    ));

    setItems(dataset.sortedRecordIds.map((id) => {
      const entityId = dataset.records[id];
      const attributes = dataset.columns.map((column) => {
        if(column.dataType === 'Decimal') {
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

  }, [dataset]);

  useMemo(() => {
    if(!loading) return;
    const myGroups = items.reduce((prev: any, current: any, currentIndex: number) => {
      if(prev.lenght === 0 || prev[prev.lenght - 1].key !== current.parentId) {
        prev.push({
          key: current.parentId,
          raw: current,
          startIndex: currentIndex,
          name: current.raw.getFormattedValue("accountid"),
          parentId: current.parentId,
          count: 1,
          level: 0,
        })
      } else {
        prev[prev.lenght - 1].count++;
      }
      return prev;
    }, []);
    setGroups(myGroups);
  }, [items])

console.log("column",columns);
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
          
        />
      }
    </>
  )
}

export default DataSet