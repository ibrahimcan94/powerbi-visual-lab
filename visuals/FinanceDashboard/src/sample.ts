import sample from "./finance/sampleData.json";
import {createDataset,FinanceEvent} from "./finance/model";
export const sampleDataset=createDataset(sample as FinanceEvent[],"sample");
