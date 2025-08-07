// Type definitions for Firebase v9+ modular SDK

import { FirebaseApp } from 'firebase/app';
import { Auth, User } from 'firebase/auth';
import { Firestore, Timestamp, DocumentData, QueryDocumentSnapshot, QuerySnapshot, CollectionReference, DocumentReference, DocumentSnapshot, UpdateData } from 'firebase/firestore';

// Firebase App
declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, unknown>;
    // Add app properties as needed
  }

  export function initializeApp(config: object, name?: string): FirebaseApp;
  export function getApp(name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
}

// Firebase Auth
declare module 'firebase/auth' {
  import { FirebaseApp } from 'firebase/app';

  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    // Add other user properties as needed
  }

  export function getAuth(app?: FirebaseApp): any;
  // Add other auth exports as needed
}

// Firebase Firestore
declare module 'firebase/firestore' {
  export class Timestamp {
    static now(): Timestamp;
    toDate(): Date;
    toMillis(): number;
    isEqual(other: Timestamp): boolean;
    // Add other Timestamp methods as needed
  }

  // Firestore collection/document types
  export interface DocumentData {
    [field: string]: any;
  }

  export interface QueryDocumentSnapshot<T = DocumentData> {
    id: string;
    data(): T;
  }

  export interface QuerySnapshot<T = DocumentData> {
    docs: QueryDocumentSnapshot<T>[];
    empty: boolean;
    size: number;
    forEach(callback: (doc: QueryDocumentSnapshot<T>) => void): void;
  }

  export interface CollectionReference<T = DocumentData> {
    id: string;
    path: string;
    // Add other collection methods as needed
  }

  export interface DocumentReference<T = DocumentData> {
    id: string;
    path: string;
    // Add other document methods as needed
  }

  export function collection(
    firestore: any,
    path: string,
    ...pathSegments: string[]
  ): CollectionReference;

  export function doc(
    firestore: any,
    path: string,
    ...pathSegments: string[]
  ): DocumentReference;

  export function getDoc<T = DocumentData>(
    docRef: DocumentReference<T>
  ): Promise<DocumentSnapshot<T>>;

  export function getDocs<T = DocumentData>(
    collectionRef: CollectionReference<T>
  ): Promise<QuerySnapshot<T>>;

  export function setDoc<T = DocumentData>(
    docRef: DocumentReference<T>,
    data: T
  ): Promise<void>;

  export function updateDoc(
    docRef: DocumentReference,
    data: UpdateData
  ): Promise<void>;

  export function deleteDoc(docRef: DocumentReference): Promise<void>;

  export interface UpdateData {
    [field: string]: any;
  }

  export interface DocumentSnapshot<T = DocumentData> {
    exists(): boolean;
    data(): T | undefined;
    id: string;
  }
}
