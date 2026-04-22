<template>
  <button>{{props.text}}</button>
</template>
<script setup lang="ts">
import {ISetupComponentProps} from "./SetupComponent";

const props = defineProps<ISetupComponentProps>()
</script>
