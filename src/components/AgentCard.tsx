import React from 'react';
import { Agent } from '../types/agents';
import { Bot, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

export default function AgentCard({ agent, onSelect }: AgentCardProps) {
  const getStatusIcon = () => {
    switch (agent.status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-safeia-yellow/30 p-6 cursor-pointer"
      onClick={() => onSelect(agent)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-safeia-yellow/10 p-3 rounded-lg">
            <Bot className="w-6 h-6 text-safeia-yellow" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-safeia-black">{agent.name}</h3>
            <p className="text-sm text-gray-600">{agent.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm text-gray-500 capitalize">{agent.status}</span>
        </div>
      </div>
      
      <p className="mt-4 text-gray-600">{agent.description}</p>
      
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-safeia-black mb-2">Capacidades:</h4>
        <div className="flex flex-wrap gap-2">
          {agent.capabilities.map((capability, index) => (
            <span 
              key={index}
              className="bg-safeia-yellow/10 text-safeia-black px-2 py-1 rounded-md text-xs"
            >
              {capability}
            </span>
          ))}
        </div>
      </div>

      {agent.lastActive && (
        <p className="mt-4 text-xs text-gray-500">
          Última actividad: {new Date(agent.lastActive).toLocaleString()}
        </p>
      )}
    </div>
  );
}
