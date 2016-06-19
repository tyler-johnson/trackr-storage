import {Map} from "trackr-objects";

export default class Storage extends Map {
	constructor(key, type="session") {
		super();
		this.storageKey = key;
		this.storageType = type;
		this.fetch({ clear: false });
	}

	static getStore(type) {
		return window[type + "Storage"];
	}

	static deserializeStore(type, key) {
		try {
			let rawData = Storage.getStore(type).getItem(key);
			if (typeof rawData === "string" && rawData) {
				return JSON.parse(rawData);
			}
		} catch(e) {
			// swallow errors
		}
	}

	static serializeStore(type, key, data) {
		Storage.getStore(type).setItem(key, JSON.stringify(data));
	}

	migrate(newType) {
		let oldType = this.storageType;
		if (newType === oldType) return this;

		this.storageType = newType;
		this.save();
		Storage.getStore(oldType).removeItem(this.storageKey);

		return this;
	}

	save() {
		Storage.serializeStore(this.storageType, this.storageKey, this._values);
		return this;
	}

	fetch(opts={}) {
		if (opts.clear !== false) this.clear();
		return this.set(Storage.deserializeStore(this.storageType, this.storageKey));
	}
}

["set","delete","clear"].forEach(function(method) {
	Storage.prototype[method] = function() {
		Map.prototype[method].apply(this, arguments);
		this.save();
		return this;
	};
});
