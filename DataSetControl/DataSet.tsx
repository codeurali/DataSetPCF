import * as React from 'react';
import {useState, useEffect} from 'react';
import { DetailsList, IColumn, IDetailsHeaderProps, IRenderFunction, Sticky, StickyPositionType  } from '@fluentui/react';
import {IDataSetProps} from '../index.types' 

const DataSet = ({dataset, columnsHasPercentage, formEntityName}: IDataSetProps ) => {

  const [items, setItems] = useState<any[]>([]);
  const [columns, setColumns] = useState<IColumn[]>([]);
  //const [isSorted, setIsSorted] = useState<boolean>(false);
  //const [columnSorted, setColumnSorted] = useState({} as any);
  const [sorting, setSorting] = useState([]);

  const [loading, setLoading] = useState<boolean>(true);

  console.log("entity name : ", formEntityName);

  useEffect(() => {
    setLoading(dataset.loading); 
    
    if(!loading) return;

    
    // const _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
    //   const newColumns = myColumns.slice();
    //   const currColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
    //   newColumns.forEach((newCol: IColumn) => {
    //     if (newCol === currColumn) {
    //       currColumn.isSortedDescending = !currColumn.isSortedDescending;
    //       currColumn.isSorted = true;
    //     } else {
    //       newCol.isSorted = false;
    //       newCol.isSortedDescending = true;
    //     }
    //   })
    //   setColumns(newColumns);
    //   setIsSorted(currColumn.isSortedDescending);
    //   setColumnSorted(currColumn);
    // }
    

    const myColumns = dataset.columns.sort((column1, column2) => column1.order - column2.order).map((column) => {
      return {
        name: column.displayName,
        fieldName: column.name,
        minWidth: column.visualSizeFactor,
        key: column.name,
        type: column.dataType,
        //isSortedDescending: isSorted,
        //isSorted: true,
        //onColumnClick: _onColumnClick,
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
        return {[column.name]: entityId.getFormattedValue(column.name) };
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

  }, [dataset, columns, items]);

  // if(isSorted) {
  //   columns.map(column => {
  //     if(column.name === columnSorted.name) {
  //       for(let i = 0; i < items.length; i++) {
  //         const itemColumn = Object.keys(items[i]).find(key => key === columnSorted.name);
  //         const itemColumnString = itemColumn as string;
  //         const sorted = {[column.name]: items.sort(
  //           (a, b) => {
  //             console.log(a[itemColumnString].localeCompare(b[itemColumnString]))
  //             if(a[itemColumnString] - b[itemColumnString]) return -1;
  //             if(a[itemColumnString]- b[itemColumnString] > 0) return 1;
  //             return 0;
  //           }
  //           )};
  //         console.log(sorted[column.name]);
  //         const storedItems = sorted[column.name].reverse()
  //         return storedItems
  //       }
  //     }
  //   })
  // }

  const _onRenderDetailsHeader = (props: IDetailsHeaderProps | undefined, defaultRender?: IRenderFunction<IDetailsHeaderProps>) => {
    if (!defaultRender) {
      return null;
    }
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
        {defaultRender!({...props!, onColumnClick: onColumnHerderClick })},
      </Sticky>
    );
  };

  const onColumnHerderClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
    const name = column?.fieldName ?? "";
    onColumnClick(name);
  };

  const onColumnClick = (columnClicked: string) => {
    const oldSorting = (sorting || []).find((sort: any) => sort.name == columnClicked);
    const newValue  = {
      name: columnClicked,
      sortDirection: oldSorting != null ? (((oldSorting as any).sortDirection) === 0 ? 1 : 0) : 0
    };
    while ((dataset.sorting as any).length > 0) {
      dataset.sorting.pop();
    }
    (dataset.sorting as any).push(newValue);
    (dataset.paging as any).loadExactPage(1);
    dataset.refresh();

    setSorting((dataset.sorting as any));
  }

  const myItemInvoked = React.useCallback((item: any) => {
    const record = dataset.records[item.key];
    dataset.openDatasetItem(record.getNamedReference());
    }, [dataset]);

  
//
  return (
    <>
      { 
        <DetailsList 
          items={items} 
          columns={columns}
          styles={{root: {overflow: 'auto', height: '100%', width: '100%'}}}
          onItemInvoked={myItemInvoked}
          onRenderDetailsHeader={_onRenderDetailsHeader}
          
        /> 
      }
    </>
  )
}

export default DataSet