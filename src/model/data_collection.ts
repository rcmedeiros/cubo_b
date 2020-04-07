import { Data } from "./data";

interface Collection { [name: string]: Data };
export class DataCollection {
    private readonly collection: Collection = {};

    public total(c: Collection): number {
        return Object.keys(c)
            .map((k: string) => c[k].participation)
            .reduce((previous: number, current: number) => previous + current)
    }

    public set(data: Data): boolean {

        const tmp: Collection = { ...this.collection };
        tmp[data.firstName.toLowerCase() + data.lastName.toLowerCase()] = data;

        if (this.total(tmp) > 100) {
            return false;
        } else {
            this.collection[data.firstName.toLowerCase() + data.lastName.toLowerCase()] = data;
            return true;
        }

    }

    public get(): Array<Data> {
        return Object.keys(this.collection).map((k: string) => this.collection[k]);
    }
}