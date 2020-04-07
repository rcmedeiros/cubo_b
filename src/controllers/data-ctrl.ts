import { ERR_INVALID_PARTICIPATION } from "../constants/message";
import { ERR_INVALID_DATA_OBJECT } from "../constants/message";
import { BadRequestError } from "../error/bad_request-error";
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
        if (!data.firstName || !data.lastName || !data.participation || data.participation < 0) {
            throw new BadRequestError(ERR_INVALID_DATA_OBJECT);
        }

        if (!this.dataCollection.set(data)) {
            throw new BadRequestError(ERR_INVALID_PARTICIPATION);
        }
    }
}