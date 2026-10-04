import { type NoteWithOctave } from "@/types/tuner/notes";
import Dexie, { EntityTable } from "dexie";

export interface InstrumentScheme {
  id: string;
  name: string;
}

export interface TuningScheme {
  id?: number;
  instrument_id: string;
  name: string;
  notes: NoteWithOctave[];
  custom: boolean;
}

export const db = new Dexie("tuningsDB") as Dexie & {
  instruments: EntityTable<InstrumentScheme, "id">;
  tunings: EntityTable<TuningScheme, "id">;
};

db.version(2).stores({
  instruments: "id, name",
  tunings: "++id, instrument_id, name, notes, custom",
});

// Only fields used in queries need an index
db.version(3).stores({
  instruments: "id",
  tunings: "++id, instrument_id",
});
