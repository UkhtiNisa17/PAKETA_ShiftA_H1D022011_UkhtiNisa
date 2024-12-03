// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import router from "@/router";
import { auth } from "@/utils/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  User,
} from "firebase/auth";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { alertController } from "@ionic/vue";

export const useAuthStore = defineStore("auth", () => {
  // State untuk menyimpan informasi user
  const user = ref<User | null>(null);

  // Komputasi untuk mengecek autentikasi
  const isAuth = computed(() => !!user.value);

  // Login menggunakan Google
  const loginWithGoogle = async () => {
    try {
      // Inisialisasi GoogleAuth
      await GoogleAuth.initialize({
        clientId:
          "626147529814-46midj2mehqifolafkqsdal0frp4ik6j.apps.googleusercontent.com",
        scopes: ["profile", "email"],
        grantOfflineAccess: true,
      });

      // Mendapatkan pengguna Google
      const googleUser = await GoogleAuth.signIn();

      // Mendapatkan idToken dari Google
      const idToken = googleUser.authentication.idToken;

      // Membuat kredensial untuk Firebase
      const credential = GoogleAuthProvider.credential(idToken);

      // Melakukan sign in ke Firebase
      const result = await signInWithCredential(auth, credential);

      // Menyimpan user ke state
      user.value = result.user;

      // Redirect ke halaman utama
      await router.push("/home");
    } catch (error: any) {
      console.error("Google sign-in error:", error.message);

      // Menampilkan alert jika login gagal
      const alert = await alertController.create({
        header: "Login Gagal!",
        message:
          "Terjadi kesalahan saat login dengan Google. Silakan coba lagi nanti.",
        buttons: ["OK"],
      });
      await alert.present();
    }
  };

  // Logout dari aplikasi
  const logout = async () => {
    try {
      // Melakukan sign-out dari Firebase dan Google
      await signOut(auth);
      await GoogleAuth.signOut();

      // Reset state user
      user.value = null;

      // Redirect ke halaman login
      await router.replace("/login");
    } catch (error: any) {
      console.error("Sign-out error:", error.message);

      // Menampilkan alert jika logout gagal
      const alert = await alertController.create({
        header: "Logout Gagal!",
        message: "Terjadi kesalahan saat logout. Silakan coba lagi.",
        buttons: ["OK"],
      });
      await alert.present();
    }
  };

  // Memantau perubahan status autentikasi pengguna
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });

  // Mengembalikan state dan fungsi
  return { user, isAuth, loginWithGoogle, logout };
});
