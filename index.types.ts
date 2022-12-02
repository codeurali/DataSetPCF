type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDataSetProps {
  dataset: DataSet;
  formEntityName?: string | null;
  formEntityId?: string | null;
  columnsHasPercentage?: string | null;
}
