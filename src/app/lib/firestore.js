import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";

function requireUserId(userId) {
  if (!userId) {
    throw new Error("A signed-in user is required.");
  }
}

/*
  Firestore structure:

  users/{userId}
  users/{userId}/trades/{tradeId}
*/

export async function createUserProfile(user) {
  requireUserId(user?.uid);

  const userReference = doc(db, "users", user.uid);

  await setDoc(
    userReference,
    {
      displayName: user.displayName || "",
      email: user.email || "",
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

export async function getUserSettings(userId) {
  requireUserId(userId);

  const userReference = doc(db, "users", userId);
  const snapshot = await getDoc(userReference);

  if (!snapshot.exists()) {
    return {
      startingBalance: "",
      accountInitialized: false,
      tradeHistoryCollapsed: false,
    };
  }

  const data = snapshot.data();

  return {
    startingBalance: data.startingBalance ?? "",
    accountInitialized: data.accountInitialized ?? false,
    tradeHistoryCollapsed:
      data.tradeHistoryCollapsed ?? false,
  };
}

export async function saveUserSettings(userId, settings) {
  requireUserId(userId);

  const userReference = doc(db, "users", userId);

  await setDoc(
    userReference,
    {
      startingBalance:
        Number(settings.startingBalance) || 0,

      accountInitialized:
        Boolean(settings.accountInitialized),

      tradeHistoryCollapsed:
        Boolean(settings.tradeHistoryCollapsed),

      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

export async function getUserTrades(userId) {
  requireUserId(userId);

  const tradesReference = collection(
    db,
    "users",
    userId,
    "trades"
  );

  const tradesQuery = query(
    tradesReference,
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(tradesQuery);

  return snapshot.docs.map((tradeDocument) => ({
    id: tradeDocument.id,
    ...tradeDocument.data(),
  }));
}

export async function addUserTrade(userId, trade) {
  requireUserId(userId);

  const tradesReference = collection(
    db,
    "users",
    userId,
    "trades"
  );

  const documentReference = await addDoc(
    tradesReference,
    {
      ticker: trade.ticker,
      date: trade.date,
      direction: trade.direction,
      entryPrice: Number(trade.entryPrice),
      exitPrice: Number(trade.exitPrice),
      contracts: Number(trade.contracts),
      fees: Number(trade.fees || 0),
      setup: trade.setup || "",
      notes: trade.notes || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return {
    id: documentReference.id,
    ...trade,
  };
}

export async function updateUserTrade(
  userId,
  tradeId,
  trade
) {
  if (!userId) {
    throw new Error("A signed-in user is required.");
  }

  if (!tradeId) {
    throw new Error("A trade ID is required.");
  }

  const tradeReference = doc(
    db,
    "users",
    userId,
    "trades",
    tradeId
  );

  await updateDoc(tradeReference, {
    ticker: trade.ticker.trim().toUpperCase(),
    date: trade.date,
    direction: trade.direction,
    entryPrice: Number(trade.entryPrice),
    exitPrice: Number(trade.exitPrice),
    contracts: Number(trade.contracts),
    fees: Number(trade.fees || 0),
    setup: trade.setup || "",
    notes: trade.notes || "",
    updatedAt: serverTimestamp(),
  });
}
// export async function updateUserTrade(
//   userId,
//   tradeId,
//   changes
// ) {
//   requireUserId(userId);

//   const tradeReference = doc(
//     db,
//     "users",
//     userId,
//     "trades",
//     tradeId
//   );

//   await updateDoc(tradeReference, {
//     ...changes,
//     updatedAt: serverTimestamp(),
//   });
// }

export async function deleteUserTrade(
  userId,
  tradeId
) {
  requireUserId(userId);

  const tradeReference = doc(
    db,
    "users",
    userId,
    "trades",
    tradeId
  );

  await deleteDoc(tradeReference);
}