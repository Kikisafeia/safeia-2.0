import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserPlanData {
  planType: string;
  tokensUsed: number;
  tokensLimit: number;
  planStartDate: string;
  planEndDate: string;
}

const DashboardStats: React.FC = () => {
  const { currentUser } = useAuth();
  const [planData, setPlanData] = useState<UserPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPlanData = async () => {
      try {
        if (!currentUser) return;

        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as UserPlanData;
          setPlanData(userData);
        } else {
          setError('No se encontró información del plan');
        }
      } catch (err) {
        console.error('Error fetching plan data:', err);
        setError('Error al cargar la información del plan');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlanData();
  }, [currentUser]);

  const getTokensPercentage = () => {
    if (!planData) return 0;
    return Math.round((planData.tokensUsed / planData.tokensLimit) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (!planData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Plan Actual: <span className="text-blue-600">{planData.planType}</span>
          </h2>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Inicio del Plan:</span>
            <span>{new Date(planData.planStartDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Fin del Plan:</span>
            <span>{new Date(planData.planEndDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Token Usage */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Uso de Tokens</h3>
          
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {getTokensPercentage()}% Utilizado
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {planData.tokensUsed} / {planData.tokensLimit}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
              <div
                style={{ width: `${getTokensPercentage()}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              ></div>
            </div>
          </div>

          {getTokensPercentage() > 80 && (
            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              ⚠️ Tu uso de tokens está llegando al límite. Considera actualizar tu plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
