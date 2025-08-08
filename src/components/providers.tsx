"use client";

import { DataProvider } from "@/app/data-provider";
import { FirebaseAppProvider, AuthProvider, FirestoreProvider } from "reactfire";
import { auth, db, app } from "@/lib/firebase";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAppProvider firebaseApp={app}>
      <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={db}>
          <DataProvider>{children}</DataProvider>
        </FirestoreProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  );
}
