<script setup lang="ts"></script>

<template>
  <div class="min-h-full flex flex-col">
    <router-link :to="{ name: 'manageMember' }">會員</router-link>
    <router-link :to="{ name: 'manageAgent' }">代理</router-link>
    <router-link :to="{ name: 'manageTeam' }">團隊</router-link>
    <router-view />
  </div>
</template>

<style scoped></style>
