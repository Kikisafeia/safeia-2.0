import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface TokenTransaction {
  timestamp: string;
  amount: number;
  balance: number;
  description?: string;
}

export default function TokenHistory() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return;

      try {
        const historyRef = collection(db, 'users', currentUser.uid, 'tokenHistory');
        const q = query(
          historyRef,
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => ({
          ...doc.data() as TokenTransaction,
          id: doc.id
        }));

        setHistory(transactions);
      } catch (err) {
        console.error('Error al cargar historial:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Historial de Uso
        </h3>
        <div className="mt-6 flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {history.map((transaction, index) => (
              <li key={index} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description || 'Uso de tokens'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.amount < 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount} tokens
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Balance: {transaction.balance} tokens
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
