import { BigInt } from "@graphprotocol/graph-ts";
import { Bottle as BottleContract, BuyBottle, Transfer } from "../generated/Collection_Lorem/Bottle";
import { Bottle, Cellar, Collection } from "../generated/schema";

function getBottleFullId (collection: string, tokenId: BigInt): string {
    return `${collection}-${tokenId.toString()}`
}

export function handleBuy (event: BuyBottle): void {
    const collectionAddress = event.address.toHexString();
    let collection = Collection.load(collectionAddress);
    const collectionContract = BottleContract.bind(event.address);
    if (collection) {
        collection.currentSupply = collection.currentSupply.plus(BigInt.fromI64(1));
        collection.save();

        const tokenId = event.params._id;
        const fullId = getBottleFullId(collectionAddress, tokenId);
        let bottle = new Bottle(fullId);
        bottle.expiry = collectionContract.expiry(tokenId);
        bottle.status = '';
        bottle.collection = collection.id;
        bottle.bottleId = tokenId;
        bottle.save();

        let cellar = Cellar.load(event.params._toCellar.toHexString());
        if (cellar) {
            cellar.aum = cellar.aum.plus(BigInt.fromI64(1));
            let owned = cellar.owned;
            owned.push(fullId);
            cellar.owned = owned;
            cellar.save();
        }
    }
}

export function handleTransfer (event: Transfer): void {
    const from = event.params.from.toHexString();
    if (from != '0x0000000000000000000000000000000000000000') {
        const tokenId = event.params.tokenId;
        const collectionAddress = event.address.toHexString();
        const fullId = getBottleFullId(collectionAddress, tokenId);

        let cellarFrom = Cellar.load(from);
        if (cellarFrom) {
            cellarFrom.aum = cellarFrom.aum.minus(BigInt.fromI64(1));
            let owned = cellarFrom.owned;
            let newOwned: string[] = [];
            for(let i = 0; i < owned.length; i++) {
                if (owned[i] != fullId) {
                    newOwned.push(owned[i]);
                }
            }

            cellarFrom.owned = newOwned;
            cellarFrom.save();
        }
    
        let cellarTo = Cellar.load(event.params.to.toHexString());
        if (cellarTo) {
            cellarTo.aum = cellarTo.aum.plus(BigInt.fromI64(1));
            let owned = cellarTo.owned;
            owned.push(fullId);
            cellarTo.owned = owned;
            cellarTo.save();
        }
    }
}
