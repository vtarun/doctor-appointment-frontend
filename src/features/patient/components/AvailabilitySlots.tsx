import type { Slot } from "@/features/availability/types";

interface AvailabilitySlotsProps{
    slots: Slot[],
    handleSelectSlot: (slot: Slot) => void,
    selectedSlot: Slot | null
}

const groupSlots = (slots: Slot[]): Record<string, Slot[]> => {
    return slots.reduce<Record<string, Slot[]>>((groupSlots, slot) => {
            const dateKey = new Date(slot.startTime).toLocaleDateString('en-CA');
            if(!groupSlots[dateKey]){
                groupSlots[dateKey] = [];
            }
            groupSlots[dateKey].push(slot);
        return groupSlots;
    }, {});
}

const AvailabilitySlots = ({slots, handleSelectSlot, selectedSlot}: AvailabilitySlotsProps) => {

    if(slots.length === 0){
        return <p>No appointments are currently available.</p>;
    }

    const groupedSlots = groupSlots(slots);

  return (
    <div>
        {Object.entries(groupedSlots).map(([date, dateSlots]) => {
            return <div key={date}>
                    <h3>{new Date(date).toLocaleDateString()}</h3>
                    <div className="slot-list">

                    {dateSlots.map((slot: Slot) => {
                        const isSelected = selectedSlot?.startTime === slot.startTime;
                        return (<button type='button' key={slot.startTime} onClick={() => handleSelectSlot(slot)} className={isSelected ? 'slot selected' : 'slot'}>
                            <span>{new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}</span>
                        </button>) 
                        }
                    )}                
                </div>
            </div>
        })
        }
    </div>
    
  )
}

export default AvailabilitySlots;
