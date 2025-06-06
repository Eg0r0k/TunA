import { NoteWithOctave } from "@/types/tuner/notes";
import { db, type InstrumentScheme, type TuningScheme } from "./db";

export const getInstruments = async (): Promise<InstrumentScheme[]> => {
  return await db.instruments.toArray();
};
export const addCustomTuning = async (
  instrument_id: string,
  name: string,
  notes: NoteWithOctave[]
): Promise<void> => {
  await db.tunings.add({
    instrument_id,
    name,
    notes,
    custom: true,
  });
};
export const getTunings = async (): Promise<TuningScheme[]> => {
  return await db.tunings.toArray();
};

export const updateTuning = async (
  id: number,
  updatedData: Partial<TuningScheme>
): Promise<void> => {
  await db.tunings.update(id, updatedData);
};

export const deleteTuning = async (id: number): Promise<void> => {
  await db.tunings.delete(id);
};

export const getTuningsByInstrument = async (
  instrument_id: string
): Promise<TuningScheme[]> => {
  return await db.tunings
    .where("instrument_id")
    .equals(instrument_id)
    .toArray();
};
