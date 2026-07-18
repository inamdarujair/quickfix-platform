import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { api, formatApiError } from "@/lib/api";
import { BOOKING_MODAL } from "@/constants/testIds";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export const BookingModal = ({ service, open, onOpenChange, onBooked }) => {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setDate("");
    setTime("");
    setAddress("");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!date || !time || address.trim().length < 5) {
      toast.error("Please choose a date, time slot and enter a valid address");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/bookings", {
        service_id: service.id,
        scheduled_date: date,
        scheduled_time: time,
        address,
        notes,
      });
      toast.success("Booking request sent!");
      reset();
      onOpenChange(false);
      onBooked?.(data);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#12121A] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Book {service?.title}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Choose a preferred date and time. The provider will confirm your booking shortly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-zinc-400">Date</Label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid={BOOKING_MODAL.dateInput}
              className="mt-1.5 h-9 w-full rounded-md border border-white/10 bg-transparent px-3 text-sm text-white [color-scheme:dark] focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Time Slot</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger data-testid={BOOKING_MODAL.timeInput} className="mt-1.5 border-white/10 bg-transparent text-white">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#1C1C22] text-white">
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs text-zinc-400">Service Address</Label>
          <Textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            data-testid={BOOKING_MODAL.addressInput}
            placeholder="Enter full address where the service is needed"
            className="mt-1.5 min-h-[70px] border-white/10 bg-transparent text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50"
          />
        </div>

        <div>
          <Label className="text-xs text-zinc-400">Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            data-testid={BOOKING_MODAL.notesInput}
            placeholder="Anything the provider should know?"
            className="mt-1.5 min-h-[60px] border-white/10 bg-transparent text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50"
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            data-testid={BOOKING_MODAL.cancelButton}
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            data-testid={BOOKING_MODAL.submitButton}
            className="bg-blue-500 text-white hover:bg-blue-400"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
