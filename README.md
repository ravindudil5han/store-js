

---

# Store

A lightweight, dual-mode data storage library in JavaScript that provides both in-memory (RAM) storage and persistent storage via JSON files. Designed for projects that need flexible data storage without relying on databases, `Store` allows you to easily switch between RAM and JSON-based storage based on your requirements.

## Features

- **In-memory (RAM) storage**: Store and retrieve data temporarily in RAM.
- **Persistent (JSON) storage**: Store data persistently in JSON files.
- **Expiration Support**: Set expiration times for data entries, automatically clearing them when expired.
- **Event Handlers**: Add custom event handlers to respond to data changes.
- **Error Handling**: Manage data operations and handle errors gracefully.

## Installation

Since this is not an npm module, you can simply clone the repository and use the code directly in your project.

```bash
git clone https://github.com/your-username/store.git
```

After cloning, require the `Store` class in your code:

```javascript
const Store = require('./path-to-store-module');
```

## Usage

### Initialization

To start using `Store`, create a new instance of the `Store` class:

```javascript
const store = new Store();
```

### Loading and Saving Data

- **Load JSON Data**: Load data from the JSON file into memory.
  ```javascript
  await store.loadData();
  ```

- **Save JSON Data**: Save the current data in memory to the JSON file.
  ```javascript
  await store.saveData();
  ```

### Data Operations

You can perform operations on either **RAM** or **JSON** storage by specifying the `storageType` (`ram` or `json`).

#### Set Data
- **RAM**:
  ```javascript
  await store.operate('key1', 'set', { name: 'Alice', age: 28 }, 'ram');
  ```
- **JSON**:
  ```javascript
  await store.operate('key2', 'set', { name: 'Bob', age: 35 }, 'json');
  ```

#### Get Data
- **RAM**:
  ```javascript
  const data = await store.operate('key1', 'get', null, 'ram');
  ```
- **JSON**:
  ```javascript
  const data = await store.operate('key2', 'get', null, 'json');
  ```

#### Clear Data
- **RAM**:
  ```javascript
  await store.operate('key1', 'new', null, 'ram');
  ```
- **JSON**:
  ```javascript
  await store.operate('key2', 'new', null, 'json');
  ```

### Expiration

To set expiration on an entry:
```javascript
await store.operate('tempKey', 'set', { name: 'Temporary' }, 'ram', 60000); // Expires in 60 seconds
```

### Event Handlers

Add an event handler for data changes:
```javascript
store.on('set', (id) => console.log(`Data set for id: ${id}`));
store.on('clear', (id) => console.log(`Data cleared for id: ${id}`));
```

## Example

```javascript
(async () => {
    const store = new Store();
    await store.loadData();

    // Store in RAM
    console.log(await store.operate('user1', 'set', { name: 'John Doe', age: 30 }, 'ram'));
    console.log(await store.operate('user1', 'get', null, 'ram'));

    // Store in JSON
    console.log(await store.operate('user2', 'set', { name: 'Jane Smith', age: 25 }, 'json'));
    console.log(await store.operate('user2', 'get', null, 'json'));

    await store.saveData();
})();
```

## License

This project is licensed under the MIT License.

---
