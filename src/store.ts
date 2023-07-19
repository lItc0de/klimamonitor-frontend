class Store {
  private storeVersion: number;
  private idb: IDBFactory;
  private db;
  needsUpdate: boolean;
  frames: string[];

  constructor(storeVersion: number) {
    this.storeVersion = storeVersion;
    this.idb = window.indexedDB;


    // const browserVersion = localStorage.getItem('storeVersion');
    // const versionsEqual = this.storeVersion === browserVersion;
    this.frames = JSON.parse(localStorage.getItem('frames') || "[]");

    this.needsUpdate = !versionsEqual || this.frames.length === 0;

    console.log('lol');
    console.log(this.needsUpdate);


  }

  async openDB() {
    return new Promise((resolve) => {
      const request = this.idb.open('klimamonitor', this.storeVersion);
      request.addEventListener('success', (ev) => {
        this.db = ev.target.;
      })
    })
  }

  update(frames: string[]) {
    localStorage.setItem('storeVersion', this.storeVersion);
    localStorage.setItem('frames', JSON.stringify(frames));
    this.frames = frames;
  }
}

export default Store;
