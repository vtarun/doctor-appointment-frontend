import type { Slot } from "@/features/availability/types";

interface AvailabilitySlotsProps{
    slots: Slot[],
    handleSelectSlot: (slot: Slot) => void,
    selectedSlot: Slot | null
}
const AvailabilitySlots = ({slots, handleSelectSlot, selectedSlot}: AvailabilitySlotsProps) => {

if(slots.length === 0){
    return <p>No appointments are currently available.</p>;
}

  return (
    <div style={{display: 'flex'}}>
        {slots.map((slot: Slot) => {
            const isSelected = selectedSlot?.startTime === slot.startTime;
            return (<button type='button' key={slot.startTime} onClick={() => handleSelectSlot(slot)} className={isSelected ? 'slot selecetd' : 'slot'}>
                <span>{new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}</span>
            </button>) 
            }
        )}
    </div>
    
  )
}

export default AvailabilitySlots;
