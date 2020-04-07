import { Data } from "../model/data";
import { DataCollection } from "../model/data_collection";

export class DataController {
    private dataCollection: DataCollection;

    constructor() {
        this.dataCollection = new DataCollection();
    }

    public get(): Array<Data> {
        return this.dataCollection.get();
    }

    public set(data: Data): void {
        this.dataCollection.set(data)
    }
}