// src/utils/firestore.ts
import { auth, db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// Interface untuk data balapan
export interface Race {
  id?: string;
  name: string; // Nama balapan
  description: string; // Deskripsi balapan
  trackDetails: string; // Detail lintasan (misalnya lokasi, panjang lintasan)
  scheduledAt: Timestamp; // Waktu jadwal balapan
  status: boolean; // Status: true jika selesai, false jika aktif
  createdAt: Timestamp; // Tanggal pembuatan
  updatedAt: Timestamp; // Tanggal pembaruan
}

// Operasi CRUD untuk balapan
export const firestoreService = {
  // Mendapatkan referensi koleksi balapan
  getRaceRef() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("User not authenticated");
    return collection(db, "users", uid, "races");
  },

  // Menambahkan balapan baru
  async addRace(race: Omit<Race, "id" | "createdAt" | "updatedAt">) {
    try {
      const raceRef = this.getRaceRef();
      const docRef = await addDoc(raceRef, {
        ...race,
        status: false, // Status balapan (aktif saat baru ditambahkan)
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error Tambah Race:", error);
      throw error;
    }
  },

  // Mendapatkan daftar balapan
  async getRaces(): Promise<Race[]> {
    try {
      const raceRef = this.getRaceRef();
      const q = query(raceRef, orderBy("scheduledAt", "asc")); // Urutkan berdasarkan waktu jadwal
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Race)
      );
    } catch (error) {
      console.error("Error Get Races:", error);
      throw error;
    }
  },

  // Mengupdate balapan
  async updateRace(id: string, race: Partial<Race>) {
    try {
      const raceRef = this.getRaceRef();
      const docRef = doc(raceRef, id);
      await updateDoc(docRef, {
        ...race,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error Update Race:", error);
      throw error;
    }
  },

  // Menghapus balapan
  async deleteRace(id: string) {
    try {
      const raceRef = this.getRaceRef();
      const docRef = doc(raceRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error Delete Race:", error);
      throw error;
    }
  },

  // Mengupdate status balapan (misalnya untuk menandai sebagai selesai atau aktif)
  async updateStatus(id: string, status: boolean) {
    try {
      const raceRef = this.getRaceRef();
      const docRef = doc(raceRef, id);
      await updateDoc(docRef, {
        status: status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error Update Status:", error);
      throw error;
    }
  },
};
