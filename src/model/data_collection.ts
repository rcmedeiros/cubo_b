import { Data } from "./data";

export class DataCollection {
    private readonly collection: { [name: string]: Data } = {};


    public set(data: Data): void {
        this.collection[data.firstName.toLowerCase() + data.lastName.toLowerCase()] = data;
    }

    public get(): Array<Data> {
        return Object.keys(this.collection).map((k: string) => this.collection[k]);
    }
}