import { ContractReceipt, Event, Contract } from 'ethers'
import { Result } from 'ethers/lib/utils';

export const filterEvents = (
    blockEvents: ContractReceipt,
    name: String
  ): Array<Event> => {
    return blockEvents.events?.filter((event) => event.event === name) || [];
  };
  
  export const decodeEvents = <T extends Contract>(
    token: T,
    events: Array<Event>
  ): Array<Result> => {
    const decodedEvents = [];
    for (const event of events) {
      const getEventInterface = token.interface.getEvent(event.event || "");
      decodedEvents.push(
        token.interface.decodeEventLog(getEventInterface, event.data, event.topics)
      );
    }
    return decodedEvents;
  };