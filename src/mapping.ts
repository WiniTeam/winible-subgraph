import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { CellarBuilt, DefaultPerkAdded, LevelAdded, PerkAdded, Winible } from "../generated/Winible/Winible"
import { Card, Cellar, Level, Perk } from "../generated/schema"


export function handleLevelAdded (event: LevelAdded): void {
	let level = new Level(event.params._level.toString());
	level.capacity = event.params._capacity;
	level.defaultPerks = [];
	level.name = event.params._name;
	level.price = event.params._price;
	level.save();
}

export function handlePerkAdded (event: PerkAdded): void {
	let perk = new Perk(event.params._perkId.toString());
	perk.name = event.params._name;
	perk.price = event.params._price;
	perk.save();
}

export function handleDefaultPerkAdded (event: DefaultPerkAdded): void {
	let level = Level.load(event.params._level.toString());
	if (level) {
		let perks = level.defaultPerks;
		perks.push(event.params._perkId.toString());
		level.defaultPerks = perks;
		level.save();
	}
}

export function handleCellarBuilt (event: CellarBuilt): void {
	let winible = Winible.bind(event.address);

	let cellar = new Cellar(event.params._address.toHexString());
	cellar.capacity = event.params._capacity;
	cellar.aum = BigInt.fromI64(0);
	cellar.save();
	
	let card = new Card(event.params._id.toString());
	card.owner = winible.ownerOf(event.params._id);
	card.data = Bytes.empty();
	card.cellar = cellar.id;
	card.level = event.params._level.toString();
	card.save();
}


// It is also possible to access smart contracts from mappings. For
// example, the contract that has emitted the event can be connected to
// with:
//
// let contract = Contract.bind(event.address)