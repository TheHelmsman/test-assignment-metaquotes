import { TYPE_TEMPERATURE, TYPE_PRECIPATION, ERROR_DB_FAIL, ERROR_DB_NO_DATA, SUCCESS_RECORDS_FOUND } from "./const"

/**
 * @class DB
 * works with indexedDB
 */
export class DB {

    constructor(model) {

      this.model = model
      this.records = []
      this.db = null
    }

    setupDB(namespace, db, type) {

      return new Promise(function(resolve, reject) {

        // If setupDB has already been run and the database was set up, no need to
        // open the database again; just resolve and return!
        if (db) {
          resolve(db);
          return;
        }

        //  check if indexedDB supported by user browser
        if (!('indexedDB' in window)) {
          console.log('This browser doesn\'t support IndexedDB')
          reject('This browser doesn\'t support IndexedDB')
          return
        }

        let request = window.indexedDB.open(namespace, 3)
        let objectStoreName = (type === TYPE_TEMPERATURE) ? 'temperature' : 'precipitation'
        
        request.onupgradeneeded = function(e) {
          db = e.target.result;
          // Create an object store named notes, or retrieve it if it already
          // exists. Object stores in databases are where data are stored.
          let objStore
          if (!db.objectStoreNames.contains(objectStoreName)) {
            console.log(objectStoreName+' store not found, creating...')
            objStore = db.createObjectStore(objectStoreName, {keyPath: 'date'});
          } else {
            objStore = db.transaction.objectStore('notes');
          }
    
        }
  
        request.onerror = function(event) {
          console.log(`error opening database ${event.target.errorCode}`);
          reject(`error opening database ${event.target.errorCode}`);
        }
        
        request.onsuccess = function(event) {
          db = request.result;
          resolve(db)
        }
      })
    }

    getRecords(start, end, db, type) {

      return new Promise((resolve, reject) => {
        let objectStoreName = (type === TYPE_TEMPERATURE) ? 'temperature' : 'precipitation'
        let tx = db.transaction(objectStoreName, 'readonly');
        // Retrieve the sticky notes object store to run our cursor query on
        let store = tx.objectStore(objectStoreName);
        let req = store.openCursor(null, 'next');
    
        let allRecords = [];
        req.onsuccess = function(event) {
          let cursor = event.target.result;
          if (cursor != null) {
            // If the cursor isn't null, we got an IndexedDB item. Add it to the
            // note array and have the cursor continue!
            allRecords.push(cursor.value);
            cursor.continue();
          } else {
            // If we have a null cursor, it means we've gotten all the items in
            // the store, so resolve with those notes!
            resolve(allRecords);
          }
        }
    
        // If we get an error, reject with our error message
        req.onerror = function(event) {
          reject(`error in cursor request ${event.target.errorCode}`);
        }
      });
    }

    fetchData(start, end, type, callback) {

      this.setupDB('test', this.db, type)
      .then((db) => {
        this.db = db
        this.getRecords(start, end, this.db, type)
        .then((records) => {
          callback(SUCCESS_RECORDS_FOUND, this.formatData(records))
        })
        .catch(() => callback(ERROR_DB_NO_DATA))
      })
      .catch(() => callback(ERROR_DB_FAIL))
    }

    saveData(data, type, callback) {

      this.setupDB('test', this.db, type)
      .then((db) => {
        this.db = db
        let promises = []
        let newRecord = []
        let currentYear = null
        let currentMonth = null
        for(let i=0; i<data.length; i++) {
          let dateValue = data[i]['t'].split('-')
          if(i == 0) {
            currentYear = dateValue[0]
            currentMonth = dateValue[1]
            newRecord.push(data[i])
          } else if(currentYear != dateValue[0] || currentMonth != dateValue[1] || i == data.length-1) {
            promises.push(
              this.saveRecord(newRecord, this.db, type, currentYear, currentMonth)
              // .then((result) => { console.log(result)})
              // .catch((error) => { console.log(error)})
            )
            newRecord = []
            currentYear = dateValue[0]
            currentMonth = dateValue[1]
            newRecord.push(data[i])
          } else {
            newRecord.push(data[i])
          }
        }

        Promise.all(promises)
        .then((result) => { console.log('all records were saved') })
        .catch(() => callback(ERROR_DB_NO_DATA))
      })
      .catch(() => callback(ERROR_DB_FAIL))
    }

    saveRecord(data, db, type, year, month) {
      
      return new Promise((resolve, reject) => {
        let objectStoreName = (type === TYPE_TEMPERATURE) ? 'temperature' : 'precipitation'
        let record = {
          date: year+'-'+month,
          data: data
        }
        let tx = db.transaction(objectStoreName, 'readwrite')
        let store = tx.objectStore(objectStoreName)
        store.add(record)
        // Wait for the database transaction to complete. If it is successful,
        // resolve. Otherwise, reject with our error message.
        tx.oncomplete = resolve(year+'-'+month);
        tx.onerror = function(event) {
          reject(`error storing note ${event.target.errorCode}`);
        }
      })
    }

    formatData(data) {

      let result = []
      for(let i=0; i< data.length; i++) {
        let record = data[i].data
        for(let j=0; j< record.length; j++) {
          result.push(record[j])
        }
      }
      return result
    }
  }