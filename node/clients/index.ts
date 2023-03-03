import { IOClients } from '@vtex/api';

import Nosto from './nosto';
import Catalog from './catalog';
import Products from './products';
import Scheduler from './scheduler';
import NostoEvents from './nosto-events';
import { generateEventSender } from '../utils/events';

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get nosto() {
    return this.getOrSet('nosto', Nosto);
  }

  public get catalog() {
    return this.getOrSet('catalog', Catalog);
  }

  public get products() {
    return this.getOrSet('products', Products);
  }

  public get scheduler() {
    return this.getOrSet('scheduler', Scheduler);
  }

  public get nostoEvents() {
    return this.getOrSet('nosto-events', NostoEvents);
  }

  public get eventSender() {
    return generateEventSender(this.events, this.nostoEvents);
  }
}
