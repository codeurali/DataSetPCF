import * as React from 'react';
import {useState, useEffect} from 'react';
import { DetailsList, IColumn, Spinner, SpinnerSize } from '@fluentui/react';
import {IDataSetProps} from '../index.types' 

const DataSet = ({dataset, columnsHasPercentage, formEntityName}: IDataSetProps) => {

  const [items, setItems] = useState<any[]>([]);
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [columnSorted, setColumnSorted] = useState({} as any);


  const [loading, setLoading] = useState<boolean>(true);

  console.log("entity name : ", formEntityName);

  useEffect(() => {
    setLoading(dataset.loading); 
    
    if(!loading) return;

    const _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
      const newColumns = myColumns.slice();
      const currColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
      newColumns.forEach((newCol: IColumn) => {
        if (newCol === currColumn) {
          currColumn.isSortedDescending = !currColumn.isSortedDescending;
          currColumn.isSorted = true;
        } else {
          newCol.isSorted = false;
          newCol.isSortedDescending = true;
        }
      })
      setColumns(newColumns);
      setIsSorted(currColumn.isSortedDescending);
      setColumnSorted(currColumn);
      console.log("column sorted : ", isSorted);
    }
    

    const myColumns = dataset.columns.sort((column1, column2) => column1.order - column2.order).map((column) => {
      return {
        name: column.displayName,
        fieldName: column.name,
        minWidth: column.visualSizeFactor,
        key: column.name,
        type: column.dataType,
        isSortedDescending: isSorted,
        isSorted: true,
        onColumnClick: _onColumnClick,
      }
    });

    setColumns(myColumns);
    
    // split string by comma to get array of group names
    const fieldInGroup = columnsHasPercentage?.split(',') as string[];

    const myItems = dataset.sortedRecordIds.map((id) => {
      const entityId = dataset.records[id];
      const entity = formEntityName as string
      const attributes = dataset.columns.map((column) => {
        for(let field in fieldInGroup)
        if(fieldInGroup[field] === column.name) {
          console.info("field from input", fieldInGroup[field], "field from grid", column.name)
          return {[column.name] : (Number(entityId.getFormattedValue(column.name)) * 100).toFixed(7) + '%'};
        } 
        return {[column.name]: entityId.getFormattedValue(column.name)  + entityId.getRecordId()};
      });
      return Object.assign({
        key: entityId.getRecordId(),
        parentId: (entityId.getValue(entity) as ComponentFramework.EntityReference | undefined )?.id.guid,
        recordId: entityId.getRecordId(),
        raw: entityId,
      },
      ...attributes)
    }).sort((a, b) => a.parentId ? -1 : a.parentId < b.parendId ? 1 : 0);
    setItems(myItems);

  }, [dataset, columns, isSorted, items]);

  if(isSorted) {
    console.log("get in sort : ", isSorted);
    columns.map(column => {
      console.log("column name : ", column.name, "column sorted : ", columnSorted.name);
      if(column.name === columnSorted.name) {
        for(let i = 0; i < items.length; i++) {
          const itemColumn = Object.keys(items[i]).find(key => key === columnSorted.name);
          const itemColumnString = itemColumn as string;
          console.log("itemColumnString : ", itemColumnString);
          const sorted = {[column.name]: items.sort()}
          console.log(sorted[column.name]);
          const storedItems = sorted[column.name].reverse()
          return storedItems
        }
      }
    })
  }
//(a, b) => {a[itemColumnString] < b[itemColumnString] ?  -1 : a[itemColumnString] > b[itemColumnString] ? 1 : 0}
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