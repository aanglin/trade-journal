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

const DEFAULT_USER_SETTINGS = {
  startingBalance: "",
  accountInitialized: false,
  tradeHistoryCollapsed: false,
};

/*
  Firestore structure:

  users/{userId}
  users/{userId}/trades/{tradeId}
*/

export async function createUserProfile(user) {
  requireUserId(user?.uid);

  const userReference = getUserReference(user.uid);
  const userSnapshot = await getDoc(userReference);

  const profileData = {
    displayName: cleanText(user.displayName),
    email: cleanText(user.email).toLowerCase(),
    updatedAt: serverTimestamp(),
  };

  if (!userSnapshot.exists()) {
    profileData.createdAt = serverTimestamp();
  }

  await setDoc(userReference, profileData, {
    merge: true,
  });
}

export async function getUserSettings(userId) {
  requireUserId(userId);

  const userReference = getUserReference(userId);
  const snapshot = await getDoc(userReference);

  if (!snapshot.exists()) {
    return {
      ...DEFAULT_USER_SETTINGS,
    };
  }

  const data = snapshot.data();

  const savedBalance = Number(data.startingBalance);

  return {
    startingBalance:
      Number.isFinite(savedBalance) && savedBalance >= 0
        ? savedBalance
        : "",

    accountInitialized:
      data.accountInitialized === true,

    tradeHistoryCollapsed:
      data.tradeHistoryCollapsed === true,
  };
}

export async function saveUserSettings(
  userId,
  settings = {}
) {
  requireUserId(userId);

  const startingBalance = getValidNumber(
    settings.startingBalance,
    "Starting balance",
    {
      minimum: 0,
    }
  );

  const userReference = getUserReference(userId);

  const normalizedSettings = {
    startingBalance,

    accountInitialized:
      settings.accountInitialized === true,

    tradeHistoryCollapsed:
      settings.tradeHistoryCollapsed === true,

    updatedAt: serverTimestamp(),
  };

  await setDoc(
    userReference,
    normalizedSettings,
    {
      merge: true,
    }
  );

  return {
    startingBalance,

    accountInitialized:
      normalizedSettings.accountInitialized,

    tradeHistoryCollapsed:
      normalizedSettings.tradeHistoryCollapsed,
  };
}

export async function getUserTrades(userId) {
  requireUserId(userId);

  const tradesReference =
    getTradesCollectionReference(userId);

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

export async function addUserTrade(
  userId,
  trade
) {
  requireUserId(userId);

  const normalizedTrade =
    normalizeTradeData(trade);

  const tradesReference =
    getTradesCollectionReference(userId);

  const documentReference = await addDoc(
    tradesReference,
    {
      ...normalizedTrade,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return {
    id: documentReference.id,
    ...normalizedTrade,
  };
}

export async function updateUserTrade(
  userId,
  tradeId,
  trade
) {
  requireUserId(userId);
  requireTradeId(tradeId);

  const normalizedTrade =
    normalizeTradeData(trade);

  const tradeReference = getTradeReference(
    userId,
    tradeId
  );

  await updateDoc(tradeReference, {
    ...normalizedTrade,
    updatedAt: serverTimestamp(),
  });

  return {
    id: tradeId,
    ...normalizedTrade,
  };
}

export async function deleteUserTrade(
  userId,
  tradeId
) {
  requireUserId(userId);
  requireTradeId(tradeId);

  const tradeReference = getTradeReference(
    userId,
    tradeId
  );

  await deleteDoc(tradeReference);

  return tradeId;
}

function normalizeTradeData(trade = {}) {
  const ticker = cleanText(trade.ticker)
    .toUpperCase()
    .slice(0, 12);

  if (!ticker) {
    throw new Error("A ticker symbol is required.");
  }

  const date = cleanText(trade.date);

  if (!isValidDateString(date)) {
    throw new Error(
      "A valid trade date is required."
    );
  }

  const direction = cleanText(
    trade.direction
  ).toUpperCase();

  if (
    direction !== "CALL" &&
    direction !== "PUT"
  ) {
    throw new Error(
      "Trade direction must be CALL or PUT."
    );
  }

  const entryPrice = getValidNumber(
    trade.entryPrice,
    "Entry price",
    {
      minimum: 0,
    }
  );

  const exitPrice = getValidNumber(
    trade.exitPrice,
    "Exit price",
    {
      minimum: 0,
    }
  );

  const contracts = getValidNumber(
    trade.contracts,
    "Contracts",
    {
      minimum: 1,
      integer: true,
    }
  );

  const fees = getValidNumber(
    trade.fees ?? 0,
    "Other fees",
    {
      minimum: 0,
    }
  );

  return {
    ticker,
    date,
    direction,
    entryPrice,
    exitPrice,
    contracts,
    fees,
    setup: cleanText(trade.setup),
    notes: cleanText(trade.notes),
  };
}

function getUserReference(userId) {
  return doc(db, "users", userId);
}

function getTradesCollectionReference(userId) {
  return collection(
    db,
    "users",
    userId,
    "trades"
  );
}

function getTradeReference(
  userId,
  tradeId
) {
  return doc(
    db,
    "users",
    userId,
    "trades",
    tradeId
  );
}

function requireUserId(userId) {
  if (
    typeof userId !== "string" ||
    !userId.trim()
  ) {
    throw new Error(
      "A signed-in user is required."
    );
  }
}

function requireTradeId(tradeId) {
  if (
    typeof tradeId !== "string" ||
    !tradeId.trim()
  ) {
    throw new Error(
      "A valid trade ID is required."
    );
  }
}

function cleanText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function getValidNumber(
  value,
  fieldName,
  {
    minimum = Number.NEGATIVE_INFINITY,
    integer = false,
  } = {}
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(
      `${fieldName} must be a valid number.`
    );
  }

  if (number < minimum) {
    throw new Error(
      `${fieldName} must be at least ${minimum}.`
    );
  }

  if (
    integer &&
    !Number.isInteger(number)
  ) {
    throw new Error(
      `${fieldName} must be a whole number.`
    );
  }

  return number;
}

function isValidDateString(dateString) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return false;
  }

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}