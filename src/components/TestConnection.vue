<!-- TestConnection.vue -->
<template>
  <div class="p-4">
    <button 
      @click="testDifyConnection" 
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Probar Conexión con Dify
    </button>
    <div v-if="status" class="mt-4 p-4 rounded" :class="statusClass">
      {{ status }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { testConnection } from '../services/difyApi';

const status = ref('');
const statusClass = ref('');

const testDifyConnection = async () => {
  try {
    status.value = 'Probando conexión...';
    statusClass.value = 'bg-yellow-100 text-yellow-800';
    
    const workingUrl = await testConnection();
    
    status.value = `¡Conexión exitosa! URL funcionando: ${workingUrl}`;
    statusClass.value = 'bg-green-100 text-green-800';
  } catch (error) {
    status.value = `Error de conexión: ${error.message}`;
    statusClass.value = 'bg-red-100 text-red-800';
  }
};
</script>
