
// event bus
import mitt from 'mitt';

class Context {
  constructor() {
    this.event_bus =  new mitt();
  }
}

export default Context;
