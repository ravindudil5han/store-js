const fs = require('fs').promises;

// RAM-only data store class
class LocalMemoryStore {
    constructor() {
        this.data_store = {};
        this.expiration_times = {};
        this.store_event_data_handlers = {};
    }

    async operate(id, method, data, expire_time = null) {
        switch (method) {
            case 'new':
                return await this.clear_data(id);
            case 'set':
                return await this.memorize_data(id, data, expire_time);
            case 'get':
                return await this.get_data(id);
            default:
                throw new Error('Invalid method');
        }
    }

    async clear_data(id) {
        delete this.data_store[id];
        delete this.expiration_times[id];
        this.emit_event('clear', id);
        return { success: true, message: 'Data deleted from RAM' };
    }

    async memorize_data(id, data, expire_time = null) {
        this.data_store[id] = data;
        if (expire_time) {
            this.expiration_times[id] = Date.now() + expire_time;
        }
        this.emit_event('set', id);
        return { success: true, message: 'Data memorized in RAM' };
    }

    async get_data(id) {
        const data = this.data_store[id];
        const expiration_time = this.expiration_times[id];

        if (expiration_time && Date.now() > expiration_time) {
            await this.clear_data(id);
            return null;
        }

        return data || null;
    }

    emit_event(event, id) {
        const data_handlers = this.store_event_data_handlers[event] || [];
        data_handlers.forEach(data_handler => data_handler(id));
    }

    on(event, data_handler) {
        if (!this.store_event_data_handlers[event]) {
            this.store_event_data_handlers[event] = [];
        }
        this.store_event_data_handlers[event].push(data_handler);
    }
}

// JSON-backed data store class
class PersistentMemoryStore extends LocalMemoryStore {
    constructor(filename = 'data.json', initialData = {}) {
        super();
        this.filename = filename;
        this.data_store = initialData;
    }

    async saveDataToJSON() {
        try {
            await fs.writeFile(this.filename, JSON.stringify(this.data_store, null, 2));
        } catch (error) {
            console.error('Error saving data to JSON:', error.message);
            throw error;
        }
    }

    async loadDataFromJSON() {
        try {
            const data = await fs.readFile(this.filename, 'utf8');
            this.data_store = JSON.parse(data);
        } catch (error) {
            console.error('Error loading data from JSON:', error.message);
            throw error;
        }
    }

    async memorize_data(id, data, expire_time = null) {
        await super.memorize_data(id, data, expire_time);
        await this.saveDataToJSON();
        return { success: true, message: 'Data memorized in JSON' };
    }

    async clear_data(id) {
        await super.clear_data(id);
        await this.saveDataToJSON();
        return { success: true, message: 'Data deleted from JSON' };
    }
}

// Main module to manage both RAM and persistent storage based on input
class Store {
    constructor() {
        this.ramStore = new LocalMemoryStore();
        this.jsonStore = new PersistentMemoryStore('data.json');
    }

    async operate(id, method, data, storageType = 'ram', expire_time = null) {
        if (storageType === 'json') {
            if (method === 'get') {
                return await this.jsonStore.get_data(id);
            } else {
                return await this.jsonStore.operate(id, method, data, expire_time);
            }
        } else if (storageType === 'ram') {
            if (method === 'get') {
                return await this.ramStore.get_data(id);
            } else {
                return await this.ramStore.operate(id, method, data, expire_time);
            }
        } else {
            throw new Error('Invalid storage type specified');
        }
    }

    on(event, data_handler) {
        this.ramStore.on(event, data_handler);
        this.jsonStore.on(event, data_handler);
    }

    async loadData() {
        await this.jsonStore.loadDataFromJSON();
    }

    async saveData() {
        await this.jsonStore.saveDataToJSON();
    }
}

// Usage example
(async () => {
    const store = new Store();

    await store.loadData(); // Load JSON data

    // Set data in RAM
    console.log(await store.operate('user1', 'set', { name: 'John Doe', age: 30 }, 'ram'));
    console.log(await store.operate('user1', 'get', null, 'ram')); // Retrieve from RAM

    // Set data in JSON
    console.log(await store.operate('user2', 'set', { name: 'Jane Smith', age: 25 }, 'json'));
    console.log(await store.operate('user2', 'get', null, 'json')); // Retrieve from JSON

    await store.saveData(); // Persist JSON data if any changes
})();

export default Store;
